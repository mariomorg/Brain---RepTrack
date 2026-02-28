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
  hogar: '#4F8A8B',
  uni: '#F9A826',
  trabajo: '#F45B69',
  salud: '#43BCCD',
};

// Radios base en coordenadas mundo:
//   Nivel 0: fijo, muy grande (700 unidades)
//   Nivel 1: radio_padre * confianza * 0.28  (máx ~196 para confianza 1.0)
//   Nivel 2: radio_padre * confianza * 0.30  (máx ~58 para confianza 1.0)
export const BASE_RADIUS_L0 = 700;
export const CHILD_RATIO_L1 = 0.28;
export const CHILD_RATIO_L2 = 0.30;

// Helper de posición polar
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ── NIVEL 0: roots, muy separados ────────────────────────────────────────────
const roots: TagNode[] = [
  { id: 'hogar', name: 'Hogar', path: 'hogar', parentPath: null, level: 0, x: -1800, y: 0 },
  { id: 'uni', name: 'Uni', path: 'uni', parentPath: null, level: 0, x: 1800, y: 0 },
  { id: 'trabajo', name: 'Trabajo', path: 'trabajo', parentPath: null, level: 0, x: 0, y: 1800 },
  { id: 'salud', name: 'Salud', path: 'salud', parentPath: null, level: 0, x: 0, y: -1800 },
];

// ── NIVEL 1: hijos dentro del padre (radio 0 = 700, hijos a ~280 del centro) ─
// Confianza varía por hijo para mostrar diferencia de tamaño
const L1_ORBIT = BASE_RADIUS_L0 * 0.40; // distancia del centro del padre al centro del hijo

const hijos: TagNode[] = [
  // Hogar
  { id: 'hogar_electro', name: 'Electrodomésticos', path: 'hogar/electrodomesticos', parentPath: 'hogar', level: 1, confianza: 0.9, ...polar(-1800, 0, L1_ORBIT, 30) },
  { id: 'hogar_cocina', name: 'Cocina', path: 'hogar/cocina', parentPath: 'hogar', level: 1, confianza: 0.65, ...polar(-1800, 0, L1_ORBIT, 150) },
  { id: 'hogar_limpieza', name: 'Limpieza', path: 'hogar/limpieza', parentPath: 'hogar', level: 1, confianza: 0.45, ...polar(-1800, 0, L1_ORBIT, 270) },
  // Uni
  { id: 'uni_so', name: 'Sistemas Operativos', path: 'uni/sistemas_operativos', parentPath: 'uni', level: 1, confianza: 0.8, ...polar(1800, 0, L1_ORBIT, 60) },
  { id: 'uni_bd', name: 'Bases de Datos', path: 'uni/bases_de_datos', parentPath: 'uni', level: 1, confianza: 0.55, ...polar(1800, 0, L1_ORBIT, 180) },
  // Trabajo
  { id: 'trabajo_devops', name: 'DevOps', path: 'trabajo/devops', parentPath: 'trabajo', level: 1, confianza: 0.95, ...polar(0, 1800, L1_ORBIT, 90) },
  { id: 'trabajo_frontend', name: 'Frontend', path: 'trabajo/frontend', parentPath: 'trabajo', level: 1, confianza: 0.7, ...polar(0, 1800, L1_ORBIT, 210) },
  // Salud
  { id: 'salud_entrenamiento', name: 'Entrenamiento', path: 'salud/entrenamiento', parentPath: 'salud', level: 1, confianza: 0.85, ...polar(0, -1800, L1_ORBIT, 120) },
  { id: 'salud_nutricion', name: 'Nutrición', path: 'salud/nutricion', parentPath: 'salud', level: 1, confianza: 0.6, ...polar(0, -1800, L1_ORBIT, 300) },
];

// ── NIVEL 2: nietos dentro de su padre (nivel 1) ──────────────────────────────
// Radio de un hijo nivel-1 (confianza * BASE_RADIUS_L0 * CHILD_RATIO_L1)
// Órbita nietos: ~35-40% del radio del padre nivel-1
function l1Pos(id: string) {
  return hijos.find(h => h.id === id)!;
}
function l1Radius(confianza: number) {
  return BASE_RADIUS_L0 * CHILD_RATIO_L1 * confianza;
}
const L2_ORBIT_RATIO = 0.38; // fracción del radio del padre nivel-1

