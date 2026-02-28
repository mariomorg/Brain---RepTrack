// Datos mock para el mapa de tags e ideas
export type TagNode = {
  id: string;
  name: string;
  path: string;
  parentPath: string | null;
  level: number;
  x: number;
  y: number;
  confianza?: number; // 0.0 - 1.0, used for sizing children
  radius?: number;    // world-space radius, computed from child count + confianza
};

export type Idea = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  tagPaths: string[];
  x: number;
  y: number;
};

// Colores por root
export const ROOT_COLORS: Record<string, string> = {
  // Legacy mocks
  hogar: '#4F8A8B',
  uni: '#F9A826',
  trabajo: '#F45B69',
  salud: '#43BCCD',
  // Tech domains
  dev:     '#4FC3F7',   // azul cielo
  ia:      '#A78BFA',   // violeta
  infra:   '#F472B6',   // rosa
  soft:    '#34D399',   // verde menta
  // Lifestyle domains
  cocina:  '#FBBF24',   // amarillo cálido
  deporte: '#F97316',   // naranja
  viajes:  '#38BDF8',   // azul claro
};

// Radios base en coordenadas mundo:
//   Nivel 0: se calcula según el nº de hijos L1  (ver computeL0Radius)
//   Nivel 1: radius_L0 * confianza * CHILD_RATIO_L1
//   Nivel 2: radius_L1 * confianza * CHILD_RATIO_L2
//
// Fórmula L0: BASE_L0_MIN + (nHijos - 1) * CHILD_BUMP
// → con 3 hijos ≈ 500, con 4 hijos ≈ 600, con 5 hijos ≈ 700
export const BASE_RADIUS_L0 = 700;   // compatibilidad: valor máximo / referencia global
export const BASE_L0_MIN   = 400;    // radio mínimo cuando sólo hay 1 hijo
export const CHILD_BUMP    = 80;     // radio extra por cada hijo adicional
export const CHILD_RATIO_L1 = 0.28;
export const CHILD_RATIO_L2 = 0.30;

/** Radio de un nodo L0 en función del número de hijos directos */
export function computeL0Radius(nChildren: number): number {
  return BASE_L0_MIN + Math.max(0, nChildren - 1) * CHILD_BUMP;
}

// Helper de posición polar
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ── CONTEO de hijos por root (definido antes de construir arrays) ─────────────
// hogar: 3 hijos  →  radius ≈ 560
// uni:   2 hijos  →  radius ≈ 480
// trabajo: 2 hijos → radius ≈ 480
// salud: 2 hijos  →  radius ≈ 480
const ROOT_CHILD_COUNT: Record<string, number> = {
  hogar: 3, uni: 2, trabajo: 2, salud: 2,
};

// Distancia entre centros de roots: suficiente para que no se solapen.
// Separación = (r_a + r_b) * 1.15 para dejar un margen cómodo.
// Para la disposición en cuadrado usamos el máximo radio como referencia.
const maxR0 = computeL0Radius(
  Math.max(...Object.values(ROOT_CHILD_COUNT))
);
// Roots dispuestas en cuadrado; cada eje ±ORBIT_DIST del centro
export const MAP_ORBIT_DIST = maxR0 * 2.05;   // antes fijo en 1800; ahora ~1300-1400 px
export const MAP_MAX_R0     = maxR0;
const ORBIT_DIST = MAP_ORBIT_DIST;

// ── NIVEL 0: roots ────────────────────────────────────────────────────────────
const roots: TagNode[] = [
  { id: 'hogar',   name: 'Hogar',   path: 'hogar',   parentPath: null, level: 0, x: -ORBIT_DIST, y: 0,            radius: computeL0Radius(ROOT_CHILD_COUNT['hogar']) },
  { id: 'uni',     name: 'Uni',     path: 'uni',     parentPath: null, level: 0, x:  ORBIT_DIST, y: 0,            radius: computeL0Radius(ROOT_CHILD_COUNT['uni']) },
  { id: 'trabajo', name: 'Trabajo', path: 'trabajo', parentPath: null, level: 0, x: 0,           y:  ORBIT_DIST,  radius: computeL0Radius(ROOT_CHILD_COUNT['trabajo']) },
  { id: 'salud',   name: 'Salud',   path: 'salud',   parentPath: null, level: 0, x: 0,           y: -ORBIT_DIST,  radius: computeL0Radius(ROOT_CHILD_COUNT['salud']) },
];

