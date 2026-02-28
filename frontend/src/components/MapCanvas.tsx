import React, { useRef, useEffect, useCallback } from 'react';
import { TagNode, Idea, ROOT_COLORS } from '../mockData';
import { Camera, worldToScreen } from '../lib/camera';
import { shouldDrawNode } from '../lib/lod';
import { hitTestIdea } from '../lib/hittest';

/** Genera un color HSL determinista a partir de un string */
function colorForKey(key: string): string {
  if (ROOT_COLORS[key]) return ROOT_COLORS[key];
  // Hash del string → tono en la rueda de color
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) & 0xffff;
  const hue = (h * 137.508) % 360;
  return `hsl(${Math.round(hue)},65%,62%)`;
}

interface MapCanvasProps {
  camera: Camera;
  setCamera: (c: Camera) => void;
  tags: TagNode[];
  ideas: Idea[];
  focusTagPath: string | null;
  selectedTag: TagNode | null;
  selectedIdea: Idea | null;
  onSelectTag: (tag: TagNode) => void;
  onSelectIdea: (idea: Idea) => void;
  onFocusTag: (tag: TagNode) => void;
  onNavigateToNote: (idea: Idea) => void;
  width: number;
  height: number;
}

/** Returns the world-space radius of a tag node. Always uses the precomputed radius. */
function tagRadius(tag: TagNode): number {
  return tag.radius ?? 300;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  camera,
  setCamera,
  tags,
  ideas,
  focusTagPath: _focusTagPath,
  selectedTag: _selectedTag,
  selectedIdea,
  onSelectTag: _onSelectTag,
  onSelectIdea,
  onFocusTag: _onFocusTag,
  onNavigateToNote,
  width,
  height,
}) => {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const animRef     = useRef<number | null>(null);

  // Pan state
  const dragging    = useRef(false);
  const lastPos     = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inercia pan
  const velocity    = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const lastTime    = useRef<number>(0);

  // Zoom con inercia (lerp hacia targetZoom)
  const targetZoom  = useRef(camera.zoom);
  const cameraRef   = useRef(camera);
  cameraRef.current = camera;

  // Pin hover
  const hoveredIdea = useRef<string | null>(null);

  // Dibuja el canvas
  const draw = useCallback(() => {
    const rawCtx = canvasRef.current?.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;
    ctx.clearRect(0, 0, width, height);

    // ── Fondo oscuro degradado ───────────────────────────────────────────────
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.75);
    bgGrad.addColorStop(0,   '#1a1d2e');
    bgGrad.addColorStop(1,   '#0d0f1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Estrellas de fondo (posición determinista por seed)
    ctx.save();
    const starCount = 120;
    for (let i = 0; i < starCount; i++) {
      const sx = ((i * 2971 + 13) % width);
      const sy = ((i * 1873 + 7)  % height);
      const sr = (i % 3 === 0) ? 1.2 : 0.6;
      const sa = 0.2 + (i % 5) * 0.07;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255,255,255,${sa})`;
      ctx.fill();
    }
    ctx.restore();

    const MAX_LEVEL = 3;

    // ── Pre-computes ─────────────────────────────────────────────────────────
    const childrenMap = new Map<string | null, TagNode[]>();
    tags.forEach(tag => {
      const key = tag.parentPath ?? null;
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(tag);
    });

    const ideasByTag = new Map<string, Idea[]>();
    ideas.forEach(idea => {
      idea.tagPaths.forEach(tp => {
        if (!ideasByTag.has(tp)) ideasByTag.set(tp, []);
        ideasByTag.get(tp)!.push(idea);
      });
    });

    // ── Helpers ──────────────────────────────────────────────────────────────
    function fadeIn(screenR: number, threshold = 14): number {
      return Math.min(1, Math.max(0, (screenR - threshold) / threshold));
    }
    function fadeOut(value: number, start: number, end: number): number {
      return Math.min(1, Math.max(0, 1 - (value - start) / (end - start)));
    }
    function fitText(text: string, maxPx: number): string {
      if (ctx.measureText(text).width <= maxPx) return text;
      let t = text;
      while (t.length > 1 && ctx.measureText(t + '…').width > maxPx) t = t.slice(0, -1);
      return t + '…';
    }

    // ── PASS 1: Círculos ─────────────────────────────────────────────────────
    function drawCircle(tag: TagNode, level: number) {
      if (level >= MAX_LEVEL) return;
      const worldR = tagRadius(tag);
      const screenR = worldR * camera.zoom;
      if (!shouldDrawNode(worldR, camera.zoom)) return;

      const sc   = worldToScreen(camera, tag.x, tag.y, width, height);
      const rootKey = tag.path.split('/')[0];
      const color   = colorForKey(rootKey);
      const alpha   = fadeIn(screenR);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, screenR, 0, 2 * Math.PI);

      if (level === 0) {
        // Gradiente radial tipo planeta — relleno sólido con highlight
        const grad = ctx.createRadialGradient(
          sc.x - screenR * 0.35, sc.y - screenR * 0.35, screenR * 0.05,
          sc.x, sc.y, screenR
        );
        grad.addColorStop(0,   color + 'cc');   // highlight claro
        grad.addColorStop(0.5, color + '99');
        grad.addColorStop(1,   color + 'dd');   // borde más saturado
        ctx.fillStyle = grad;
        ctx.fill();

        // Borde luminoso fuerte
        ctx.shadowColor = color;
        ctx.shadowBlur  = Math.max(24, screenR * 0.12);
        ctx.lineWidth   = Math.max(2, screenR * 0.008);
        ctx.strokeStyle = color + 'ff';
        ctx.stroke();
        ctx.shadowBlur  = 0;

        // Halo exterior tenue
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, screenR * 1.05, 0, 2 * Math.PI);
        ctx.lineWidth   = 1.5;
        ctx.strokeStyle = color + '44';
        ctx.stroke();
      } else if (level === 1) {
        ctx.fillStyle   = color + '40';
        ctx.fill();
        ctx.lineWidth   = 2;
        ctx.strokeStyle = color + 'dd';
        ctx.shadowColor = color + '88';
        ctx.shadowBlur  = 10;
        ctx.stroke();
        ctx.shadowBlur  = 0;
      } else {
        // L2
        ctx.fillStyle   = color + '30';
        ctx.fill();
        ctx.lineWidth   = 1;
        ctx.strokeStyle = color + 'bb';
        ctx.stroke();
      }

      ctx.restore();

      const children = childrenMap.get(tag.path) ?? [];
      for (const child of children) drawCircle(child, level + 1);
    }

    for (const tag of tags) {
      if (tag.level === 0) drawCircle(tag, 0);
    }

    // ── PASS 2: Labels + tarjetas ─────────────────────────────────────────────
    function drawLabelsAndCards(tag: TagNode, level: number) {
      if (level >= MAX_LEVEL) return;
      const worldR  = tagRadius(tag);
      const screenR = worldR * camera.zoom;
      if (!shouldDrawNode(worldR, camera.zoom)) return;

      const sc      = worldToScreen(camera, tag.x, tag.y, width, height);
      const children = childrenMap.get(tag.path) ?? [];

      // Fade-out del label cuando los hijos empiezan a aparecer
      let labelAlpha = fadeIn(screenR);
      if (children.length > 0) {
        const firstChildR = tagRadius(children[0]) * camera.zoom;
        labelAlpha *= fadeOut(firstChildR, 28, 72);
      }

      if (labelAlpha > 0.02 && screenR >= 16) {
        const fontSize = Math.max(11, Math.min(screenR * 0.35, 52));
        ctx.save();
        ctx.font          = `700 ${fontSize}px system-ui, sans-serif`;
        ctx.globalAlpha   = labelAlpha;
        ctx.textAlign     = 'center';
        ctx.textBaseline  = 'middle';
        const label       = fitText(tag.name, screenR * 1.65);

        if (level === 0) {
          // Texto L0: blanco con sombra oscura fuerte, sin doble capa
          ctx.font        = `800 ${fontSize}px system-ui, sans-serif`;
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur  = fontSize * 0.8;
          ctx.fillStyle   = '#ffffff';
          ctx.fillText(label, sc.x, sc.y);
          ctx.shadowBlur  = 0;
        } else {
          // L1 / L2: texto blanco con sombra oscura
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur  = fontSize * 0.4;
          ctx.fillStyle   = '#f0f0f0';
          ctx.fillText(label, sc.x, sc.y);
        }
        ctx.restore();
      }

      for (const child of children) drawLabelsAndCards(child, level + 1);
    }

    for (const tag of tags) {
      if (tag.level === 0) drawLabelsAndCards(tag, 0);
    }

    // ── PASS 3: Pins flotantes ────────────────────────────────────────────────
    const PIN_ZOOM_START = 0.35;
    const PIN_ZOOM_FULL  = 0.60;
    const pinGlobalAlpha = Math.min(1, Math.max(0,
      (camera.zoom - PIN_ZOOM_START) / (PIN_ZOOM_FULL - PIN_ZOOM_START)
    ));

    if (pinGlobalAlpha > 0) {
      for (const idea of ideas) {
        const { x, y } = worldToScreen(camera, idea.x, idea.y, width, height);
        const rootKey   = idea.tagPaths[0]?.split('/')[0] ?? '';
        const baseColor = rootKey ? colorForKey(rootKey) : '#43BCCD';
        const isHovered = hoveredIdea.current === idea.id;
        const pinColor  = isHovered ? '#F45B69' : baseColor;
        const pinR      = Math.max(4, 7 * camera.zoom);

        ctx.save();
        ctx.globalAlpha = pinGlobalAlpha;

        // Halo suave exterior (más grande e intenso en hover)
        const haloR    = isHovered ? pinR * 3.5 : pinR * 2.8;
        const haloGrad = ctx.createRadialGradient(x, y, pinR * 0.5, x, y, haloR);
        haloGrad.addColorStop(0, pinColor + (isHovered ? '66' : '44'));
        haloGrad.addColorStop(1, pinColor + '00');
        ctx.beginPath();
        ctx.arc(x, y, haloR, 0, 2 * Math.PI);
        ctx.fillStyle = haloGrad;
        ctx.fill();

        // Círculo principal
        ctx.beginPath();
        ctx.arc(x, y, pinR, 0, 2 * Math.PI);
        ctx.fillStyle   = isHovered ? '#fff0f1' : '#ffffff';
        ctx.shadowColor = pinColor;
        ctx.shadowBlur  = isHovered ? 18 : 10;
        ctx.fill();
        ctx.shadowBlur  = 0;
        ctx.strokeStyle = pinColor;
        ctx.lineWidth   = isHovered ? 2.5 : 1.8;
        ctx.stroke();

        // Punto interior
        ctx.beginPath();
        ctx.arc(x, y, pinR * 0.38, 0, 2 * Math.PI);
        ctx.fillStyle = pinColor;
        ctx.fill();

        // Etiqueta flotante (pill)
        const labelAlpha = Math.min(1, Math.max(0,
          (camera.zoom - 0.50) / (0.75 - 0.50)
        ));
        if (labelAlpha > 0 || isHovered) {
          const effectiveAlpha = isHovered ? Math.max(labelAlpha, 0.95) : labelAlpha;
          const fs  = Math.max(9, 11 * Math.min(camera.zoom, 1.4));
          ctx.font  = `${isHovered ? 600 : 500} ${fs}px system-ui, sans-serif`;
          const tw  = ctx.measureText(idea.title).width;
          const pH  = fs + 7;
          const pW  = tw + 14;
          const lx  = x + pinR + 6;
          const ly  = y - pH / 2;

          ctx.globalAlpha = pinGlobalAlpha * effectiveAlpha;

          // Pill background
          ctx.fillStyle   = isHovered ? 'rgba(244,91,105,0.92)' : 'rgba(10,12,22,0.72)';
          ctx.strokeStyle = isHovered ? 'rgba(255,100,120,0.6)' : (pinColor + '66');
          ctx.lineWidth   = isHovered ? 0 : 0.9;
          ctx.shadowColor = isHovered ? 'rgba(244,91,105,0.5)' : 'rgba(0,0,0,0.5)';
          ctx.shadowBlur  = isHovered ? 12 : 8;
          ctx.beginPath();
          ctx.roundRect(lx, ly, pW, pH, pH / 2);
          ctx.fill();
          if (!isHovered) ctx.stroke();
          ctx.shadowBlur = 0;

          // Texto
          ctx.fillStyle    = '#ffffff';
          ctx.textAlign    = 'left';
          ctx.textBaseline = 'middle';
          ctx.shadowColor  = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur   = isHovered ? 0 : 3;
          ctx.fillText(idea.title, lx + 7, ly + pH / 2);
          ctx.shadowBlur   = 0;
        }

        // Anillo de selección
        if (selectedIdea?.id === idea.id) {
          ctx.globalAlpha = pinGlobalAlpha;
          ctx.lineWidth   = 2;
          ctx.strokeStyle = '#F45B69';
          ctx.shadowColor = '#F45B69';
          ctx.shadowBlur  = 12;
          ctx.beginPath();
          ctx.arc(x, y, pinR + 4, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.shadowBlur  = 0;
        }

        ctx.restore();
      }
    }
  }, [camera, tags, ideas, width, height, selectedIdea]);

  // Cuando el padre cambia la cámara externamente (p.ej. botón Vista general),
  // sincronizamos targetZoom para que el lerp apunte al zoom nuevo
  useEffect(() => {
    targetZoom.current = camera.zoom;
  }, [camera.zoom]);

  // Redibuja en cada frame + zoom suave con lerp
  useEffect(() => {
    let running = true;
    function frame() {
      if (!running) return;

      // Lerp del zoom: acerca camera.zoom hacia targetZoom suavemente
      const cam = cameraRef.current;
      const tz  = targetZoom.current;
      if (Math.abs(cam.zoom - tz) > 0.0005) {
        const smoothed = cam.zoom + (tz - cam.zoom) * 0.14;
        setCamera({ ...cam, zoom: smoothed });
      }

      draw();
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);
    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  // ── Pan ─────────────────────────────────────────────────────────────────────

  /** Coordenadas del evento relativas al canvas (no a la ventana) */
  const canvasXY = (e: React.MouseEvent) => ({
    x: e.nativeEvent.offsetX,
    y: e.nativeEvent.offsetY,
  });

  const onMouseDown = (e: React.MouseEvent) => {
    const { x, y } = canvasXY(e);
    dragging.current = true;
    lastPos.current  = { x, y };
    velocity.current = { vx: 0, vy: 0 };
    lastTime.current = performance.now();
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'grabbing';
  };
  const onMouseUp = (_e: React.MouseEvent) => {
    dragging.current = false;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'grab';
  };
  const onMouseLeave = (_e: React.MouseEvent) => {
    dragging.current = false;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'grab';
    if (hoveredIdea.current !== null) {
      hoveredIdea.current = null;
      draw();
    }
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const { x: cx, y: cy } = canvasXY(e);
    if (dragging.current) {
      const now = performance.now();
      const dt  = Math.max(1, now - lastTime.current);
      const dx  = (cx - lastPos.current.x) / cameraRef.current.zoom;
      const dy  = (cy - lastPos.current.y) / cameraRef.current.zoom;
      velocity.current = { vx: dx / dt, vy: dy / dt };
      lastTime.current = now;
      setCamera({
        ...cameraRef.current,
        x: cameraRef.current.x - dx,
        y: cameraRef.current.y - dy,
      });
      lastPos.current = { x: cx, y: cy };
    } else {
      // Solo detectar hover cuando los pins son visibles
      const zoom = cameraRef.current.zoom;
      const pinsVisible = zoom >= 0.35;
      const idea = pinsVisible
        ? hitTestIdea(ideas, { x: cx, y: cy }, cameraRef.current, width, height)
        : null;
      const newHovered = idea?.id ?? null;

      if (newHovered !== hoveredIdea.current) {
        hoveredIdea.current = newHovered;
        draw();
      }

      if (canvas) canvas.style.cursor = idea ? 'pointer' : 'grab';
    }
  };

  // ── Zoom suave (acumula en targetZoom, el lerp lo aplica) ───────────────────
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const { x: cx, y: cy } = canvasXY(e);
    const rawDelta  = e.deltaY;
    const normDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 80);
    const factor    = Math.pow(0.992, normDelta);
    const clamped   = Math.max(0.08, Math.min(20, targetZoom.current * factor));
    const cam     = cameraRef.current;
    const before  = { x: (cx - width / 2) / cam.zoom  + cam.x,
                      y: (cy - height / 2) / cam.zoom + cam.y };
    const after   = { x: (cx - width / 2) / clamped  + cam.x,
                      y: (cy - height / 2) / clamped + cam.y };
    targetZoom.current = clamped;
    setCamera({
      zoom: cam.zoom,
      x: cam.x + (before.x - after.x),
      y: cam.y + (before.y - after.y),
    });
  };

  // Double click: si hay un pin navega a Cerebro, si no hace zoom in
  const onDoubleClick = (e: React.MouseEvent) => {
    const { x: cx, y: cy } = canvasXY(e);
    const idea = hitTestIdea(ideas, { x: cx, y: cy }, cameraRef.current, width, height);
    if (idea) {
      onNavigateToNote(idea);
      return;
    }
    const newTarget = Math.min(20, targetZoom.current * 1.8);
    const cam       = cameraRef.current;
    const before    = { x: (cx - width / 2) / cam.zoom  + cam.x,
                        y: (cy - height / 2) / cam.zoom + cam.y };
    const after     = { x: (cx - width / 2) / newTarget + cam.x,
                        y: (cy - height / 2) / newTarget + cam.y };
    targetZoom.current = newTarget;
    setCamera({ zoom: cam.zoom, x: cam.x + (before.x - after.x), y: cam.y + (before.y - after.y) });
  };

  // Click: un solo clic en un pin navega directamente a Cerebro
  const onClick = (e: React.MouseEvent) => {
    if (cameraRef.current.zoom < 0.35) return;
    const { x: cx, y: cy } = canvasXY(e);
    const idea = hitTestIdea(ideas, { x: cx, y: cy }, cameraRef.current, width, height);
    if (idea) {
      onSelectIdea(idea);
      onNavigateToNote(idea);
    }
  };

  // Resize
  useEffect(() => {
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  return (
    <div className="map-canvas-container" style={{ cursor: 'grab' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        tabIndex={0}
        className="map-canvas"
        style={{ display: 'block', cursor: 'inherit' }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
        aria-label="Mapa de tags"
      />
    </div>
  );
};
