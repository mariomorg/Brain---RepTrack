import { TagNode, Idea } from '../mockData';
import { Camera, worldToScreen } from './camera';

export function hitTestTag(tags: TagNode[], worldPoint: { x: number; y: number }): TagNode | null {
  for (const tag of tags) {
    const radius = tag.level === 0 ? 120 : tag.level === 1 ? 80 : 55;
    const dx = worldPoint.x - tag.x;
    const dy = worldPoint.y - tag.y;
    if (dx * dx + dy * dy <= radius * radius) {
      return tag;
    }
  }
  return null;
}

/**
 * Hit test de TagNode en coordenadas de PANTALLA.
 * Devuelve el tag más pequeño (más profundo) que contenga el punto,
 * para que al hacer click en un subtag dentro de un tag padre se seleccione el hijo.
 */
export function hitTestTagScreen(
  tags: TagNode[],
  screenPoint: { x: number; y: number },
  camera: Camera,
  canvasW: number,
  canvasH: number,
): TagNode | null {
  let best: TagNode | null = null;
  let bestRadius = Infinity;

  for (const tag of tags) {
    const worldR = tag.radius ?? 300;
    const screenR = worldR * camera.zoom;
    // Sólo tags que tengan un radio visible en pantalla
    if (screenR < 10) continue;

    const sc = worldToScreen(camera, tag.x, tag.y, canvasW, canvasH);
    const dx = screenPoint.x - sc.x;
    const dy = screenPoint.y - sc.y;
    if (dx * dx + dy * dy <= screenR * screenR) {
      // Preferir el círculo más pequeño (tag más específico)
      if (screenR < bestRadius) {
        bestRadius = screenR;
        best = tag;
      }
    }
  }
  return best;
}

/**
 * Hit test en coordenadas de PANTALLA.
 * Detecta tanto el círculo del pin como la pill del texto.
 * canvas{W,H} son las dimensiones del canvas para worldToScreen.
 */
export function hitTestIdea(
  ideas: Idea[],
  screenPoint: { x: number; y: number },
  camera: Camera,
  canvasW: number,
  canvasH: number,
): Idea | null {
  const zoom = camera.zoom;
  const pinR = Math.max(4, 7 * zoom);       // mismo cálculo que el draw
  const hitR = pinR + 5;                    // 5px de margen táctil

  // Estimar ancho medio de pill (sin canvas, usamos aprox 11px/carácter a fs~11)
  const fs = Math.max(9, 11 * Math.min(zoom, 1.4));
  const pillVisible = zoom >= 0.50;

  for (const idea of ideas) {
    const { x, y } = worldToScreen(camera, idea.x, idea.y, canvasW, canvasH);
    const px = screenPoint.x;
    const py = screenPoint.y;

    // 1. Hit en el círculo del pin
    const dx = px - x;
    const dy = py - y;
    if (dx * dx + dy * dy <= hitR * hitR) return idea;

    // 2. Hit en la pill del texto (si es visible)
    if (pillVisible) {
      const approxTextW = idea.title.length * fs * 0.6;
      const pH = fs + 7;
      const pW = approxTextW + 14;
      const lx = x + pinR + 6;        // misma posición que en draw
      const ly = y - pH / 2;
      if (px >= lx && px <= lx + pW && py >= ly && py <= ly + pH) return idea;
    }
  }
  return null;
}