// ── NIVEL 1: hijos dentro del padre ──────────────────────────────────────────
// Órbita: 40% del radio del padre (igual que antes, pero ahora el radio del padre varía)
function l0Root(id: string): TagNode { return roots.find(r => r.id === id)! }
function l0R(id: string): number     { return l0Root(id).radius! }
const L1_ORBIT_RATIO = 0.42;   // fracción del radio L0 como órbita de hijos L1

const hijos: TagNode[] = [
  // Hogar (3 hijos → r≈560, órbita≈235)
  { id: 'hogar_electro',    name: 'Electrodomésticos', path: 'hogar/electrodomesticos',   parentPath: 'hogar',   level: 1, confianza: 0.9,  ...polar(-ORBIT_DIST, 0,           l0R('hogar')   * L1_ORBIT_RATIO,  30) },
  { id: 'hogar_cocina',     name: 'Cocina',            path: 'hogar/cocina',              parentPath: 'hogar',   level: 1, confianza: 0.65, ...polar(-ORBIT_DIST, 0,           l0R('hogar')   * L1_ORBIT_RATIO, 150) },
  { id: 'hogar_limpieza',   name: 'Limpieza',          path: 'hogar/limpieza',            parentPath: 'hogar',   level: 1, confianza: 0.45, ...polar(-ORBIT_DIST, 0,           l0R('hogar')   * L1_ORBIT_RATIO, 270) },
  // Uni (2 hijos → r≈480, órbita≈202)
  { id: 'uni_so',           name: 'Sistemas Op.',      path: 'uni/sistemas_operativos',   parentPath: 'uni',     level: 1, confianza: 0.8,  ...polar( ORBIT_DIST, 0,           l0R('uni')     * L1_ORBIT_RATIO,  60) },
  { id: 'uni_bd',           name: 'Bases de Datos',    path: 'uni/bases_de_datos',        parentPath: 'uni',     level: 1, confianza: 0.55, ...polar( ORBIT_DIST, 0,           l0R('uni')     * L1_ORBIT_RATIO, 180) },
  // Trabajo (2 hijos → r≈480, órbita≈202)
  { id: 'trabajo_devops',   name: 'DevOps',            path: 'trabajo/devops',            parentPath: 'trabajo', level: 1, confianza: 0.95, ...polar(0, ORBIT_DIST,            l0R('trabajo') * L1_ORBIT_RATIO,  90) },
  { id: 'trabajo_frontend', name: 'Frontend',          path: 'trabajo/frontend',          parentPath: 'trabajo', level: 1, confianza: 0.7,  ...polar(0, ORBIT_DIST,            l0R('trabajo') * L1_ORBIT_RATIO, 210) },
  // Salud (2 hijos → r≈480, órbita≈202)
  { id: 'salud_entrenamiento', name: 'Entrenamiento',  path: 'salud/entrenamiento',       parentPath: 'salud',   level: 1, confianza: 0.85, ...polar(0, -ORBIT_DIST,           l0R('salud')   * L1_ORBIT_RATIO, 120) },
  { id: 'salud_nutricion',  name: 'Nutrición',         path: 'salud/nutricion',           parentPath: 'salud',   level: 1, confianza: 0.6,  ...polar(0, -ORBIT_DIST,           l0R('salud')   * L1_ORBIT_RATIO, 300) },
];

// Añadir campo radius a hijos (calculado igual que tagRadius)
hijos.forEach(h => {
  h.radius = BASE_RADIUS_L0 * CHILD_RATIO_L1 * (h.confianza ?? 0.5);
});

// ── NIVEL 2: nietos dentro de su padre (nivel 1) ──────────────────────────────
function l1Pos(id: string)  { return hijos.find(h => h.id === id)! }
function l1R(id: string)    { return l1Pos(id).radius! }
const L2_ORBIT_RATIO = 0.38;

