/**
 * mapService.ts
 *
 * Construye el grafo del mapa con la MISMA estructura jerárquica que mockData.ts:
 *
 *   L0 – Raíces (dev, ia, infra, soft) — planetas grandes en cuadrado
 *   L1 – Hijos  (dev/frontend, dev/backend…) — orbitando dentro del L0
 *   L2 – Nietos (dev/frontend/react…) — orbitando dentro del L1
 *
 * Los tags de la BD tienen paths tipo "dev/frontend/react".
 * Inferimos el árbol leyendo los paths.
 */

import apiClient from '@shared/api/apiClient';
import { ApiResponse } from '@shared/types/common.types';
import { Note } from '../../cerebro/types/note.types';
import {
  TagNode, Idea,
  BASE_RADIUS_L0, CHILD_RATIO_L1, CHILD_RATIO_L2,
  computeL0Radius,
} from '../../../mockData';

export interface MapData {
  tags: TagNode[];
  ideas: Idea[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Posiciona N raíces sin que se solapen nunca, escalando el radio orbital
function rootPositions(roots: string[], minOrbitDist: number): Record<string, { x: number; y: number }> {
  const n    = roots.length;
  const pos: Record<string, { x: number; y: number }> = {};

  if (n === 1) {
    pos[roots[0]] = { x: 0, y: 0 };
    return pos;
  }

  // Para N planetas en círculo, la distancia mínima entre dos vecinos
  // es 2 * orbitDist * sin(π/N). Queremos que ≥ minOrbitDist * 0.9
  // → orbitDist = minOrbitDist * 0.9 / (2 * sin(π/N))
  //   pero nunca menor que minOrbitDist.
  const minSeparation = minOrbitDist * 0.95;
  const orbitDist = Math.max(
    minOrbitDist,
    minSeparation / (2 * Math.sin(Math.PI / n))
  );

  // Para ≤4: ángulos fijos tipo cuadrado/rombo para visualmente bonito
  // Para >4: reparto uniforme empezando en -90° (arriba)
  const fixedAngles: Record<number, number[]> = {
    2: [-90, 90],
    3: [-90, 150, 30],
    4: [180, 0, 90, 270],
  };

  const angles = fixedAngles[n] ??
    Array.from({ length: n }, (_, i) => -90 + (360 / n) * i);

  roots.forEach((r, i) => {
    pos[r] = polar(0, 0, orbitDist, angles[i]);
  });

  return pos;
}

// Distribuye hijos en órbita dentro de su padre
const L1_ORBIT_RATIO = 0.42;
const L2_ORBIT_RATIO = 0.38;

function childAngles(n: number, baseAngle = 0): number[] {
  if (n === 1) return [baseAngle + 60];
  return Array.from({ length: n }, (_, i) => baseAngle + (360 / n) * i);
}

// ── Función principal ─────────────────────────────────────────────────────────

export async function fetchMapData(): Promise<MapData> {
  const res   = await apiClient.get<ApiResponse<Note[]>>('/notes');
  const notes: Note[] = res.data.data;

  // 1. Recolectar todos los tags únicos que aparecen en las notas
  const allTagPaths = new Set<string>();
  for (const note of notes) {
    for (const t of (note.tags ?? [])) allTagPaths.add(t.name);
  }

  // 2. Inferir árbol de paths: agrupar por nivel
  //    "dev/frontend/react"  → level 2, parent "dev/frontend"
  //    "dev/frontend"        → level 1, parent "dev"
  //    "dev"                 → level 0, parent null
  const tagSet = new Set<string>();
  for (const path of allTagPaths) {
    const parts = path.split('/');
    // Registrar el propio path y todos sus ancestros
    for (let len = 1; len <= parts.length; len++) {
      tagSet.add(parts.slice(0, len).join('/'));
    }
  }

  // 3. Agrupar por nivel
  const byLevel: Map<number, string[]> = new Map([[0, []], [1, []], [2, []]]);
  for (const path of tagSet) {
    const level = path.split('/').length - 1;
    if (level <= 2) byLevel.get(level)!.push(path);
  }

  // Ordenar alfabéticamente para consistencia
  for (const arr of byLevel.values()) arr.sort();

  // 4. Contar notas por tag (para calcular radios)
  const notesPerTag = new Map<string, number>();
  for (const note of notes) {
    for (const t of (note.tags ?? [])) {
      notesPerTag.set(t.name, (notesPerTag.get(t.name) ?? 0) + 1);
    }
  }

  // También propagar counts hacia arriba (un L0 hereda las notas de sus descendientes)
  function countForPath(path: string): number {
    let total = 0;
    for (const [tag, count] of notesPerTag) {
      if (tag === path || tag.startsWith(path + '/')) total += count;
    }
    return total || 1;
  }

  // 5. Calcular radios L0
  const l0Paths     = byLevel.get(0)!;
  const l0Children  = new Map<string, string[]>(); // l0 → sus hijos L1
  for (const l1 of byLevel.get(1)!) {
    const parent = l1.split('/').slice(0, 1).join('/');
    if (!l0Children.has(parent)) l0Children.set(parent, []);
    l0Children.get(parent)!.push(l1);
  }

  // Radio L0 proporcional al nº de hijos L1 (igual que mockData)
  const l0Radii = new Map<string, number>();
  for (const l0 of l0Paths) {
    const nChildren = (l0Children.get(l0) ?? []).length;
    l0Radii.set(l0, computeL0Radius(nChildren));
  }

  const maxR0    = Math.max(...l0Radii.values(), BASE_RADIUS_L0);
  const ORBIT_DIST = maxR0 * 2.05;

  // 6. Posicionar L0 en cuadrado/círculo
  const l0Pos = rootPositions(l0Paths, ORBIT_DIST);

  // 7. Construir nodos L0
  const nodeMap = new Map<string, TagNode>();
  for (const l0 of l0Paths) {
    const name = l0.split('/').pop()!;
    nodeMap.set(l0, {
      id:         l0,
      name:       name.charAt(0).toUpperCase() + name.slice(1),
      path:       l0,
      parentPath: null,
      level:      0,
      x:          l0Pos[l0].x,
      y:          l0Pos[l0].y,
      radius:     l0Radii.get(l0)!,
      confianza:  1.0,
    });
  }

  // 8. Construir nodos L1 orbitando dentro de su L0
  const l1Paths = byLevel.get(1)!;
  const l1Children = new Map<string, string[]>(); // l1 → sus hijos L2
  for (const l2 of byLevel.get(2)!) {
    const parent = l2.split('/').slice(0, 2).join('/');
    if (!l1Children.has(parent)) l1Children.set(parent, []);
    l1Children.get(parent)!.push(l2);
  }

  const l1ByParent = new Map<string, string[]>();
  for (const l1 of l1Paths) {
    const parent = l1.split('/')[0];
    if (!l1ByParent.has(parent)) l1ByParent.set(parent, []);
    l1ByParent.get(parent)!.push(l1);
  }

  for (const [l0path, children] of l1ByParent) {
    const l0Node  = nodeMap.get(l0path)!;
    if (!l0Node) continue;
    const angles  = childAngles(children.length, 60);
    const orbit   = l0Node.radius! * L1_ORBIT_RATIO;

    children.forEach((l1, i) => {
      const count     = countForPath(l1);
      const maxCount  = Math.max(...children.map(c => countForPath(c)), 1);
      const confianza = 0.45 + 0.5 * (count / maxCount);
      const radius    = BASE_RADIUS_L0 * CHILD_RATIO_L1 * confianza;
      const pos       = polar(l0Node.x, l0Node.y, orbit, angles[i]);
      const name      = l1.split('/').pop()!;

      nodeMap.set(l1, {
        id:         l1,
        name:       name.charAt(0).toUpperCase() + name.slice(1),
        path:       l1,
        parentPath: l0path,
        level:      1,
        x:          pos.x,
        y:          pos.y,
        radius,
        confianza,
      });
    });
  }

  // 9. Construir nodos L2 orbitando dentro de su L1
  const l2ByParent = new Map<string, string[]>();
  for (const l2 of byLevel.get(2)!) {
    const parent = l2.split('/').slice(0, 2).join('/');
    if (!l2ByParent.has(parent)) l2ByParent.set(parent, []);
    l2ByParent.get(parent)!.push(l2);
  }

  for (const [l1path, children] of l2ByParent) {
    const l1Node = nodeMap.get(l1path);
    if (!l1Node) continue;
    const angles = childAngles(children.length, 90);
    const orbit  = l1Node.radius! * L2_ORBIT_RATIO;

    children.forEach((l2, i) => {
      const count     = countForPath(l2);
      const maxCount  = Math.max(...children.map(c => countForPath(c)), 1);
      const confianza = 0.45 + 0.5 * (count / maxCount);
      const radius    = BASE_RADIUS_L0 * CHILD_RATIO_L1 * confianza * CHILD_RATIO_L2;
      const pos       = polar(l1Node.x, l1Node.y, orbit, angles[i]);
      const name      = l2.split('/').pop()!;

      nodeMap.set(l2, {
        id:         l2,
        name:       name.charAt(0).toUpperCase() + name.slice(1),
        path:       l2,
        parentPath: l1path,
        level:      2,
        x:          pos.x,
        y:          pos.y,
        radius,
        confianza,
      });
    });
  }

  // 10. Construir ideas — posicionar dentro del tag de mayor nivel
  const ideas: Idea[] = notes.map(note => {
    const noteTags = note.tags ?? [];

    // Buscar el tag de mayor nivel (más profundo) entre los asignados
    let bestTag: TagNode | null = null;
    for (const t of noteTags) {
      const node = nodeMap.get(t.name);
      if (node && (!bestTag || node.level > bestTag.level)) bestTag = node;
    }

    let pos = { x: 0, y: 0 };
    if (bestTag) {
      const radius = bestTag.radius ?? BASE_RADIUS_L0 * CHILD_RATIO_L1 * 0.5;
      const angle  = (strHash(note.id) * 137.508) % 360;
      pos = polar(bestTag.x, bestTag.y, radius * 0.45, angle);
    }

    const createdAt = typeof note.createdAt === 'string'
      ? note.createdAt.slice(0, 10)
      : String(note.createdAt);

    // Solo los tags hoja (no prefijo de otro tag de la misma nota)
    const rawTagNames = noteTags.map(t => t.name);
    const leafTagNames = rawTagNames.filter(
      name => !rawTagNames.some(other => other !== name && other.startsWith(name + '/'))
    );

    return {
      id:        note.id,
      title:     note.title,
      excerpt:   note.summary ?? '',
      createdAt,
      tagPaths:  leafTagNames,
      x:         pos.x,
      y:         pos.y,
    };
  });

  return { tags: Array.from(nodeMap.values()), ideas };
}
