import { Exercise } from '../types';

// DICCIONARIOS DE TRADUCCIÓN AL ESPAÑOL DE ALTA PRECISIÓN PARA GIMNASIO Y FITNESS

// 1. Músculos primarios y secundarios
export const MUSCLE_MAP_ES: Record<string, string> = {
  'abs': 'Abdominales',
  'abductors': 'Abductores',
  'adductors': 'Aductores',
  'biceps': 'Bíceps',
  'calves': 'Gemelos (Pantorrillas)',
  'chest': 'Pecho (Pectorales)',
  'forearms': 'Antebrazos',
  'glutes': 'Glúteos',
  'hamstrings': 'Isquiotibiales (Femorales)',
  'hip flexors': 'Flexores de Cadera',
  'lats': 'Dorsales (Espalda)',
  'lower back': 'Espalda Baja (Lumbares)',
  'middle back': 'Espalda Media',
  'neck': 'Cuello',
  'obliques': 'Oblicuos',
  'quadriceps': 'Cuádriceps',
  'shoulders': 'Hombros (Deltoides)',
  'traps': 'Trapecios',
  'triceps': 'Tríceps',
  'upper back': 'Espalda Alta',
  'waist': 'Cintura',
  'cardio': 'Cardio',
  'full body': 'Cuerpo Completo',
  'soleus': 'Sóleo',
  'quads': 'Cuádriceps',
  'serratus anterior': 'Serrato Mayor'
};

// 2. Equipamiento / Máquinas
export const EQUIPMENT_MAP_ES: Record<string, string> = {
  'body weight': 'Peso Corporal',
  'bodyweight': 'Peso Corporal',
  'dumbbell': 'Mancuerna',
  'barbell': 'Barra',
  'cable': 'Polea / Cable',
  'machine': 'Máquina',
  'kettlebell': 'Pesa Rusa (Kettlebell)',
  'band': 'Banda de Resistencia',
  'smith machine': 'Máquina Smith',
  'ez barbell': 'Barra Z',
  'exercise ball': 'Pelota / Fitball',
  'medicine ball': 'Balón Medicinal',
  'foam roll': 'Rodillo (Foam Roller)',
  'leverage machine': 'Máquina de Palanca',
  'assisted': 'Asistido con Máquina',
  'weighted': 'Con Peso / Lastrado',
  'rope': 'Cuerda',
  'trap bar': 'Barra Hexagonal',
  'sled machine': 'Trineo de Fuerza',
  'roller': 'Rueda Abdominal',
  'stationary bike': 'Bicicleta Estática',
  'elliptical machine': 'Elíptica',
  'stepmill': 'Escaladora',
  'bosu ball': 'Bosu',
  'tire': 'Neumático / Rueda',
  'other': 'Otro Equipamiento'
};

// 3. Nivel de Dificultad
export const LEVEL_MAP_ES: Record<string, string> = {
  'beginner': 'Principiante',
  'intermediate': 'Intermedio',
  'expert': 'Avanzado',
  'advanced': 'Avanzado'
};

// 4. Tipo de Fuerza y Mecánica
export const FORCE_MAP_ES: Record<string, string> = {
  'push': 'Empuje',
  'pull': 'Tracción (Jalón)',
  'static': 'Estático (Isométrico)'
};

export const MECHANIC_MAP_ES: Record<string, string> = {
  'compound': 'Compuesto (Multiarticular)',
  'isolation': 'Aislamiento (Monoarticular)'
};

