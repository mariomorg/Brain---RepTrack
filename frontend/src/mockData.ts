// Datos mock para el mapa de tags e ideas
export type TagNode = {
  id: string;
  name: string;
  path: string;
  parentPath: string | null;
  level: number;
  x: number;
  y: number;
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

// Generación de nodos y posiciones anidadas (hijos dentro de padres)
// Radios base para cada nivel (padre supremo mucho más grande)
const RADII = [900, 110, 60];
// Posiciones relativas para hijos (en círculo dentro del padre)
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Padres supremos (más separados y mucho más grandes)
const roots = [
  { id: 'hogar', name: 'Hogar', path: 'hogar', parentPath: null, level: 0, x: -1200, y: 0 },
  { id: 'uni', name: 'Uni', path: 'uni', parentPath: null, level: 0, x: 1200, y: 0 },
  { id: 'trabajo', name: 'Trabajo', path: 'trabajo', parentPath: null, level: 0, x: 0, y: 1200 },
  { id: 'salud', name: 'Salud', path: 'salud', parentPath: null, level: 0, x: 0, y: -1200 },
];

// Hijos de cada root (siempre dentro del padre, bien separados)
const hijos = [
  // Hogar
  { id: 'hogar_electro', name: 'Electrodomésticos', path: 'hogar/electrodomesticos', parentPath: 'hogar', level: 1, ...polar(-1200, 0, 400, 30) },
  { id: 'hogar_cocina', name: 'Cocina', path: 'hogar/cocina', parentPath: 'hogar', level: 1, ...polar(-1200, 0, 400, 150) },
  { id: 'hogar_limpieza', name: 'Limpieza', path: 'hogar/limpieza', parentPath: 'hogar', level: 1, ...polar(-1200, 0, 400, 270) },
  // Uni
  { id: 'uni_so', name: 'Sistemas Operativos', path: 'uni/sistemas_operativos', parentPath: 'uni', level: 1, ...polar(1200, 0, 400, 60) },
  { id: 'uni_bd', name: 'Bases de Datos', path: 'uni/bases_de_datos', parentPath: 'uni', level: 1, ...polar(1200, 0, 400, 180) },
  // Trabajo
  { id: 'trabajo_devops', name: 'DevOps', path: 'trabajo/devops', parentPath: 'trabajo', level: 1, ...polar(0, 1200, 400, 90) },
  { id: 'trabajo_frontend', name: 'Frontend', path: 'trabajo/frontend', parentPath: 'trabajo', level: 1, ...polar(0, 1200, 400, 210) },
  // Salud
  { id: 'salud_entrenamiento', name: 'Entrenamiento', path: 'salud/entrenamiento', parentPath: 'salud', level: 1, ...polar(0, -1200, 400, 120) },
  { id: 'salud_nutricion', name: 'Nutrición', path: 'salud/nutricion', parentPath: 'salud', level: 1, ...polar(0, -1200, 400, 300) },
];

// Nietos (level 2), dentro de su padre level 1 (ajustados para estar dentro del padre)
const nietos = [
  // Hogar/electrodomesticos
  { id: 'hogar_electro_lavadoras', name: 'Lavadoras', path: 'hogar/electrodomesticos/lavadoras', parentPath: 'hogar/electrodomesticos', level: 2, ...polar(-1200 + 400 * Math.cos(30 * Math.PI / 180), 0 + 400 * Math.sin(30 * Math.PI / 180), 80, 60) },
  { id: 'hogar_electro_neveras', name: 'Neveras', path: 'hogar/electrodomesticos/neveras', parentPath: 'hogar/electrodomesticos', level: 2, ...polar(-1200 + 400 * Math.cos(30 * Math.PI / 180), 0 + 400 * Math.sin(30 * Math.PI / 180), 80, 180) },
  // Hogar/cocina
  { id: 'hogar_cocina_sartenes', name: 'Sartenes', path: 'hogar/cocina/sartenes', parentPath: 'hogar/cocina', level: 2, ...polar(-1200 + 400 * Math.cos(150 * Math.PI / 180), 0 + 400 * Math.sin(150 * Math.PI / 180), 80, 120) },
  // Hogar/limpieza
  { id: 'hogar_limpieza_productos', name: 'Productos', path: 'hogar/limpieza/productos', parentPath: 'hogar/limpieza', level: 2, ...polar(-1200 + 400 * Math.cos(270 * Math.PI / 180), 0 + 400 * Math.sin(270 * Math.PI / 180), 80, 240) },
  // Uni/sistemas_operativos
  { id: 'uni_so_planif', name: 'Planificación CPU', path: 'uni/sistemas_operativos/planificacion_cpu', parentPath: 'uni/sistemas_operativos', level: 2, ...polar(1200 + 400 * Math.cos(60 * Math.PI / 180), 0 + 400 * Math.sin(60 * Math.PI / 180), 80, 90) },
  // Uni/bases_de_datos
  { id: 'uni_bd_indexes', name: 'Indexes', path: 'uni/bases_de_datos/indexes', parentPath: 'uni/bases_de_datos', level: 2, ...polar(1200 + 400 * Math.cos(180 * Math.PI / 180), 0 + 400 * Math.sin(180 * Math.PI / 180), 80, 210) },
  // Trabajo/devops
  { id: 'trabajo_devops_docker', name: 'Docker', path: 'trabajo/devops/docker', parentPath: 'trabajo/devops', level: 2, ...polar(0 + 400 * Math.cos(90 * Math.PI / 180), 1200 + 400 * Math.sin(90 * Math.PI / 180), 80, 120) },
  // Trabajo/frontend
  { id: 'trabajo_frontend_react', name: 'React', path: 'trabajo/frontend/react', parentPath: 'trabajo/frontend', level: 2, ...polar(0 + 400 * Math.cos(210 * Math.PI / 180), 1200 + 400 * Math.sin(210 * Math.PI / 180), 80, 240) },
  // Salud/entrenamiento
  { id: 'salud_entrenamiento_rutinas', name: 'Rutinas', path: 'salud/entrenamiento/rutinas', parentPath: 'salud/entrenamiento', level: 2, ...polar(0 + 400 * Math.cos(120 * Math.PI / 180), -1200 + 400 * Math.sin(120 * Math.PI / 180), 80, 60) },
  // Salud/nutricion
  { id: 'salud_nutricion_macros', name: 'Macros', path: 'salud/nutricion/macros', parentPath: 'salud/nutricion', level: 2, ...polar(0 + 400 * Math.cos(300 * Math.PI / 180), -1200 + 400 * Math.sin(300 * Math.PI / 180), 80, 300) },
];

export const TAGS: TagNode[] = [
  ...roots,
  ...hijos,
  ...nietos,
];

// Ideas mock (30 ideas, repartidas)
export const IDEAS: Idea[] = [
  // Hogar
  { id: 'i1', title: 'Comprar lavadora', excerpt: 'Comparar modelos y eficiencia.', createdAt: '2026-02-01', tagPaths: ['hogar/electrodomesticos/lavadoras'], x: -860, y: 210 },
  { id: 'i2', title: 'Reparar nevera', excerpt: 'Buscar repuestos.', createdAt: '2026-01-15', tagPaths: ['hogar/electrodomesticos/neveras'], x: -740, y: 210 },
  { id: 'i3', title: 'Nueva sartén', excerpt: 'Antiadherente recomendada.', createdAt: '2026-01-20', tagPaths: ['hogar/cocina/sartenes'], x: -610, y: -310 },
  { id: 'i4', title: 'Limpiar cocina', excerpt: 'Productos ecológicos.', createdAt: '2026-01-22', tagPaths: ['hogar/limpieza/productos'], x: -410, y: 210 },
  { id: 'i5', title: 'Revisión eléctrica', excerpt: 'Chequeo anual.', createdAt: '2026-01-10', tagPaths: ['hogar/electrodomesticos'], x: -800, y: 120 },
  { id: 'i6', title: 'Organizar despensa', excerpt: 'Categorizar alimentos.', createdAt: '2026-01-12', tagPaths: ['hogar/cocina'], x: -600, y: -220 },
  { id: 'i7', title: 'Comprar detergente', excerpt: 'Aprovechar ofertas.', createdAt: '2026-01-18', tagPaths: ['hogar/limpieza'], x: -400, y: 120 },
  // Uni
  { id: 'i8', title: 'Estudiar planificación', excerpt: 'Algoritmos de CPU.', createdAt: '2026-01-25', tagPaths: ['uni/sistemas_operativos/planificacion_cpu'], x: 760, y: -360 },
  { id: 'i9', title: 'Repasar índices', excerpt: 'Tipos de índices.', createdAt: '2026-01-28', tagPaths: ['uni/bases_de_datos/indexes'], x: 560, y: -60 },
  { id: 'i10', title: 'Ejercicios SO', excerpt: 'Planificación y memoria.', createdAt: '2026-01-30', tagPaths: ['uni/sistemas_operativos'], x: 710, y: -310 },
  { id: 'i11', title: 'Proyecto BD', excerpt: 'Optimizar consultas.', createdAt: '2026-01-29', tagPaths: ['uni/bases_de_datos'], x: 510, y: -110 },
  { id: 'i12', title: 'Apuntes Docker', excerpt: 'Comandos útiles.', createdAt: '2026-01-27', tagPaths: ['trabajo/devops/docker'], x: 160, y: 760 },
  // Trabajo
  { id: 'i13', title: 'Migrar a React 18', excerpt: 'Hooks y concurrent mode.', createdAt: '2026-01-19', tagPaths: ['trabajo/frontend/react'], x: -160, y: 560 },
  { id: 'i14', title: 'CI/CD con Docker', excerpt: 'Pipeline básico.', createdAt: '2026-01-21', tagPaths: ['trabajo/devops/docker'], x: 140, y: 760 },
  { id: 'i15', title: 'Revisar frontend', excerpt: 'Auditoría de componentes.', createdAt: '2026-01-23', tagPaths: ['trabajo/frontend'], x: -110, y: 510 },
  { id: 'i16', title: 'Automatizar backups', excerpt: 'Script semanal.', createdAt: '2026-01-24', tagPaths: ['trabajo/devops'], x: 110, y: 710 },
  // Salud
  { id: 'i17', title: 'Nueva rutina gym', excerpt: 'Fuerza e hipertrofia.', createdAt: '2026-01-26', tagPaths: ['salud/entrenamiento/rutinas'], x: 160, y: -760 },
  { id: 'i18', title: 'Plan de macros', excerpt: 'Calorías y proteínas.', createdAt: '2026-01-17', tagPaths: ['salud/nutricion/macros'], x: -160, y: -560 },
  { id: 'i19', title: 'Entrenamiento HIIT', excerpt: 'Sesiones cortas.', createdAt: '2026-01-13', tagPaths: ['salud/entrenamiento'], x: 110, y: -710 },
  { id: 'i20', title: 'Comprar proteína', excerpt: 'Comparar marcas.', createdAt: '2026-01-14', tagPaths: ['salud/nutricion'], x: -110, y: -510 },
  // Ideas con varios tags
  { id: 'i21', title: 'Docker en proyectos', excerpt: 'Integrar en frontend.', createdAt: '2026-01-16', tagPaths: ['trabajo/devops/docker', 'trabajo/frontend/react'], x: 0, y: 650 },
  { id: 'i22', title: 'Limpieza y salud', excerpt: 'Productos no tóxicos.', createdAt: '2026-01-11', tagPaths: ['hogar/limpieza/productos', 'salud'], x: -390, y: 220 },
  { id: 'i23', title: 'Planificación y rutinas', excerpt: 'Organizar estudio y gym.', createdAt: '2026-01-09', tagPaths: ['uni/sistemas_operativos/planificacion_cpu', 'salud/entrenamiento/rutinas'], x: 450, y: -550 },
  { id: 'i24', title: 'Índices y backups', excerpt: 'BD y scripts.', createdAt: '2026-01-08', tagPaths: ['uni/bases_de_datos/indexes', 'trabajo/devops'], x: 300, y: 300 },
  { id: 'i25', title: 'Macros y cocina', excerpt: 'Recetas saludables.', createdAt: '2026-01-07', tagPaths: ['salud/nutricion/macros', 'hogar/cocina'], x: -400, y: -400 },
  { id: 'i26', title: 'Frontend y cocina', excerpt: 'Apps de recetas.', createdAt: '2026-01-06', tagPaths: ['trabajo/frontend/react', 'hogar/cocina'], x: -300, y: 0 },
  { id: 'i27', title: 'Electrodomésticos y salud', excerpt: 'Ahorro energético.', createdAt: '2026-01-05', tagPaths: ['hogar/electrodomesticos', 'salud'], x: -800, y: -100 },
  { id: 'i28', title: 'Docker y rutinas', excerpt: 'Automatizar gym.', createdAt: '2026-01-04', tagPaths: ['trabajo/devops/docker', 'salud/entrenamiento/rutinas'], x: 200, y: 0 },
  { id: 'i29', title: 'Índices y neveras', excerpt: 'Optimizar inventario.', createdAt: '2026-01-03', tagPaths: ['uni/bases_de_datos/indexes', 'hogar/electrodomesticos/neveras'], x: 0, y: 0 },
  { id: 'i30', title: 'Planificación y limpieza', excerpt: 'Organizar tareas.', createdAt: '2026-01-02', tagPaths: ['uni/sistemas_operativos/planificacion_cpu', 'hogar/limpieza'], x: -200, y: -200 },
];
