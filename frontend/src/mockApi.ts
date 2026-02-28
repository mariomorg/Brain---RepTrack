import { TAGS, IDEAS, TagNode, Idea } from './mockData';

export async function getTagsByLevel(maxLevel: number): Promise<TagNode[]> {
  return TAGS.filter(tag => tag.level <= maxLevel);
}

export async function getIdeasVisible(zoom: number, focusPath: string | null): Promise<Idea[]> {
  if (zoom < 2.6) return [];
  let ideas = IDEAS;
  if (focusPath) {
    ideas = ideas.filter(idea => idea.tagPaths.some(tp => tp.startsWith(focusPath)));
  }
  return ideas;
}

export async function getIdeasForTag(path: string): Promise<Idea[]> {
  return IDEAS.filter(idea => idea.tagPaths.some(tp => tp.startsWith(path)));
}

// Helpers
export function getTagChildren(path: string): TagNode[] {
  return TAGS.filter(tag => tag.parentPath === path);
}

export function getTagAncestors(path: string): TagNode[] {
  const ancestors: TagNode[] = [];
  let current = TAGS.find(t => t.path === path);
  while (current && current.parentPath) {
    const parent = TAGS.find(t => current && t.path === current.parentPath);
    if (parent) ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}

export function getTagByPath(path: string): TagNode | undefined {
  return TAGS.find(t => t.path === path);
}

export function filterTagsInSubtree(path: string): TagNode[] {
  return TAGS.filter(tag => tag.path.startsWith(path));
}

export function filterIdeasInSubtree(path: string): Idea[] {
  return IDEAS.filter(idea => idea.tagPaths.some(tp => tp.startsWith(path)));
}