// 5. Palabras clave y nombres frecuentes para traducción de títulos
const TITLE_TERMS_ES: Array<[RegExp, string]> = [
  [/\b3\/4 sit-up\b/gi, 'Abdominales 3/4'],
  [/\b45° side bend\b/gi, 'Inclinación lateral a 45°'],
  [/\bair bike\b/gi, 'Bicicleta aérea (Abdominales)'],
  [/\bbench press\b/gi, 'Press de banca'],
  [/\bincline bench press\b/gi, 'Press de banca inclinado'],
  [/\bdecline bench press\b/gi, 'Press de banca reclinado'],
  [/\bshoulder press\b/gi, 'Press de hombros'],
  [/\bmilitary press\b/gi, 'Press militar'],
  [/\boverhead press\b/gi, 'Press sobre la cabeza'],
  [/\bleg press\b/gi, 'Prensa de piernas'],
  [/\bchest press\b/gi, 'Press de pecho'],
  [/\bpush-up\b/gi, 'Flexión de brazos (Lagartija)'],
  [/\bpush up\b/gi, 'Flexión de brazos'],
  [/\bpull-up\b/gi, 'Dominada'],
  [/\bpull up\b/gi, 'Dominada'],
  [/\bchin-up\b/gi, 'Dominada supina'],
  [/\bchin up\b/gi, 'Dominada supina'],
  [/\blat pulldown\b/gi, 'Jalón al pecho (Dorsales)'],
  [/\bpulldown\b/gi, 'Jalón en polea'],
  [/\bbiceps curl\b/gi, 'Curl de bíceps'],
  [/\bhammer curl\b/gi, 'Curl martillo'],
  [/\bpreacher curl\b/gi, 'Curl predicador'],
  [/\bconcentration curl\b/gi, 'Curl concentrado'],
  [/\btriceps extension\b/gi, 'Extensión de tríceps'],
  [/\btriceps dip\b/gi, 'Fondo de tríceps'],
  [/\bdip\b/gi, 'Fondo en paralelas'],
  [/\bsquat\b/gi, 'Sentadilla'],
  [/\bfront squat\b/gi, 'Sentadilla frontal'],
  [/\bhack squat\b/gi, 'Sentadilla Hack'],
  [/\bgoblet squat\b/gi, 'Sentadilla Copa (Goblet)'],
  [/\bdeadlift\b/gi, 'Peso muerto'],
  [/\brumanian deadlift\b/gi, 'Peso muerto rumano'],
  [/\bstiff-legged deadlift\b/gi, 'Peso muerto piernas rígidas'],
  [/\bsumodeadlift\b/gi, 'Peso muerto Sumo'],
  [/\blunge\b/gi, 'Zancada (Estocada)'],
  [/\bwalking lunge\b/gi, 'Zancada caminando'],
  [/\bhip thrust\b/gi, 'Empuje de cadera (Hip Thrust)'],
  [/\bglute bridge\b/gi, 'Puente de glúteos'],
  [/\bcalf raise\b/gi, 'Elevación de talones (Gemelos)'],
  [/\blateral raise\b/gi, 'Elevación lateral'],
  [/\bfront raise\b/gi, 'Elevación frontal'],
  [/\bface pull\b/gi, 'Face pull (Polea a la cara)'],
  [/\bchest fly\b/gi, 'Apertura de pecho'],
  [/\bfly\b/gi, 'Aperturas'],
  [/\bcable crossover\b/gi, 'Cruce de poleas'],
  [/\bbent over row\b/gi, 'Remo inclinado'],
  [/\bseated row\b/gi, 'Remo sentado'],
  [/\bone arm row\b/gi, 'Remo a una mano'],
  [/\brows\b/gi, 'Remo'],
  [/\brow\b/gi, 'Remo'],
  [/\bshrug\b/gi, 'Encogimiento de hombros'],
  [/\bcrunch\b/gi, 'Crunch abdominal'],
  [/\bsit-up\b/gi, 'Abdominales'],
  [/\bplank\b/gi, 'Plancha abdominal'],
  [/\bside plank\b/gi, 'Plancha lateral'],
  [/\bleg raise\b/gi, 'Elevación de piernas'],
  [/\bhanging leg raise\b/gi, 'Elevación de piernas colgado'],
  [/\brussian twist\b/gi, 'Giro ruso (Russian twist)'],
  [/\bleg curl\b/gi, 'Curl femoral'],
  [/\bleg extension\b/gi, 'Extensión de cuádriceps'],
  [/\bpec deck\b/gi, 'Pec Deck (Contractora)'],
  [/\bhyper-extension\b/gi, 'Hiperextensión lumbar'],
  [/\bhyperextension\b/gi, 'Hiperextensión lumbar'],

  // Palabras sueltas y descriptores comunes
  [/\bdumbbell\b/gi, 'con mancuerna'],
  [/\bbarbell\b/gi, 'con barra'],
  [/\bcable\b/gi, 'en polea'],
  [/\bmachine\b/gi, 'en máquina'],
  [/\bkettlebell\b/gi, 'con pesa rusa'],
  [/\bsmith\b/gi, 'en máquina Smith'],
  [/\bband\b/gi, 'con banda'],
  [/\bbodyweight\b/gi, 'con peso corporal'],
  [/\bstanding\b/gi, 'de pie'],
  [/\bseated\b/gi, 'sentado'],
  [/\blying\b/gi, 'tumbado'],
  [/\bincline\b/gi, 'inclinado'],
  [/\bdecline\b/gi, 'reclinado'],
  [/\bone arm\b/gi, 'a una mano'],
  [/\bsingle arm\b/gi, 'unilateral'],
  [/\bsingle leg\b/gi, 'a una pierna'],
  [/\balternating\b/gi, 'alternado'],
  [/\breverse\b/gi, 'inverso'],
  [/\bclose grip\b/gi, 'agarre estrecho'],
  [/\bwide grip\b/gi, 'agarre ancho'],
  [/\bneutral grip\b/gi, 'agarre neutro'],
  [/\boverhead\b/gi, 'sobre la cabeza'],
  [/\bbehind the neck\b/gi, 'tras nuca'],
  [/\bwith\b/gi, 'con'],
  [/\bon\b/gi, 'en']
];