const nietos: TagNode[] = [
  // hogar/electrodomesticos (confianza 0.9, radio≈176)
  { id: 'hogar_electro_lavadoras', name: 'Lavadoras', path: 'hogar/electrodomesticos/lavadoras', parentPath: 'hogar/electrodomesticos', level: 2, confianza: 0.9,
    ...polar(l1Pos('hogar_electro').x, l1Pos('hogar_electro').y, l1Radius(0.9) * L2_ORBIT_RATIO, 60) },
  { id: 'hogar_electro_neveras', name: 'Neveras', path: 'hogar/electrodomesticos/neveras', parentPath: 'hogar/electrodomesticos', level: 2, confianza: 0.55,
    ...polar(l1Pos('hogar_electro').x, l1Pos('hogar_electro').y, l1Radius(0.9) * L2_ORBIT_RATIO, 200) },
  // hogar/cocina (confianza 0.65, radio≈127)
  { id: 'hogar_cocina_sartenes', name: 'Sartenes', path: 'hogar/cocina/sartenes', parentPath: 'hogar/cocina', level: 2, confianza: 0.75,
    ...polar(l1Pos('hogar_cocina').x, l1Pos('hogar_cocina').y, l1Radius(0.65) * L2_ORBIT_RATIO, 120) },
  // hogar/limpieza (confianza 0.45, radio≈88)
  { id: 'hogar_limpieza_productos', name: 'Productos', path: 'hogar/limpieza/productos', parentPath: 'hogar/limpieza', level: 2, confianza: 0.85,
    ...polar(l1Pos('hogar_limpieza').x, l1Pos('hogar_limpieza').y, l1Radius(0.45) * L2_ORBIT_RATIO, 240) },
  // uni/sistemas_operativos (confianza 0.8, radio≈156)
  { id: 'uni_so_planif', name: 'Planificación CPU', path: 'uni/sistemas_operativos/planificacion_cpu', parentPath: 'uni/sistemas_operativos', level: 2, confianza: 0.7,
    ...polar(l1Pos('uni_so').x, l1Pos('uni_so').y, l1Radius(0.8) * L2_ORBIT_RATIO, 90) },
  // uni/bases_de_datos (confianza 0.55, radio≈107)
  { id: 'uni_bd_indexes', name: 'Indexes', path: 'uni/bases_de_datos/indexes', parentPath: 'uni/bases_de_datos', level: 2, confianza: 0.8,
    ...polar(l1Pos('uni_bd').x, l1Pos('uni_bd').y, l1Radius(0.55) * L2_ORBIT_RATIO, 210) },
  // trabajo/devops (confianza 0.95, radio≈186)
  { id: 'trabajo_devops_docker', name: 'Docker', path: 'trabajo/devops/docker', parentPath: 'trabajo/devops', level: 2, confianza: 0.6,
    ...polar(l1Pos('trabajo_devops').x, l1Pos('trabajo_devops').y, l1Radius(0.95) * L2_ORBIT_RATIO, 120) },
  // trabajo/frontend (confianza 0.7, radio≈137)
  { id: 'trabajo_frontend_react', name: 'React', path: 'trabajo/frontend/react', parentPath: 'trabajo/frontend', level: 2, confianza: 0.95,
    ...polar(l1Pos('trabajo_frontend').x, l1Pos('trabajo_frontend').y, l1Radius(0.7) * L2_ORBIT_RATIO, 240) },
  // salud/entrenamiento (confianza 0.85, radio≈166)
  { id: 'salud_entrenamiento_rutinas', name: 'Rutinas', path: 'salud/entrenamiento/rutinas', parentPath: 'salud/entrenamiento', level: 2, confianza: 0.9,
    ...polar(l1Pos('salud_entrenamiento').x, l1Pos('salud_entrenamiento').y, l1Radius(0.85) * L2_ORBIT_RATIO, 60) },
  // salud/nutricion (confianza 0.6, radio≈117)
  { id: 'salud_nutricion_macros', name: 'Macros', path: 'salud/nutricion/macros', parentPath: 'salud/nutricion', level: 2, confianza: 0.65,
    ...polar(l1Pos('salud_nutricion').x, l1Pos('salud_nutricion').y, l1Radius(0.6) * L2_ORBIT_RATIO, 300) },
];

export const TAGS: TagNode[] = [
  ...roots,
  ...hijos,
  ...nietos,
];

// ── Helpers para posicionar ideas dentro de su tag ────────────────────────────
function tagWorldRadius(tag: TagNode): number {
  if (tag.level === 0) return BASE_RADIUS_L0;
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

  // Ángulo determinista a partir del hash del id
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const angle = (hash * 137.508) % 360; // ángulo de áurea para distribución uniforme
  const r = tagWorldRadius(tag) * 0.45; // dentro del 45% del radio del círculo
  return polar(tag.x, tag.y, r, angle);
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
