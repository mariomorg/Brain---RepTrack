import React, { useRef, useEffect, useCallback } from 'react';
import { TagNode, Idea, ROOT_COLORS } from '../mockData';
import { Camera, worldToScreen } from '../lib/camera';
import { shouldDrawNode } from '../lib/lod';
import { hitTestIdea, hitTestTagScreen } from '../lib/hittest';

/** HSL -> HEX (#RRGGBB) */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));

  let r1 = 0, g1 = 0, b1 = 0;
  if (0 <= hp && hp < 1) { r1 = c; g1 = x; b1 = 0; }
  else if (1 <= hp && hp < 2) { r1 = x; g1 = c; b1 = 0; }
  else if (2 <= hp && hp < 3) { r1 = 0; g1 = c; b1 = x; }
  else if (3 <= hp && hp < 4) { r1 = 0; g1 = x; b1 = c; }
  else if (4 <= hp && hp < 5) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }

  const m = l - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Genera un color determinista a partir de un string (SIEMPRE HEX) */
function colorForKey(key: string): string {
  const fromRoot = ROOT_COLORS[key];
  if (fromRoot) return fromRoot; // idealmente ya es #RRGGBB
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) & 0xffff;
  const hue = (h * 137.508) % 360;
  return hslToHex(Math.round(hue), 65, 62);
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
  /** Incrementar para disparar animación de "Vista general" */
  resetViewSignal?: number;
  /** Zoom inicial al que vuelve "Vista general" */
  initialZoom?: number;
  /** Modo fondo blanco con contraste alto */
  lightMode?: boolean;
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
  onFocusTag,
  onNavigateToNote,
  width,
  height,
  resetViewSignal = 0,
  initialZoom = 0.08,
  lightMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  // Pan state
  const dragging = useRef(false);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inercia pan
  const velocity = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const lastTime = useRef<number>(0);

  // Zoom con inercia (lerp hacia targetZoom)
  const targetZoom = useRef(camera.zoom);
  const targetX = useRef(camera.x);
  const targetY = useRef(camera.y);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  // Animación basada en tiempo (ease-out) para clicks en tag
  const anim = useRef<{
    startZoom: number; endZoom: number;
    startX: number; endX: number;
    startY: number; endY: number;
    startTime: number; duration: number;
    active: boolean;
  }>({
    startZoom: camera.zoom, endZoom: camera.zoom,
    startX: camera.x, endX: camera.x,
    startY: camera.y, endY: camera.y,
    startTime: 0, duration: 0, active: false,
  });

  // Para detectar resets externos del padre (botón "Vista general", etc.)
  const lastSetZoom = useRef(camera.zoom);
  const lastSetX = useRef(camera.x);
  const lastSetY = useRef(camera.y);

  // Pin hover
  const hoveredIdea = useRef<string | null>(null);
  // Modo animación rápida legacy (scroll)
  const fastAnim = useRef(false);

  // Dibuja el canvas
  const draw = useCallback(() => {
    const rawCtx = canvasRef.current?.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;
    ctx.clearRect(0, 0, width, height);

    // ── Fondo ───────────────────────────────────────────────────────────────
    if (lightMode) {
      // Fondo blanco liso
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else {
      // Fondo oscuro degradado
      const bgGrad = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2,
        Math.max(width, height) * 0.75
      );
      bgGrad.addColorStop(0, '#1a1d2e');
      bgGrad.addColorStop(1, '#0d0f1a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Estrellas de fondo (posición determinista por seed)
      ctx.save();
      const starCount = 120;
      for (let i = 0; i < starCount; i++) {
        const sx = ((i * 2971 + 13) % width);
        const sy = ((i * 1873 + 7) % height);
        const sr = (i % 3 === 0) ? 1.2 : 0.6;
        const sa = 0.2 + (i % 5) * 0.07;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255,255,255,${sa})`;
        ctx.fill();
      }
      ctx.restore();
    }

    const MAX_LEVEL = 3;

    // ── Pre-computes ─────────────────────────────────────────────────────────
    const childrenMap = new Map<string | null, TagNode[]>();
    tags.forEach(tag => {
      const key = tag.parentPath ?? null;
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(tag);
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

      const sc = worldToScreen(camera, tag.x, tag.y, width, height);
      const rootKey = tag.path.split('/')[0];
      const color = colorForKey(rootKey);
      const alpha = fadeIn(screenR);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, screenR, 0, 2 * Math.PI);

      if (level === 0) {
        if (lightMode) {
          // Relleno sólido con opacidad alta para contraste sobre blanco
          const grad = ctx.createRadialGradient(
            sc.x - screenR * 0.35, sc.y - screenR * 0.35, screenR * 0.05,
            sc.x, sc.y, screenR
          );
          grad.addColorStop(0, color + 'cc');
          grad.addColorStop(0.5, color + 'aa');
          grad.addColorStop(1, color + 'dd');
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.lineWidth = Math.max(2.5, screenR * 0.008);
          ctx.strokeStyle = color + 'ff';
          ctx.stroke();
        } else {
          // Gradiente radial tipo planeta
          const grad = ctx.createRadialGradient(
            sc.x - screenR * 0.35, sc.y - screenR * 0.35, screenR * 0.05,
            sc.x, sc.y, screenR
          );
          grad.addColorStop(0, color + 'bb');
          grad.addColorStop(0.5, color + '88');
          grad.addColorStop(1, color + 'cc');
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.shadowColor = color;
          ctx.shadowBlur = Math.max(20, screenR * 0.10);
          ctx.lineWidth = Math.max(2, screenR * 0.007);
          ctx.strokeStyle = color + 'ff';
          ctx.stroke();
          ctx.shadowBlur = 0;
          // Halo exterior tenue
          ctx.beginPath();
          ctx.arc(sc.x, sc.y, screenR * 1.04, 0, 2 * Math.PI);
          ctx.lineWidth = 1;
          ctx.strokeStyle = color + '33';
          ctx.stroke();
        }
      } else if (level === 1) {
        if (lightMode) {
          ctx.fillStyle = color + '28';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = color + 'ee';
          ctx.stroke();
        } else {
          // Casi transparente — sólo se ve el borde, el interior queda limpio
          ctx.fillStyle = color + '18';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = color + 'cc';
          ctx.shadowColor = color + '55';
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else {
        if (lightMode) {
          ctx.fillStyle = color + '1a';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = color + 'bb';
          ctx.stroke();
        } else {
          ctx.fillStyle = color + '12';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = color + '99';
          ctx.stroke();
        }
      }

      ctx.restore();

      const children = childrenMap.get(tag.path) ?? [];
      for (const child of children) drawCircle(child, level + 1);
    }

    for (const tag of tags) {
      if (tag.level === 0) drawCircle(tag, 0);
    }

    // ── PASS 2: Labels ───────────────────────────────────────────────────────
    function drawLabelsAndCards(tag: TagNode, level: number) {
      if (level >= MAX_LEVEL) return;
      const worldR = tagRadius(tag);
      const screenR = worldR * camera.zoom;
      if (!shouldDrawNode(worldR, camera.zoom)) return;

      const sc = worldToScreen(camera, tag.x, tag.y, width, height);
      const children = childrenMap.get(tag.path) ?? [];

      // El label del padre desaparece rápido cuando los hijos son visibles
      let labelAlpha = fadeIn(screenR);
      if (children.length > 0) {
        const firstChildR = tagRadius(children[0]) * camera.zoom;
        // Empieza a desvanecerse antes (desde 20px) y termina antes (en 50px)
        labelAlpha *= fadeOut(firstChildR, 20, 55);
      }

      if (labelAlpha > 0.02 && screenR >= 16) {
        const fontSize = Math.max(11, Math.min(screenR * 0.32, 48));
        ctx.save();
        ctx.globalAlpha = labelAlpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = fitText(tag.name, screenR * 1.6);

        if (level === 0) {
          ctx.font = `800 ${fontSize}px system-ui, sans-serif`;
          if (lightMode) {
            ctx.shadowColor = 'rgba(255,255,255,0.9)';
            ctx.shadowBlur = fontSize * 0.6;
            ctx.fillStyle = '#111111';
          } else {
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = fontSize * 0.9;
            ctx.fillStyle = '#ffffff';
          }
          ctx.fillText(label, sc.x, sc.y);
        } else {
          ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
          if (lightMode) {
            ctx.shadowColor = 'rgba(255,255,255,0.8)';
            ctx.shadowBlur = fontSize * 0.4;
            ctx.fillStyle = '#222222';
          } else {
            ctx.shadowColor = 'rgba(0,0,0,0.85)';
            ctx.shadowBlur = fontSize * 0.5;
            ctx.fillStyle = '#f4f4f4';
          }
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
    // Los pins sólo aparecen cuando hay suficiente zoom para ver el interior
    // de un subtag — evita que se mezclen con los círculos de nivel 0/1
    const PIN_ZOOM_START = 0.70;
    const PIN_ZOOM_FULL = 1.00;
    const pinGlobalAlpha = Math.min(
      1,
      Math.max(0, (camera.zoom - PIN_ZOOM_START) / (PIN_ZOOM_FULL - PIN_ZOOM_START))
    );

    // Build a quick path→tag lookup to filter pins by zoom level
    const tagByPath = new Map<string, typeof tags[0]>();
    tags.forEach(t => tagByPath.set(t.path, t));

    if (pinGlobalAlpha > 0) {
      for (const idea of ideas) {
        // Find the deepest (most specific) tag this idea belongs to
        let homePath = idea.tagPaths[0] ?? '';
        for (const p of idea.tagPaths) {
          const t = tagByPath.get(p);
          const h = tagByPath.get(homePath);
          if (t && h && (t.level ?? 0) > (h.level ?? 0)) homePath = p;
        }
        const homeTag = tagByPath.get(homePath);
        const homeScreenR = homeTag ? (homeTag.radius ?? 300) * camera.zoom : 0;
        // Solo mostrar si el tag home es visible (screenR > 14px), nunca antes
        if (homeScreenR < 14) continue;

        const { x, y } = worldToScreen(camera, idea.x, idea.y, width, height);
        const rootKey = idea.tagPaths[0]?.split('/')[0] ?? '';
        const baseColor = rootKey ? colorForKey(rootKey) : '#43BCCD';
        const isHovered = hoveredIdea.current === idea.id;
        const pinColor = isHovered ? '#F45B69' : baseColor;
        const pinR = Math.max(3, 5 * camera.zoom);

        ctx.save();
        ctx.globalAlpha = pinGlobalAlpha;

        // Halo suave
        const haloR = pinR * (isHovered ? 3.2 : 2.4);
        const haloGrad = ctx.createRadialGradient(x, y, pinR * 0.4, x, y, haloR);
        haloGrad.addColorStop(0, pinColor + (isHovered ? '55' : '33'));
        haloGrad.addColorStop(1, pinColor + '00');
        ctx.beginPath();
        ctx.arc(x, y, haloR, 0, 2 * Math.PI);
        ctx.fillStyle = haloGrad;
        ctx.fill();

        // Círculo principal
        ctx.beginPath();
        ctx.arc(x, y, pinR, 0, 2 * Math.PI);
        ctx.fillStyle = isHovered ? '#fff0f1' : (lightMode ? '#f8f8f8' : '#ffffff');
        if (!lightMode) {
          ctx.shadowColor = pinColor;
          ctx.shadowBlur = isHovered ? 16 : 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = pinColor;
        ctx.lineWidth = isHovered ? 2 : (lightMode ? 2 : 1.5);
        ctx.stroke();

        // Punto interior
        ctx.beginPath();
        ctx.arc(x, y, pinR * 0.36, 0, 2 * Math.PI);
        ctx.fillStyle = pinColor;
        ctx.fill();

        // Pill: en hover siempre; también aparece gradualmente desde zoom 1.4
        const pillZoomAlpha = Math.min(1, Math.max(0, (camera.zoom - 1.4) / (2.0 - 1.4)));
        const showPill = isHovered || pillZoomAlpha > 0;
        if (showPill) {
          const effectiveAlpha = isHovered ? 0.95 : pillZoomAlpha * 0.85;
          const fs = Math.max(9, 10 * Math.min(camera.zoom, 1.6));
          ctx.font = `${isHovered ? 600 : 500} ${fs}px system-ui, sans-serif`;
          const tw = ctx.measureText(idea.title).width;
          const pH = fs + 6;
          const pW = tw + 12;
          const lx = x + pinR + 5;
          const ly = y - pH / 2;

          ctx.globalAlpha = pinGlobalAlpha * effectiveAlpha;
          ctx.fillStyle = isHovered
            ? 'rgba(244,91,105,0.92)'
            : (lightMode ? 'rgba(240,242,248,0.95)' : 'rgba(8,10,20,0.80)');
          ctx.strokeStyle = isHovered ? 'transparent' : (pinColor + (lightMode ? 'aa' : '55'));
          ctx.lineWidth = 0.8;
          ctx.shadowColor = lightMode ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = isHovered ? 10 : 6;
          ctx.beginPath();
          ctx.roundRect(lx, ly, pW, pH, pH / 2);
          ctx.fill();
          if (!isHovered) ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.fillStyle = isHovered ? '#ffffff' : (lightMode ? '#111111' : '#ffffff');
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(idea.title, lx + 6, ly + pH / 2);
        }

        // Anillo de selección
        if (selectedIdea?.id === idea.id) {
          ctx.globalAlpha = pinGlobalAlpha;
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#F45B69';
          ctx.shadowColor = '#F45B69';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(x, y, pinR + 4, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }
    }

    // ── PASS 4: Anillo de selección — siempre visible aunque el pin esté oculto ──
    if (selectedIdea) {
      const idea = ideas.find(i => i.id === selectedIdea.id);
      if (idea) {
        const { x, y } = worldToScreen(camera, idea.x, idea.y, width, height);
        const r = Math.max(5, 6 * camera.zoom);
        ctx.save();
        ctx.globalAlpha = 1;

        // Halo exterior pulsante
        ctx.beginPath();
        ctx.arc(x, y, r + 10, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(244,91,105,0.25)';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Anillo principal
        ctx.beginPath();
        ctx.arc(x, y, r + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#F45B69';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#F45B69';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Círculo relleno con color
        const rootKey = idea.tagPaths[0]?.split('/')[0] ?? '';
        const baseColor = rootKey ? colorForKey(rootKey) : '#43BCCD';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff0f1';
        ctx.strokeStyle = '#F45B69';
        ctx.lineWidth = 2;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Punto interior
        ctx.beginPath();
        ctx.arc(x, y, r * 0.36, 0, 2 * Math.PI);
        ctx.fillStyle = '#F45B69';
        ctx.fill();

        ctx.restore();
      }
    }
  }, [camera, tags, ideas, width, height, selectedIdea, lightMode]);

  // Cuando el padre resetea la cámara externamente (p.ej. botón Vista general),
  // Cuando el padre resetea la cámara externamente (botón "Vista general", etc.)
  // lo detectamos comparando con lo que nosotros mismos enviamos al padre la última vez.
  // Si difiere → es un reset externo, sincronizamos los targets.
  const externalCameraRef = useRef(camera);
  useEffect(() => {
    const cam = camera;
    const isExternalChange =
      Math.abs(cam.zoom - lastSetZoom.current) > 0.001 ||
      Math.abs(cam.x - lastSetX.current) > 1 ||
      Math.abs(cam.y - lastSetY.current) > 1;

    externalCameraRef.current = cam;

    if (isExternalChange) {
      // Cancelar animación en curso y saltar al nuevo valor
      anim.current.active = false;
      targetZoom.current = cam.zoom;
      targetX.current = cam.x;
      targetY.current = cam.y;
      lastSetZoom.current = cam.zoom;
      lastSetX.current = cam.x;
      lastSetY.current = cam.y;
      fastAnim.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  // Cuando el padre incrementa resetViewSignal, lanzamos animación hacia el zoom inicial
  useEffect(() => {
    if (resetViewSignal === 0) return;

    // Arrancar desde la posición interpolada actual si hay animación en curso
    let fromZoom: number;
    let fromX: number;
    let fromY: number;
    if (anim.current.active) {
      const elapsed = performance.now() - anim.current.startTime;
      const raw = Math.min(elapsed / anim.current.duration, 1);
      const ease = 1 - Math.pow(1 - raw, 3);
      fromZoom = anim.current.startZoom + (anim.current.endZoom - anim.current.startZoom) * ease;
      fromX = anim.current.startX + (anim.current.endX - anim.current.startX) * ease;
      fromY = anim.current.startY + (anim.current.endY - anim.current.startY) * ease;
    } else {
      fromZoom = cameraRef.current.zoom;
      fromX = cameraRef.current.x;
      fromY = cameraRef.current.y;
    }

    anim.current = {
      startZoom: fromZoom, endZoom: initialZoom,
      startX: fromX, endX: 0,
      startY: fromY, endY: 0,
      startTime: performance.now(),
      duration: 750,
      active: true,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetViewSignal]);

  // Redibuja en cada frame + animación de cámara
  useEffect(() => {
    let running = true;

    /** ease-out cúbico: arranca rápido, frena suave pero sin cola larga */
    function easeOutExpo(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(now: number) {
      if (!running) return;

      const cam = cameraRef.current;
      let newZoom = cam.zoom;
      let newX = cam.x;
      let newY = cam.y;
      let changed = false;

      // ── Animación basada en tiempo (clicks en tag) ───────────────────────
      if (anim.current.active) {
        const elapsed = now - anim.current.startTime;
        const raw = Math.min(elapsed / anim.current.duration, 1);
        const ease = easeOutExpo(raw);

        newZoom = anim.current.startZoom + (anim.current.endZoom - anim.current.startZoom) * ease;
        newX = anim.current.startX + (anim.current.endX - anim.current.startX) * ease;
        newY = anim.current.startY + (anim.current.endY - anim.current.startY) * ease;
        changed = true;

        if (raw >= 1) {
          anim.current.active = false;
          newZoom = anim.current.endZoom;
          newX = anim.current.endX;
          newY = anim.current.endY;
          // Sincronizar targets para que el lerp del scroll no interfiera
          targetZoom.current = newZoom;
          targetX.current = newX;
          targetY.current = newY;
        }
      } else {
        // ── Lerp suave para scroll/pan ────────────────────────────────────
        const tz = targetZoom.current;
        const tx = targetX.current;
        const ty = targetY.current;
        if (Math.abs(cam.zoom - tz) > 0.0005 || Math.abs(cam.x - tx) > 0.3 || Math.abs(cam.y - ty) > 0.3) {
          newZoom = cam.zoom + (tz - cam.zoom) * 0.25;
          newX = cam.x + (tx - cam.x) * 0.25;
          newY = cam.y + (ty - cam.y) * 0.25;
          changed = true;
        }
      }

      if (changed) {
        lastSetZoom.current = newZoom;
        lastSetX.current = newX;
        lastSetY.current = newY;
        setCamera({ zoom: newZoom, x: newX, y: newY });
      }

      draw();
      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw, setCamera]);

  // ── Pan ─────────────────────────────────────────────────────────────────────

  /** Coordenadas del evento relativas al canvas (no a la ventana) */
  const canvasXY = (e: React.MouseEvent) => ({
    x: e.nativeEvent.offsetX,
    y: e.nativeEvent.offsetY,
  });

  const onMouseDown = (e: React.MouseEvent) => {
    const { x, y } = canvasXY(e);
    dragging.current = true;
    lastPos.current = { x, y };
    velocity.current = { vx: 0, vy: 0 };
    // Cancelar animación en curso al empezar a arrastrar
    anim.current.active = false;
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
      const dt = Math.max(1, now - lastTime.current);
      const dx = (cx - lastPos.current.x) / cameraRef.current.zoom;
      const dy = (cy - lastPos.current.y) / cameraRef.current.zoom;
      velocity.current = { vx: dx / dt, vy: dy / dt };
      lastTime.current = now;

      const newX = cameraRef.current.x - dx;
      const newY = cameraRef.current.y - dy;
      setCamera({ ...cameraRef.current, x: newX, y: newY });
      lastSetZoom.current = cameraRef.current.zoom;
      lastSetX.current = newX;
      lastSetY.current = newY;
      targetX.current = newX;
      targetY.current = newY;

      lastPos.current = { x: cx, y: cy };
    } else {
      // Solo detectar hover cuando los pins son visibles
      const zoom = cameraRef.current.zoom;
      const pinsVisible = zoom >= 0.70;
      const idea = pinsVisible
        ? hitTestIdea(ideas, { x: cx, y: cy }, cameraRef.current, width, height)
        : null;

      const newHovered = idea?.id ?? null;
      if (newHovered !== hoveredIdea.current) {
        hoveredIdea.current = newHovered;
        draw();
      }

      // Cursor: pointer si hay idea o si hay tag clickable
      const overTag = !idea && !!hitTestTagScreen(tags, { x: cx, y: cy }, cameraRef.current, width, height);
      if (canvas) canvas.style.cursor = (idea || overTag) ? 'pointer' : 'grab';
    }
  };

  // ── Zoom suave (acumula en targetZoom, el lerp lo aplica) ───────────────────
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const { x: cx, y: cy } = canvasXY(e);
    const rawDelta = e.deltaY;
    const normDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 80);
    const factor = Math.pow(0.997, normDelta);
    const clamped = Math.max(0.08, Math.min(20, targetZoom.current * factor));

    const cam = cameraRef.current;
    const before = {
      x: (cx - width / 2) / cam.zoom + cam.x,
      y: (cy - height / 2) / cam.zoom + cam.y,
    };
    const after = {
      x: (cx - width / 2) / clamped + cam.x,
      y: (cy - height / 2) / clamped + cam.y,
    };

    const newX = cam.x + (before.x - after.x);
    const newY = cam.y + (before.y - after.y);

    targetZoom.current = clamped;
    targetX.current = newX;
    targetY.current = newY;
    lastSetZoom.current = cam.zoom;
    lastSetX.current = newX;
    lastSetY.current = newY;
    setCamera({ zoom: cam.zoom, x: newX, y: newY });
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
    const cam = cameraRef.current;
    const before = {
      x: (cx - width / 2) / cam.zoom + cam.x,
      y: (cy - height / 2) / cam.zoom + cam.y,
    };
    const after = {
      x: (cx - width / 2) / newTarget + cam.x,
      y: (cy - height / 2) / newTarget + cam.y,
    };

    const newX = cam.x + (before.x - after.x);
    const newY = cam.y + (before.y - after.y);
    targetZoom.current = newTarget;
    targetX.current = newX;
    targetY.current = newY;
    lastSetZoom.current = cam.zoom;
    lastSetX.current = newX;
    lastSetY.current = newY;
    setCamera({ zoom: cam.zoom, x: newX, y: newY });
  };

  // Click: un solo clic en un pin navega directamente a Cerebro; en un tag hace zoom al tag
  const onClick = (e: React.MouseEvent) => {
    const { x: cx, y: cy } = canvasXY(e);

    // Prioridad 1: pin/idea (sólo si el zoom es suficiente para verlos)
    if (cameraRef.current.zoom >= 0.70) {
      const idea = hitTestIdea(ideas, { x: cx, y: cy }, cameraRef.current, width, height);
      if (idea) {
        onSelectIdea(idea);
        // No navegamos directamente — el popup en App.tsx se encargará
        return;
      }
    }

    // Prioridad 2: tag (círculo) — animación ease-out hacia el interior con subtags
    const tag = hitTestTagScreen(tags, { x: cx, y: cy }, cameraRef.current, width, height);
    if (tag) {
      onFocusTag(tag);

      const worldR = tag.radius ?? 300;
      // Avance gradual: zoom para que el círculo ocupe ~50% de la pantalla
      // en vez de ~90%, así se ven los hijos sin saltar niveles
      const endZoom = Math.min(20, Math.min(width, height) / (worldR * 3.2));

      // Si hay animación en curso, calcular la posición real interpolada en este instante
      // para arrancar desde ahí sin salto brusco
      let fromZoom: number;
      let fromX: number;
      let fromY: number;
      if (anim.current.active) {
        const elapsed = performance.now() - anim.current.startTime;
        const raw = Math.min(elapsed / anim.current.duration, 1);
        const ease = 1 - Math.pow(1 - raw, 3);
        fromZoom = anim.current.startZoom + (anim.current.endZoom - anim.current.startZoom) * ease;
        fromX = anim.current.startX + (anim.current.endX - anim.current.startX) * ease;
        fromY = anim.current.startY + (anim.current.endY - anim.current.startY) * ease;
      } else {
        fromZoom = cameraRef.current.zoom;
        fromX = cameraRef.current.x;
        fromY = cameraRef.current.y;
      }

      anim.current = {
        startZoom: fromZoom, endZoom,
        startX: fromX, endX: tag.x,
        startY: fromY, endY: tag.y,
        startTime: performance.now(),
        duration: 1000,
        active: true,
      };
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