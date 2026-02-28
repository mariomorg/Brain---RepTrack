// LOD helpers

/**
 * Minimum screen-space radius (px) a circle must have to be rendered.
 * Below this the circle is too small to be useful.
 */
export const MIN_SCREEN_RADIUS = 14;

/**
 * Returns true if a node at world-radius `worldR` and current `zoom`
 * should be drawn (its screen radius is large enough to be visible).
 */
export function shouldDrawNode(worldR: number, zoom: number): boolean {
  return worldR * zoom >= MIN_SCREEN_RADIUS;
}

export function shouldShowPins(zoom: number): boolean {
  return zoom >= 2.6;
}