const nietos: TagNode[] = [
  // hogar/electrodomesticos
  { id: 'hogar_electro_lavadoras', name: 'Lavadoras',       path: 'hogar/electrodomesticos/lavadoras', parentPath: 'hogar/electrodomesticos', level: 2, confianza: 0.9,
    ...polar(l1Pos('hogar_electro').x, l1Pos('hogar_electro').y, l1R('hogar_electro') * L2_ORBIT_RATIO, 60) },
  { id: 'hogar_electro_neveras',   name: 'Neveras',         path: 'hogar/electrodomesticos/neveras',   parentPath: 'hogar/electrodomesticos', level: 2, confianza: 0.55,
    ...polar(l1Pos('hogar_electro').x, l1Pos('hogar_electro').y, l1R('hogar_electro') * L2_ORBIT_RATIO, 200) },
  // hogar/cocina
  { id: 'hogar_cocina_sartenes',   name: 'Sartenes',        path: 'hogar/cocina/sartenes',             parentPath: 'hogar/cocina',            level: 2, confianza: 0.75,
    ...polar(l1Pos('hogar_cocina').x, l1Pos('hogar_cocina').y, l1R('hogar_cocina') * L2_ORBIT_RATIO, 120) },
  // hogar/limpieza
  { id: 'hogar_limpieza_productos',name: 'Productos',       path: 'hogar/limpieza/productos',          parentPath: 'hogar/limpieza',          level: 2, confianza: 0.85,
    ...polar(l1Pos('hogar_limpieza').x, l1Pos('hogar_limpieza').y, l1R('hogar_limpieza') * L2_ORBIT_RATIO, 240) },
  // uni/sistemas_operativos
  { id: 'uni_so_planif',           name: 'Planificación CPU',path: 'uni/sistemas_operativos/planificacion_cpu', parentPath: 'uni/sistemas_operativos', level: 2, confianza: 0.7,
    ...polar(l1Pos('uni_so').x, l1Pos('uni_so').y, l1R('uni_so') * L2_ORBIT_RATIO, 90) },
  // uni/bases_de_datos
  { id: 'uni_bd_indexes',          name: 'Indexes',         path: 'uni/bases_de_datos/indexes',        parentPath: 'uni/bases_de_datos',      level: 2, confianza: 0.8,
    ...polar(l1Pos('uni_bd').x, l1Pos('uni_bd').y, l1R('uni_bd') * L2_ORBIT_RATIO, 210) },
  // trabajo/devops
  { id: 'trabajo_devops_docker',   name: 'Docker',          path: 'trabajo/devops/docker',             parentPath: 'trabajo/devops',          level: 2, confianza: 0.6,
    ...polar(l1Pos('trabajo_devops').x, l1Pos('trabajo_devops').y, l1R('trabajo_devops') * L2_ORBIT_RATIO, 120) },
  // trabajo/frontend
  { id: 'trabajo_frontend_react',  name: 'React',           path: 'trabajo/frontend/react',            parentPath: 'trabajo/frontend',        level: 2, confianza: 0.95,
    ...polar(l1Pos('trabajo_frontend').x, l1Pos('trabajo_frontend').y, l1R('trabajo_frontend') * L2_ORBIT_RATIO, 240) },
  // salud/entrenamiento
  { id: 'salud_entrenamiento_rutinas', name: 'Rutinas',     path: 'salud/entrenamiento/rutinas',       parentPath: 'salud/entrenamiento',     level: 2, confianza: 0.9,
    ...polar(l1Pos('salud_entrenamiento').x, l1Pos('salud_entrenamiento').y, l1R('salud_entrenamiento') * L2_ORBIT_RATIO, 60) },
  // salud/nutricion
  { id: 'salud_nutricion_macros',  name: 'Macros',          path: 'salud/nutricion/macros',            parentPath: 'salud/nutricion',         level: 2, confianza: 0.65,
    ...polar(l1Pos('salud_nutricion').x, l1Pos('salud_nutricion').y, l1R('salud_nutricion') * L2_ORBIT_RATIO, 300) },
];

// Añadir campo radius a nietos
nietos.forEach(n => {
  n.radius = BASE_RADIUS_L0 * CHILD_RATIO_L1 * (n.confianza ?? 0.5) * CHILD_RATIO_L2;
});

export const TAGS: TagNode[] = [
  ...roots,
  ...hijos,
  ...nietos,
];

// ── Helpers para posicionar ideas dentro de su tag ────────────────────────────
function tagWorldRadius(tag: TagNode): number {
  // Usar el campo precalculado si está disponible
  if (tag.radius != null) return tag.radius;
  if (tag.level === 0) return computeL0Radius(0);
  if (tag.level === 1) return BASE_RADIUS_L0 * CHILD_RATIO_L1 * (tag.confianza ?? 0.5);
  return BASE_RADIUS_L0 * CHILD_RATIO_L1 * (tag.confianza ?? 0.5) * CHILD_RATIO_L2;
}

/** Coloca la idea dentro del círculo de mayor nivel de sus tagPaths.
 *  offset: fracción del radio (0–0.55) y ángulo determinista por id. */