// DICCIONARIOS DE FRASES DE INSTRUCCIONES
const INSTRUCTION_PHRASES_ES: Array<[RegExp, string]> = [
  [/Lie on your back with your knees bent and feet flat on the floor\./gi, 'Túmbate sobre tu espalda con las rodillas flexionadas y los pies apoyados en el suelo.'],
  [/Place your hands behind your head with your elbows pointing outwards\./gi, 'Coloca las manos detrás de la cabeza con los codos apuntando hacia afuera.'],
  [/Engaging your abs, slowly lift your upper body off the floor/gi, 'Activando el abdomen, levanta lentamente la parte superior del cuerpo del suelo'],
  [/Pause for a moment at the top, then slowly lower your upper body back down/gi, 'Haz una pausa por un momento arriba, luego baja lentamente el cuerpo'],
  [/Repeat for the desired number of repetitions\./gi, 'Repite el número de repeticiones deseado.'],
  [/Stand straight with your feet shoulder-width apart\./gi, 'Ponte de pie con los pies separados a la altura de los hombros.'],
  [/Hold a dumbbell in each hand\./gi, 'Sostén una mancuerna en cada mano.'],
  [/Slowly lower the weight\./gi, 'Baja lentamente el peso.'],
  [/Breathe in as you lower and breathe out as you push\./gi, 'Inhala al bajar y exhala al empujar.'],
  [/Keep your back straight and core engaged\./gi, 'Mantén la espalda recta y el abdomen activado.'],
  [/Keep your elbows close to your body\./gi, 'Mantén los codos cerca de tu cuerpo.']
];

// FUNCIONES PÚBLICAS DE TRADUCCIÓN

export function translateMuscle(muscle: string): string {
  if (!muscle) return '';
  const key = muscle.trim().toLowerCase();
  return MUSCLE_MAP_ES[key] || muscle.charAt(0).toUpperCase() + muscle.slice(1);
}

export function translateMusclesList(muscles: string[]): string[] {
  if (!muscles || !Array.isArray(muscles)) return [];
  return muscles.map((m) => translateMuscle(m));
}

export function translateEquipment(equipment?: string): string {
  if (!equipment) return 'Sin equipamiento';
  const key = equipment.trim().toLowerCase();
  return EQUIPMENT_MAP_ES[key] || equipment.charAt(0).toUpperCase() + equipment.slice(1);
}

export function translateLevel(level?: string): string {
  if (!level) return 'Principiante';
  const key = level.trim().toLowerCase();
  return LEVEL_MAP_ES[key] || level;
}

export function translateForce(force?: string): string {
  if (!force) return 'Dinámico';
  const key = force.trim().toLowerCase();
  return FORCE_MAP_ES[key] || force;
}

export function translateMechanic(mechanic?: string): string {
  if (!mechanic) return 'Estándar';
  const key = mechanic.trim().toLowerCase();
  return MECHANIC_MAP_ES[key] || mechanic;
}

export function translateExerciseName(name: string): string {
  if (!name) return 'Ejercicio';
  
  let translatedName = name;

  // Aplicar sustituciones por patrones
  for (const [pattern, replacement] of TITLE_TERMS_ES) {
    translatedName = translatedName.replace(pattern, replacement);
  }

  // Capitalización limpia estilo título
  translatedName = translatedName.trim();
  return translatedName.charAt(0).toUpperCase() + translatedName.slice(1);
}

export function translateInstruction(instruction: string): string {
  if (!instruction) return '';

  let translated = instruction;
  for (const [pattern, replacement] of INSTRUCTION_PHRASES_ES) {
    translated = translated.replace(pattern, replacement);
  }

  // Si contiene inglés evidente, aplicar algunas sustituciones de auxilio
  translated = translated
    .replace(/\bhold\b/gi, 'sostén')
    .replace(/\blift\b/gi, 'levanta')
    .replace(/\blower\b/gi, 'baja')
    .replace(/\bpush\b/gi, 'empuja')
    .replace(/\bpull\b/gi, 'jala')
    .replace(/\brepeat\b/gi, 'repite')
    .replace(/\bslowly\b/gi, 'lentamente')
    .replace(/\bfeet shoulder-width apart\b/gi, 'pies a la anchura de hombros')
    .replace(/\bkeep your core engaged\b/gi, 'mantén el abdomen contraído');

  return translated;
}

export function translateExercise(exercise: Exercise): Exercise {
  return {
    ...exercise,
    name: translateExerciseName(exercise.name),
    equipment: translateEquipment(exercise.equipment),
    level: translateLevel(exercise.level),
    force: translateForce(exercise.force),
    mechanic: translateMechanic(exercise.mechanic),
    primary_muscles: translateMusclesList(exercise.primary_muscles),
    secondary_muscles: translateMusclesList(exercise.secondary_muscles || []),
    instructions: (exercise.instructions || []).map((ins) => translateInstruction(ins)),
  };
}

export function translateExerciseList(exercises: Exercise[]): Exercise[] {
  return exercises.map((ex) => translateExercise(ex));
}
