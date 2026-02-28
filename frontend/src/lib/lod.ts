// LOD helpers
export function getMaxLevelForZoom(zoom: number): number {
  if (zoom < 0.9) return 0;
  if (zoom < 1.8) return 1;
  return 2;
}

export function shouldShowPins(zoom: number): boolean {
  return zoom >= 2.6;
}
