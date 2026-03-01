// Construye breadcrumbs a partir de un path
import { getTagAncestors, getTagByPath } from '../mockApi';

export function buildBreadcrumbs(path: string | null): { label: string; path: string }[] {
  if (!path) return [];
  const ancestors = getTagAncestors(path);
  const crumbs = ancestors.map(t => ({ label: t.name, path: t.path }));
  const self = getTagByPath(path);
  if (self) crumbs.push({ label: self.name, path: self.path });
  return crumbs;
}
