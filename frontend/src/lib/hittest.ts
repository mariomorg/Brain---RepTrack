import { TagNode, Idea } from '../mockData';

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

export function hitTestIdea(ideas: Idea[], worldPoint: { x: number; y: number }): Idea | null {
  for (const idea of ideas) {
    const dx = worldPoint.x - idea.x;
    const dy = worldPoint.y - idea.y;
    if (dx * dx + dy * dy <= 18 * 18) {
      return idea;
    }
  }
  return null;
}