function ideaPos(tagPaths: string[], id: string): { x: number; y: number } {
  // Buscar el tag de mayor nivel entre los asignados
  const candidates = tagPaths
    .map(tp => TAGS.find(t => t.path === tp))
    .filter(Boolean) as TagNode[];
  if (candidates.length === 0) return { x: 0, y: 0 };
  const tag = candidates.reduce((a, b) => (b.level > a.level ? b : a));

  // Hash más disperso combinando posición de caracteres
  const hash = id.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1) * 31, 0);
  const hash2 = id.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 3) * 17, 7);
  // Ángulo usando áurea sobre hash disperso
  const angle = (hash * 137.508 + hash2 * 97.3) % 360;
  // Radio variable entre 20% y 65% del radio del círculo
  const rFraction = 0.20 + ((hash2 * 1.618) % 1) * 0.45;
  const r = tagWorldRadius(tag) * rFraction;
  return polar(tag.x, tag.y, r, angle);
}

/**
 * Post-proceso: mueve los pins para que no se solapen entre sí
 * ni caigan encima del texto (centro del tag y centros de subtags).
 */
function distributeIdeas(ideas: Array<{ id: string; tagPaths: string[]; x: number; y: number }>): void {
  const tagGroups = new Map<string, typeof ideas>();
  for (const idea of ideas) {
    const candidates = idea.tagPaths
      .map(tp => TAGS.find(t => t.path === tp))
      .filter(Boolean) as TagNode[];
    if (candidates.length === 0) continue;
    const homeTag = candidates.reduce((a, b) => (b.level > a.level ? b : a));
    if (!tagGroups.has(homeTag.path)) tagGroups.set(homeTag.path, []);
    tagGroups.get(homeTag.path)!.push(idea);
  }

  for (const [tagPath, group] of tagGroups) {
    const tag = TAGS.find(t => t.path === tagPath);
    if (!tag) continue;
    const tagR   = tagWorldRadius(tag);
    const maxR   = tagR * 0.78;
    // Radio de exclusión del label propio (~30% del radio del tag)
    const labelR = tagR * 0.28;
    // Zonas de exclusión de los subtags hijos (sus labels)
    const childZones = TAGS
      .filter(t => t.parentPath === tagPath)
      .map(c => ({ x: c.x, y: c.y, r: tagWorldRadius(c) * 0.38 }));

    const positions = group.map(idea => ({ x: idea.x, y: idea.y }));
    const MIN_DIST  = tagR * 0.16;

    for (let iter = 0; iter < 80; iter++) {
      for (let a = 0; a < positions.length; a++) {
        const pa = positions[a];

        // Repulsión entre pins
        for (let b = a + 1; b < positions.length; b++) {
          const pb = positions[b];
          const dx = pb.x - pa.x, dy = pb.y - pa.y;
          const d  = Math.sqrt(dx * dx + dy * dy) || 0.001;
          if (d < MIN_DIST) {
            const push = (MIN_DIST - d) / 2;
            pa.x -= (dx / d) * push; pa.y -= (dy / d) * push;
            pb.x += (dx / d) * push; pb.y += (dy / d) * push;
          }
        }

        // Repulsión del label propio (centro del tag)
        {
          const dx = pa.x - tag.x, dy = pa.y - tag.y;
          const d  = Math.sqrt(dx * dx + dy * dy) || 0.001;
          if (d < labelR) {
            const push = labelR - d + 1;
            pa.x += (dx / d) * push; pa.y += (dy / d) * push;
          }
        }

        // Repulsión de los labels de subtags hijos
        for (const z of childZones) {
          const dx = pa.x - z.x, dy = pa.y - z.y;
          const d  = Math.sqrt(dx * dx + dy * dy) || 0.001;
          if (d < z.r) {
            const push = z.r - d + 1;
            pa.x += (dx / d) * push; pa.y += (dy / d) * push;
          }
        }

        // Contener dentro del círculo
        const dx = pa.x - tag.x, dy = pa.y - tag.y;
        const d  = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (d > maxR) { pa.x = tag.x + (dx / d) * maxR; pa.y = tag.y + (dy / d) * maxR; }
      }
    }

    group.forEach((idea, i) => { idea.x = positions[i].x; idea.y = positions[i].y; });
  }
}

