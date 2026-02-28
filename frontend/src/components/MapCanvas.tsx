import React, { useRef, useEffect, useCallback } from 'react';
import { TagNode, Idea, ROOT_COLORS, BASE_RADIUS_L0, CHILD_RATIO_L1, CHILD_RATIO_L2 } from '../mockData';
import { Camera, worldToScreen, screenToWorld, applyZoomAtPoint } from '../lib/camera';
import { shouldDrawNode } from '../lib/lod';
import { hitTestIdea } from '../lib/hittest';

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
  width: number;
  height: number;
}

const ANIMATION_DURATION = 250;

/** Returns the world-space radius of a tag node based on level and confianza */
function tagRadius(tag: TagNode): number {
  if (tag.level === 0) return BASE_RADIUS_L0;
  if (tag.level === 1) return BASE_RADIUS_L0 * CHILD_RATIO_L1 * (tag.confianza ?? 0.5);
  if (tag.level === 2) {
    // parent radius * CHILD_RATIO_L2 * confianza
    return BASE_RADIUS_L0 * CHILD_RATIO_L1 * (tag.confianza ?? 0.5) * CHILD_RATIO_L2;
  }
  return 20;
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
  onFocusTag,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animRef = useRef<number | null>(null);
  const animStart = useRef<number>(0);
  const animFrom = useRef<Camera>(camera);
  const animTo = useRef<Camera>(camera);

  // Dibuja el canvas
  const draw = useCallback(() => {
    const rawCtx = canvasRef.current?.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f7f8fa';
    ctx.fillRect(0, 0, width, height);

    const MAX_LEVEL = 3;

    // ── Pre-computes ────────────────────────────────────────────────────────
    // Agrupar hijos por parentPath
    const childrenMap = new Map<string | null, TagNode[]>();
    tags.forEach(tag => {
      const key = tag.parentPath ?? null;
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(tag);
    });

    // Agrupar ideas por tagPath (L2)
    const ideasByTag = new Map<string, Idea[]>();
    ideas.forEach(idea => {
      idea.tagPaths.forEach(tp => {
        if (!ideasByTag.has(tp)) ideasByTag.set(tp, []);
        ideasByTag.get(tp)!.push(idea);
      });
    });

    // ── Helpers ─────────────────────────────────────────────────────────────
    /** Alpha 0→1 as screenR grows from threshold to threshold*2 (smooth fade-in) */
    function fadeIn(screenR: number, threshold = 14): number {
      return Math.min(1, Math.max(0, (screenR - threshold) / threshold));
    }

    /** Alpha 1→0 as value grows from start to end (smooth fade-out) */
    function fadeOut(value: number, start: number, end: number): number {
      return Math.min(1, Math.max(0, 1 - (value - start) / (end - start)));
    }

    /** Fit text inside a max pixel width, truncating with … if needed */
    function fitText(text: string, maxPx: number): string {
      if (ctx.measureText(text).width <= maxPx) return text;
      let t = text;
      while (t.length > 1 && ctx.measureText(t + '…').width > maxPx) t = t.slice(0, -1);
      return t + '…';
    }

    // ── PASS 1: Draw all circles back-to-front (L0 → L1 → L2) ──────────────
    function drawCircle(tag: TagNode, level: number) {
      if (level >= MAX_LEVEL) return;
      const worldR = tagRadius(tag);
      const screenR = worldR * camera.zoom;
      if (!shouldDrawNode(worldR, camera.zoom)) return;

      const sc = worldToScreen(camera, tag.x, tag.y, width, height);
      const rootKey = tag.path.split('/')[0];
      const color = ROOT_COLORS[rootKey] || '#888';

      const baseAlpha = fadeIn(screenR);
      ctx.save();
      ctx.globalAlpha = baseAlpha;
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, screenR, 0, 2 * Math.PI);
      // Fill: tenue en L0, más sólido en hijos
      const fills = ['18', '28', '42'];
      ctx.fillStyle = color + fills[level];
      ctx.fill();
      ctx.lineWidth = level === 0 ? 2.5 : 1.5;
      ctx.strokeStyle = color + (level === 0 ? 'cc' : 'aa');
      ctx.stroke();
      ctx.restore();

      const children = childrenMap.get(tag.path) ?? [];
      for (const child of children) drawCircle(child, level + 1);
    }

    for (const tag of tags) {
      if (tag.level === 0) drawCircle(tag, 0);
    }

    // ── PASS 2: Draw labels & cards ──────────────────────────────────────────
    function drawLabelsAndCards(tag: TagNode, level: number) {
      if (level >= MAX_LEVEL) return;
      const worldR = tagRadius(tag);
      const screenR = worldR * camera.zoom;
      if (!shouldDrawNode(worldR, camera.zoom)) return;

      const sc = worldToScreen(camera, tag.x, tag.y, width, height);
      const rootKey = tag.path.split('/')[0];
      const color = ROOT_COLORS[rootKey] || '#888';

      // ── Label del nodo ───────────────────────────────────────────────────
      // Fade-out: desaparece cuando los hijos empiezan a ser visibles
      const children = childrenMap.get(tag.path) ?? [];
      let labelAlpha = fadeIn(screenR);

      if (children.length > 0) {
        // Calcula qué tan visibles están los hijos
        const firstChildR = tagRadius(children[0]) * camera.zoom;
        // Empezar fade-out cuando el hijo mide 30px, acabar a 80px
        labelAlpha *= fadeOut(firstChildR, 30, 80);
      }

      if (labelAlpha > 0.02 && screenR >= 18) {
        const fontSize = Math.max(10, Math.min(screenR * 0.38, 48));
        ctx.save();
        ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
        const maxW = screenR * 1.7;
        const label = fitText(tag.name, maxW);
        ctx.globalAlpha = labelAlpha;
        // Sombra suave para legibilidad
        ctx.shadowColor = 'rgba(255,255,255,0.9)';
        ctx.shadowBlur = fontSize * 0.5;
        ctx.fillStyle = level === 0 ? color : '#1a1a2e';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, sc.x, sc.y);
        ctx.restore();
      }

      // ── Tarjetas de ideas en L2 ──────────────────────────────────────────
      if (level === 2) {
        const tagIdeas = ideasByTag.get(tag.path) ?? [];
        // Mostrar tarjetas cuando el círculo es grande (≥120px radio en pantalla)
        const cardAlpha = fadeIn(screenR, 120);
        if (cardAlpha > 0.02 && tagIdeas.length > 0) {
          const cardW = Math.min(screenR * 1.6, 220);
          const cardH = 56;
          const cardGap = 10;

          // Las tarjetas se colocan en abanico vertical BAJO el texto del tag,
          // empezando desde screenR*0.45 para dejar el centro libre
          const startY = sc.y + screenR * 0.30;

          tagIdeas.forEach((idea, i) => {
            const cx = sc.x - cardW / 2;
            const cy = startY + i * (cardH + cardGap);

            ctx.save();
            ctx.globalAlpha = cardAlpha;

            // Sombra de la tarjeta
            ctx.shadowColor = 'rgba(0,0,0,0.13)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 2;

            // Fondo blanco redondeado
            const r = 8;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(cx + r, cy);
            ctx.lineTo(cx + cardW - r, cy);
            ctx.quadraticCurveTo(cx + cardW, cy, cx + cardW, cy + r);
            ctx.lineTo(cx + cardW, cy + cardH - r);
            ctx.quadraticCurveTo(cx + cardW, cy + cardH, cx + cardW - r, cy + cardH);
            ctx.lineTo(cx + r, cy + cardH);
            ctx.quadraticCurveTo(cx, cy + cardH, cx, cy + cardH - r);
            ctx.lineTo(cx, cy + r);
            ctx.quadraticCurveTo(cx, cy, cx + r, cy);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Acento de color a la izquierda (dentro del border-radius)
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx + r, cy);
            ctx.lineTo(cx + cardW - r, cy);
            ctx.quadraticCurveTo(cx + cardW, cy, cx + cardW, cy + r);
            ctx.lineTo(cx + cardW, cy + cardH - r);
            ctx.quadraticCurveTo(cx + cardW, cy + cardH, cx + cardW - r, cy + cardH);
            ctx.lineTo(cx + r, cy + cardH);
            ctx.quadraticCurveTo(cx, cy + cardH, cx, cy + cardH - r);
            ctx.lineTo(cx, cy + r);
            ctx.quadraticCurveTo(cx, cy, cx + r, cy);
            ctx.closePath();
            ctx.clip();
            ctx.fillStyle = color;
            ctx.fillRect(cx, cy, 4, cardH);
            ctx.restore();

            // Título
            const titleSize = Math.max(9, Math.min(cardW * 0.075, 13));
            ctx.fillStyle = '#1a1a2e';
            ctx.font = `600 ${titleSize}px system-ui, sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(fitText(idea.title, cardW - 20), cx + 12, cy + 9);

            // Excerpt
            const excerptSize = Math.max(8, titleSize - 1.5);
            ctx.fillStyle = '#555';
            ctx.font = `${excerptSize}px system-ui, sans-serif`;
            ctx.fillText(fitText(idea.excerpt, cardW - 20), cx + 12, cy + 9 + titleSize + 4);

            // Fecha
            ctx.fillStyle = '#aaa';
            ctx.font = `${Math.max(7, excerptSize - 1)}px system-ui, sans-serif`;
            ctx.fillText(idea.createdAt, cx + 12, cy + cardH - excerptSize - 2);

            ctx.restore();
          });
        }
      }

      // Recursión
      for (const child of children) drawLabelsAndCards(child, level + 1);
    }

    for (const tag of tags) {
      if (tag.level === 0) drawLabelsAndCards(tag, 0);
    }

    // ── PASS 3: Ideas como pins flotantes (fuera de círculos L2 o sin tag L2) ─
    // Los pins aparecen con fade-in a partir de zoom 0.35 y son completamente
    // visibles desde zoom 0.55. Por debajo de 0.35 no se dibujan.
    const PIN_ZOOM_START = 0.35;  // empieza a aparecer
    const PIN_ZOOM_FULL  = 0.55;  // completamente visible
    const pinGlobalAlpha = Math.min(1, Math.max(0,
      (camera.zoom - PIN_ZOOM_START) / (PIN_ZOOM_FULL - PIN_ZOOM_START)
    ));

    if (pinGlobalAlpha > 0) {
      for (const idea of ideas) {
        const hasVisibleCard = idea.tagPaths.some(tp => {
          const tagNode = tags.find(t => t.path === tp && t.level === 2);
          if (!tagNode) return false;
          const worldR = tagRadius(tagNode);
          return fadeIn(worldR * camera.zoom, 120) > 0.5;
        });
        if (hasVisibleCard) continue;

        const { x, y } = worldToScreen(camera, idea.x, idea.y, width, height);
        const pinR = Math.max(6, 10 * camera.zoom);
        const labelVisible = camera.zoom >= 0.5;

        ctx.save();
        ctx.globalAlpha = pinGlobalAlpha;
        // Círculo del pin
        ctx.beginPath();
        ctx.arc(x, y, pinR, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Punto interior
        ctx.beginPath();
        ctx.arc(x, y, pinR * 0.4, 0, 2 * Math.PI);
        ctx.fillStyle = '#43BCCD';
        ctx.fill();
        // Nombre completo del pin
        if (labelVisible) {
          const fs = Math.max(10, 11 * camera.zoom);
          ctx.font = `500 ${fs}px system-ui, sans-serif`;
          const labelText = idea.title;
          const tw = ctx.measureText(labelText).width;
          const pad = 4;
          ctx.fillStyle = 'rgba(255,255,255,0.92)';
          ctx.shadowColor = 'rgba(0,0,0,0.12)';
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.roundRect(x + pinR + 4, y - fs / 2 - pad, tw + pad * 2, fs + pad * 2, 4);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#1a1a2e';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, x + pinR + 4 + pad, y);
        }
        // Selección
        if (selectedIdea && selectedIdea.id === idea.id) {
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#F45B69';
          ctx.beginPath();
          ctx.arc(x, y, pinR + 4, 0, 2 * Math.PI);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }, [camera, tags, ideas, width, height, selectedIdea]);

  // Redibuja en cada frame
  useEffect(() => {
    let running = true;
    function frame() {
      if (!running) return;
      draw();
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);
    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  // Pan
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = (e: React.MouseEvent) => {
    dragging.current = false;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = (e.clientX - lastPos.current.x) / camera.zoom;
    const dy = (e.clientY - lastPos.current.y) / camera.zoom;
    setCamera({ ...camera, x: camera.x - dx, y: camera.y - dy });
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  // Zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    setCamera(applyZoomAtPoint(camera, factor, e.clientX, e.clientY, width, height));
  };
  // Double click: zoom in
  const onDoubleClick = (e: React.MouseEvent) => {
    setCamera(applyZoomAtPoint(camera, 1.5, e.clientX, e.clientY, width, height));
  };
  // Click: selección
  const onClick = (e: React.MouseEvent) => {
    const world = screenToWorld(camera, e.clientX, e.clientY, width, height);
    // Hit test sobre pins de ideas (siempre activo)
    const idea = hitTestIdea(ideas, world);
    if (idea) {
      onSelectIdea(idea);
      return;
    }
    // Deshabilitado: selección de tags (círculos)
    // const tag = hitTestTag(tags, world);
    // if (tag) {
    //   onSelectTag(tag);
    //   // Focus animado
    //   animateFocus(tag);
    // }
  };
  // Focus animado
  const animateFocus = (tag: TagNode) => {
    const targetZoom = tag.level === 0 ? 1.0 : tag.level === 1 ? 1.6 : 2.0;
    animStart.current = performance.now();
    animFrom.current = { ...camera };
    animTo.current = { x: tag.x, y: tag.y, zoom: targetZoom };
    function step(now: number) {
      const t = Math.min(1, (now - animStart.current) / ANIMATION_DURATION);
      const ease = 1 - Math.pow(1 - t, 2);
      setCamera({
        x: animFrom.current.x + (animTo.current.x - animFrom.current.x) * ease,
        y: animFrom.current.y + (animTo.current.y - animFrom.current.y) * ease,
        zoom: animFrom.current.zoom + (animTo.current.zoom - animFrom.current.zoom) * ease,
      });
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    onFocusTag(tag);
  };
  // Reset view
  const resetView = () => {
    setCamera({ x: 0, y: 0, zoom: 0.8 });
  };
  // Resize
  useEffect(() => {
    const handleResize = () => {
      draw();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  return (
    <div className="map-canvas-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        tabIndex={0}
        className="map-canvas"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
        aria-label="Mapa de tags"
      />
      <button className="reset-view-btn" onClick={resetView} tabIndex={0} aria-label="Resetear vista">Reset</button>
    </div>
  );
};
