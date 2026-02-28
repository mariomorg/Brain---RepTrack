import React, { useRef, useEffect, useCallback } from 'react';
import { TagNode, Idea, ROOT_COLORS } from '../mockData';
import { Camera, worldToScreen, screenToWorld, applyZoomAtPoint } from '../lib/camera';
import { getMaxLevelForZoom, shouldShowPins } from '../lib/lod';
import { hitTestTag, hitTestIdea } from '../lib/hittest';

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

const GRID_SPACING = 100;
const ANIMATION_DURATION = 250;

export const MapCanvas: React.FC<MapCanvasProps> = ({
  camera,
  setCamera,
  tags,
  ideas,
  focusTagPath,
  selectedTag,
  selectedIdea,
  onSelectTag,
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
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // --- NUEVO DIBUJADO JERÁRQUICO ---
    // Parámetros de radio base
    const BASE_RADII = [220, 90, 45]; // 0: muy grande, 1: medio, 2: pequeño
    const MAX_LEVEL = 3;
    // Simulación de confianza: para demo, hijos tienen confianza random (0.5-1.0)
    const getConfidence = (tag) => {
      if (tag.level === 0) return 1.0;
      if (tag.confianza !== undefined) return tag.confianza;
      // fallback: random
      return 0.5 + (Math.abs(tag.x + tag.y) % 50) / 100;
    };

    // Construir árbol de tags por path
    const tagMap = new Map();
    tags.forEach(tag => tagMap.set(tag.path, tag));
    // Agrupar hijos por parentPath
    const childrenMap = new Map();
    tags.forEach(tag => {
      if (!childrenMap.has(tag.parentPath)) childrenMap.set(tag.parentPath, []);
      childrenMap.get(tag.parentPath).push(tag);
    });

    // Dibuja recursivo
    function drawTag(tag, level) {
      if (level >= MAX_LEVEL) return;
      const { x, y } = worldToScreen(camera, tag.x, tag.y, width, height);
      let radius = BASE_RADII[level] || 30;
      if (level > 0) {
        radius = radius * getConfidence(tag);
      }
      const color = ROOT_COLORS[tag.path.split('/')[0]] || '#888';
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius * camera.zoom, 0, 2 * Math.PI);
      ctx.fillStyle = color + '22';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();
      // Texto
      ctx.fillStyle = '#222';
      ctx.font = `${Math.max(16, 22 * camera.zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (level === 0) {
        ctx.globalAlpha = 1;
        ctx.fillText(tag.name, x, y);
        ctx.globalAlpha = 1;
      } else if (level === 1 && camera.zoom > 0.8) {
        ctx.globalAlpha = 0.8;
        ctx.fillText(tag.name, x, y);
        ctx.globalAlpha = 1;
      } else if (level === 2 && camera.zoom > 1.3) {
        ctx.globalAlpha = 0.7;
        ctx.fillText(tag.name, x, y);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      // Hijos
      const children = childrenMap.get(tag.path) || [];
      for (const child of children) {
        drawTag(child, level + 1);
      }
    }
    // Dibuja solo los roots (nivel 0)
    for (const tag of tags) {
      if (tag.level === 0) {
        drawTag(tag, 0);
      }
    }
    // Dibuja pins de ideas
    if (shouldShowPins(camera.zoom)) {
      for (const idea of ideas) {
        const { x, y } = worldToScreen(camera, idea.x, idea.y, width, height);
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 18 * camera.zoom, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        // Punto interior
        ctx.beginPath();
        ctx.arc(x, y, 7 * camera.zoom, 0, 2 * Math.PI);
        ctx.fillStyle = '#43BCCD';
        ctx.fill();
        // Selección
        if (selectedIdea && selectedIdea.id === idea.id) {
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#F45B69';
          ctx.beginPath();
          ctx.arc(x, y, 20 * camera.zoom, 0, 2 * Math.PI);
          ctx.stroke();
        }
        // Título
        if (camera.zoom > 2.8) {
          ctx.fillStyle = '#222';
          ctx.font = `${Math.max(12, 14 * camera.zoom)}px sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(idea.title.length > 18 ? idea.title.slice(0, 18) + '…' : idea.title, x + 22 * camera.zoom, y);
        }
        ctx.restore();
      }
    }
  }, [camera, tags, ideas, width, height, selectedTag, selectedIdea]);

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
    // Prioridad: idea > tag
    if (shouldShowPins(camera.zoom)) {
      const idea = hitTestIdea(ideas, world);
      if (idea) {
        onSelectIdea(idea);
        return;
      }
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
