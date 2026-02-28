// Lógica de cámara y transformaciones
export type Camera = {
  x: number;
  y: number;
  zoom: number;
};

export function worldToScreen(camera: Camera, wx: number, wy: number, width: number, height: number) {
  // Transforma coordenadas del mundo a pantalla
  const sx = (wx - camera.x) * camera.zoom + width / 2;
  const sy = (wy - camera.y) * camera.zoom + height / 2;
  return { x: sx, y: sy };
}

export function screenToWorld(camera: Camera, sx: number, sy: number, width: number, height: number) {
  // Transforma coordenadas de pantalla a mundo
  const wx = (sx - width / 2) / camera.zoom + camera.x;
  const wy = (sy - height / 2) / camera.zoom + camera.y;
  return { x: wx, y: wy };
}

export function applyZoomAtPoint(camera: Camera, zoomFactor: number, screenX: number, screenY: number, width: number, height: number): Camera {
  // Zoom centrado en el cursor
  const before = screenToWorld(camera, screenX, screenY, width, height);
  const newZoom = Math.max(0.5, Math.min(4, camera.zoom * zoomFactor));
  const after = screenToWorld({ ...camera, zoom: newZoom }, screenX, screenY, width, height);
  return {
    x: camera.x + (before.x - after.x),
    y: camera.y + (before.y - after.y),
    zoom: newZoom,
  };
}