// Ideas mock — posición calculada automáticamente dentro de su tag
export const IDEAS: Idea[] = [
  { id: 'i1',  title: 'Comprar lavadora',           excerpt: 'Comparar modelos y eficiencia.',     createdAt: '2026-02-01', tagPaths: ['hogar/electrodomesticos/lavadoras'],                                        ...ideaPos(['hogar/electrodomesticos/lavadoras'], 'i1') },
  { id: 'i2',  title: 'Reparar nevera',              excerpt: 'Buscar repuestos.',                  createdAt: '2026-01-15', tagPaths: ['hogar/electrodomesticos/neveras'],                                          ...ideaPos(['hogar/electrodomesticos/neveras'], 'i2') },
  { id: 'i3',  title: 'Nueva sartén',                excerpt: 'Antiadherente recomendada.',         createdAt: '2026-01-20', tagPaths: ['hogar/cocina/sartenes'],                                                    ...ideaPos(['hogar/cocina/sartenes'], 'i3') },
  { id: 'i4',  title: 'Limpiar cocina',              excerpt: 'Productos ecológicos.',              createdAt: '2026-01-22', tagPaths: ['hogar/limpieza/productos'],                                                  ...ideaPos(['hogar/limpieza/productos'], 'i4') },
  { id: 'i5',  title: 'Revisión eléctrica',          excerpt: 'Chequeo anual.',                     createdAt: '2026-01-10', tagPaths: ['hogar/electrodomesticos'],                                                   ...ideaPos(['hogar/electrodomesticos'], 'i5') },
  { id: 'i6',  title: 'Organizar despensa',          excerpt: 'Categorizar alimentos.',             createdAt: '2026-01-12', tagPaths: ['hogar/cocina'],                                                              ...ideaPos(['hogar/cocina'], 'i6') },
  { id: 'i7',  title: 'Comprar detergente',          excerpt: 'Aprovechar ofertas.',                createdAt: '2026-01-18', tagPaths: ['hogar/limpieza'],                                                            ...ideaPos(['hogar/limpieza'], 'i7') },
  { id: 'i8',  title: 'Estudiar planificación',      excerpt: 'Algoritmos de CPU.',                 createdAt: '2026-01-25', tagPaths: ['uni/sistemas_operativos/planificacion_cpu'],                                 ...ideaPos(['uni/sistemas_operativos/planificacion_cpu'], 'i8') },
  { id: 'i9',  title: 'Repasar índices',             excerpt: 'Tipos de índices.',                  createdAt: '2026-01-28', tagPaths: ['uni/bases_de_datos/indexes'],                                                ...ideaPos(['uni/bases_de_datos/indexes'], 'i9') },
  { id: 'i10', title: 'Ejercicios SO',               excerpt: 'Planificación y memoria.',           createdAt: '2026-01-30', tagPaths: ['uni/sistemas_operativos'],                                                   ...ideaPos(['uni/sistemas_operativos'], 'i10') },
  { id: 'i11', title: 'Proyecto BD',                 excerpt: 'Optimizar consultas.',               createdAt: '2026-01-29', tagPaths: ['uni/bases_de_datos'],                                                        ...ideaPos(['uni/bases_de_datos'], 'i11') },
  { id: 'i12', title: 'Apuntes Docker',              excerpt: 'Comandos útiles.',                   createdAt: '2026-01-27', tagPaths: ['trabajo/devops/docker'],                                                     ...ideaPos(['trabajo/devops/docker'], 'i12') },
  { id: 'i13', title: 'Migrar a React 18',           excerpt: 'Hooks y concurrent mode.',           createdAt: '2026-01-19', tagPaths: ['trabajo/frontend/react'],                                                    ...ideaPos(['trabajo/frontend/react'], 'i13') },
  { id: 'i14', title: 'CI/CD con Docker',            excerpt: 'Pipeline básico.',                   createdAt: '2026-01-21', tagPaths: ['trabajo/devops/docker'],                                                     ...ideaPos(['trabajo/devops/docker'], 'i14') },
  { id: 'i15', title: 'Revisar frontend',            excerpt: 'Auditoría de componentes.',          createdAt: '2026-01-23', tagPaths: ['trabajo/frontend'],                                                          ...ideaPos(['trabajo/frontend'], 'i15') },
  { id: 'i16', title: 'Automatizar backups',         excerpt: 'Script semanal.',                    createdAt: '2026-01-24', tagPaths: ['trabajo/devops'],                                                            ...ideaPos(['trabajo/devops'], 'i16') },
  { id: 'i17', title: 'Nueva rutina gym',            excerpt: 'Fuerza e hipertrofia.',              createdAt: '2026-01-26', tagPaths: ['salud/entrenamiento/rutinas'],                                               ...ideaPos(['salud/entrenamiento/rutinas'], 'i17') },
  { id: 'i18', title: 'Plan de macros',              excerpt: 'Calorías y proteínas.',              createdAt: '2026-01-17', tagPaths: ['salud/nutricion/macros'],                                                    ...ideaPos(['salud/nutricion/macros'], 'i18') },
  { id: 'i19', title: 'Entrenamiento HIIT',          excerpt: 'Sesiones cortas.',                   createdAt: '2026-01-13', tagPaths: ['salud/entrenamiento'],                                                       ...ideaPos(['salud/entrenamiento'], 'i19') },
  { id: 'i20', title: 'Comprar proteína',            excerpt: 'Comparar marcas.',                   createdAt: '2026-01-14', tagPaths: ['salud/nutricion'],                                                           ...ideaPos(['salud/nutricion'], 'i20') },
  { id: 'i21', title: 'Docker en proyectos',         excerpt: 'Integrar en frontend.',              createdAt: '2026-01-16', tagPaths: ['trabajo/devops/docker', 'trabajo/frontend/react'],                          ...ideaPos(['trabajo/devops/docker', 'trabajo/frontend/react'], 'i21') },
  { id: 'i22', title: 'Limpieza y salud',            excerpt: 'Productos no tóxicos.',              createdAt: '2026-01-11', tagPaths: ['hogar/limpieza/productos', 'salud'],                                        ...ideaPos(['hogar/limpieza/productos', 'salud'], 'i22') },
  { id: 'i23', title: 'Planificación y rutinas',     excerpt: 'Organizar estudio y gym.',           createdAt: '2026-01-09', tagPaths: ['uni/sistemas_operativos/planificacion_cpu', 'salud/entrenamiento/rutinas'],  ...ideaPos(['uni/sistemas_operativos/planificacion_cpu', 'salud/entrenamiento/rutinas'], 'i23') },
  { id: 'i24', title: 'Índices y backups',           excerpt: 'BD y scripts.',                      createdAt: '2026-01-08', tagPaths: ['uni/bases_de_datos/indexes', 'trabajo/devops'],                             ...ideaPos(['uni/bases_de_datos/indexes', 'trabajo/devops'], 'i24') },
  { id: 'i25', title: 'Macros y cocina',             excerpt: 'Recetas saludables.',                createdAt: '2026-01-07', tagPaths: ['salud/nutricion/macros', 'hogar/cocina'],                                   ...ideaPos(['salud/nutricion/macros', 'hogar/cocina'], 'i25') },
  { id: 'i26', title: 'Frontend y cocina',           excerpt: 'Apps de recetas.',                   createdAt: '2026-01-06', tagPaths: ['trabajo/frontend/react', 'hogar/cocina'],                                   ...ideaPos(['trabajo/frontend/react', 'hogar/cocina'], 'i26') },
  { id: 'i27', title: 'Electrodomésticos y salud',   excerpt: 'Ahorro energético.',                 createdAt: '2026-01-05', tagPaths: ['hogar/electrodomesticos', 'salud'],                                         ...ideaPos(['hogar/electrodomesticos', 'salud'], 'i27') },
  { id: 'i28', title: 'Docker y rutinas',            excerpt: 'Automatizar gym.',                   createdAt: '2026-01-04', tagPaths: ['trabajo/devops/docker', 'salud/entrenamiento/rutinas'],                     ...ideaPos(['trabajo/devops/docker', 'salud/entrenamiento/rutinas'], 'i28') },
  { id: 'i29', title: 'Índices y neveras',           excerpt: 'Optimizar inventario.',              createdAt: '2026-01-03', tagPaths: ['uni/bases_de_datos/indexes', 'hogar/electrodomesticos/neveras'],            ...ideaPos(['uni/bases_de_datos/indexes', 'hogar/electrodomesticos/neveras'], 'i29') },
  { id: 'i30', title: 'Planificación y limpieza',    excerpt: 'Organizar tareas.',                  createdAt: '2026-01-02', tagPaths: ['uni/sistemas_operativos/planificacion_cpu', 'hogar/limpieza'],              ...ideaPos(['uni/sistemas_operativos/planificacion_cpu', 'hogar/limpieza'], 'i30') },
];

// Redistribuir pins para evitar solapamientos y que no caigan sobre el texto
distributeIdeas(IDEAS);
