import { Exercise } from '../types';

export type WorkoutLevel = 'beginner' | 'intermediate' | 'expert';

export function normalizeLevel(level?: string): WorkoutLevel {
  const l = (level || '').trim().toLowerCase();
  if (l === 'principiante' || l === 'liviana' || l === 'inicial' || l === 'beginner') {
    return 'beginner';
  }
  if (l === 'avanzado' || l === 'experto' || l === 'dificil' || l === 'difícil' || l === 'expert' || l === 'advanced') {
    return 'expert';
  }
  return 'intermediate';
}

export function matchesLevelFilter(exerciseLevel?: string, selectedLevel?: string): boolean {
  if (!selectedLevel || selectedLevel === 'all') return true;
  return normalizeLevel(exerciseLevel) === normalizeLevel(selectedLevel);
}

export function roundGymWeight(kg: number): number {
  if (!Number.isFinite(kg) || kg <= 0) return 0;
  if (kg < 10) return Math.max(2, Math.round(kg));
  if (kg <= 50) return Math.round(kg / 2.5) * 2.5;
  return Math.round(kg / 5) * 5;
}

type EquipmentCategory =
  | 'zeroLoad'
  | 'weighted'
  | 'medicine_ball'
  | 'kettlebell'
  | 'ez_barbell'
  | 'smith'
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine';

function detectEquipmentCategory(exercise: Exercise): EquipmentCategory {
  const eq = (exercise.equipment || '').toLowerCase();
  const n = (exercise.name || '').toLowerCase();

  // Estiramientos / movilidad siempre sin carga externa
  if (/(stretch|estiramiento|circles|círculos|circulos)/i.test(n)) {
    return 'zeroLoad';
  }

  if (
    !eq ||
    eq.includes('body weight') ||
    eq.includes('bodyweight') ||
    eq.includes('peso corporal') ||
    eq.includes('band') ||
    eq.includes('banda') ||
    eq.includes('assisted') ||
    eq.includes('asistido') ||
    eq.includes('stability ball') ||
    eq.includes('pelota de estabilidad') ||
    eq.includes('fitball') ||
    eq.includes('bosu') ||
    eq.includes('roller') ||
    eq.includes('rodillo') ||
    eq.includes('rueda abdominal') ||
    eq.includes('stationary bike') ||
    eq.includes('bicicleta') ||
    eq.includes('elliptical') ||
    eq.includes('elíptica') ||
    eq.includes('stepmill') ||
    eq.includes('escaladora') ||
    eq.includes('skierg') ||
    eq.includes('ergometer') ||
    eq.includes('ergómetro') ||
    eq.includes('rope') ||
    eq.includes('cuerda') ||
    eq.includes('sin equipamiento')
  ) {
    return 'zeroLoad';
  }

  if (eq.includes('weighted') || eq.includes('lastrado') || eq.includes('con peso')) {
    return 'weighted';
  }
  if (eq.includes('medicine ball') || eq.includes('balón medicinal') || eq.includes('balon medicinal')) {
    return 'medicine_ball';
  }
  if (eq.includes('kettlebell') || eq.includes('pesa rusa')) {
    return 'kettlebell';
  }
  if (eq.includes('ez barbell') || eq.includes('barra z')) {
    return 'ez_barbell';
  }
  if (eq.includes('smith')) {
    return 'smith';
  }
  if (eq.includes('barbell') || eq.includes('barra') || eq.includes('trap bar') || eq.includes('barra hexagonal')) {
    return 'barbell';
  }
  if (eq.includes('dumbbell') || eq.includes('mancuerna')) {
    return 'dumbbell';
  }
  if (eq.includes('cable') || eq.includes('polea')) {
    return 'cable';
  }
  if (
    eq.includes('machine') ||
    eq.includes('máquina') ||
    eq.includes('maquina') ||
    eq.includes('leverage') ||
    eq.includes('sled') ||
    eq.includes('trineo') ||
    eq.includes('palanca') ||
    eq.includes('lever ')
  ) {
    return 'machine';
  }

  return 'zeroLoad';
}

function getMuscleFlags(exercise: Exercise) {
  const musclesStr = (exercise.primary_muscles || []).join(' ').toLowerCase();
  const n = (exercise.name || '').toLowerCase();
  const combined = `${musclesStr} ${n}`;

  const isLowerBody =
    /(quad|cuádric|cuadric|glute|glúte|hamstring|isquio|femoral|calv|gemelo|pantorrilla|soleus|adduct|abduct|squat|sentadilla|deadlift|peso muerto|leg press|prensa|hip thrust|lunge|zancada|estocada)/i.test(
      combined
    );

  const isChest = /(pectoral|pecho|\bchest\b|\bbench\b|pec deck|crossover|cruce de poleas|\bfly\b|apertura)/i.test(combined);
  const isBack = /(\blats?\b|dorsal|espalda|upper back|lower back|\bspine\b|trapecio|\btraps?\b|pulldown|jalón|jalon|\brows?\b|\bremo\b|pull[- ]?up|chin[- ]?up)/i.test(combined);
  const isTraps = /(\btraps?\b|trapecio|shrug|encogimiento)/i.test(combined);
  const isShoulders = /(\bdelts?\b|shoulder|hombro|lateral raise|elevación lateral|elevacion lateral|front raise|overhead press|military press|press militar|face pull)/i.test(combined);
  const isBiceps = /(bicep|bícep|\bcurl\b)/i.test(musclesStr) || (/(bicep|bícep)/i.test(n) && !/leg curl|femoral/i.test(n));
  const isTriceps = /(tricep|trícep|pushdown|skullcrusher|extensión de tríceps|extension de triceps)/i.test(combined) && !isBack;
  const isForearms = /(forearm|antebrazo|\bwrist\b|muñeca)/i.test(combined);
  const isAbs = /(\babs\b|abdominal|oblique|oblicuo|\bwaist\b|cintura|\bcore\b|crunch|sit-up|\bplank\b|plancha|woodchopper|pallof)/i.test(combined);
  const isCalves = /(calv|gemelo|pantorrilla|soleus|sóleo)/i.test(combined);
  const isQuadOrHamOrGlute = /(quad|cuádric|cuadric|glute|glúte|hamstring|isquio|femoral)/i.test(combined);
  const isAbductOrAdduct = /(abduct|adduct)/i.test(combined);
  const isCardio = /(cardio|cardiovascular)/i.test(combined);

  return {
    isLowerBody,
    isChest,
    isBack,
    isTraps,
    isShoulders,
    isBiceps,
    isTriceps,
    isForearms,
    isAbs,
    isCalves,
    isQuadOrHamOrGlute,
    isAbductOrAdduct,
    isCardio,
  };
}

function getBaseTripleKg(exercise: Exercise, cat: EquipmentCategory): [number, number, number] {
  const n = (exercise.name || '').toLowerCase();
  const f = getMuscleFlags(exercise);

  if (cat === 'zeroLoad') return [0, 0, 0];

  if (cat === 'weighted') {
    return f.isLowerBody ? [10, 20, 35] : [5, 10, 20];
  }

  if (cat === 'medicine_ball') {
    return [3, 6, 10];
  }

  if (cat === 'kettlebell') {
    if (f.isLowerBody || f.isBack || /swing/i.test(n)) {
      return [12, 20, 32];
    }
    return [8, 14, 22];
  }

  if (cat === 'barbell' || cat === 'smith' || cat === 'ez_barbell') {
    const scale = cat === 'smith' ? 0.9 : cat === 'ez_barbell' ? 0.85 : 1.0;
    let triple: [number, number, number];

    if (/(romanian|rumano|stiff|good\s+morning)/i.test(n)) {
      triple = [40, 80, 120];
    } else if (/(deadlift|peso muerto|hip thrust|empuje de cadera)/i.test(n)) {
      triple = [50, 100, 150];
    } else if (/(lunge|zancada|estocada|split|bulgarian)/i.test(n)) {
      triple = [30, 55, 85];
    } else if (f.isQuadOrHamOrGlute || /(squat|sentadilla)/i.test(n)) {
      triple = [45, 85, 125];
    } else if (f.isCalves) {
      triple = [40, 80, 120];
    } else if (f.isChest) {
      triple = [40, 70, 105];
    } else if (f.isTraps || /shrug|encogimiento/i.test(n)) {
      triple = [50, 90, 130];
    } else if (f.isBack) {
      triple = /pullover/i.test(n) ? [20, 35, 55] : [35, 65, 95];
    } else if (f.isShoulders) {
      triple = /(upright|raise|elevación|elevacion|front)/i.test(n) ? [20, 35, 55] : [25, 47.5, 70];
    } else if (f.isTriceps) {
      triple = /(close grip|estrecho|bench|press)/i.test(n) ? [35, 60, 90] : [20, 35, 55];
    } else if (f.isBiceps) {
      triple = [17.5, 30, 45];
    } else {
      triple = [15, 25, 40];
    }

    return [triple[0] * scale, triple[1] * scale, triple[2] * scale];
  }

  if (cat === 'dumbbell') {
    if (f.isLowerBody) {
      return /(goblet|copa|sumo)/i.test(n) ? [12, 22, 34] : [10, 18, 28];
    }
    if (f.isChest) {
      return /(fly|apertura|pullover)/i.test(n) ? [6, 12, 20] : [10, 20, 32];
    }
    if (f.isTraps || /shrug|encogimiento/i.test(n)) {
      return [14, 24, 36];
    }
    if (f.isBack) {
      return [10, 20, 32];
    }
    if (f.isShoulders) {
      return /press/i.test(n) ? [8, 16, 24] : [5, 10, 16];
    }
    if (f.isBiceps) {
      return [7.5, 14, 22];
    }
    if (f.isTriceps) {
      return [6, 12, 20];
    }
    if (f.isForearms) {
      return [5, 10, 16];
    }
    return [6, 12, 20];
  }

  if (cat === 'machine') {
    if (/(leg press|prensa|sled|hack)/i.test(n)) {
      return [80, 160, 260];
    }
    if (f.isAbductOrAdduct) {
      return [25, 45, 70];
    }
    if (f.isCalves) {
      return [35, 75, 120];
    }
    if (f.isQuadOrHamOrGlute || /(leg extension|leg curl|extensión de cuádriceps|curl femoral)/i.test(n)) {
      return [30, 55, 85];
    }
    if (f.isChest) {
      return /(fly|pec deck|apertura|contractora)/i.test(n) ? [25, 45, 70] : [35, 65, 95];
    }
    if (f.isBack || f.isTraps) {
      return [35, 65, 95];
    }
    if (f.isShoulders) {
      return /(lateral|raise|elevación|elevacion)/i.test(n) ? [15, 30, 45] : [25, 45, 70];
    }
    if (f.isBiceps || f.isTriceps || f.isAbs) {
      return [20, 40, 60];
    }
    return [15, 30, 45];
  }

  // cat === 'cable'
  if (f.isBack || /(pulldown|jalón|jalon|\brows?\b|\bremo\b)/i.test(n)) {
    return /(one arm|single arm|unilateral|a una mano|pullover|straight arm|pushdown)/i.test(n)
      ? [15, 30, 45]
      : [35, 65, 95];
  }
  if (f.isChest) {
    return [15, 27.5, 42.5];
  }
  if (f.isTriceps) {
    return [17.5, 35, 55];
  }
  if (f.isBiceps) {
    return [15, 30, 45];
  }
  if (f.isShoulders) {
    return /(lateral|front|rear|elevación|elevacion)/i.test(n) ? [5, 10, 17.5] : [15, 30, 45];
  }
  if (f.isLowerBody) {
    return [15, 30, 50];
  }
  if (f.isAbs) {
    return [20, 40, 65];
  }
  return [10, 20, 32.5];
}

export function calculateRecommendedPrescription(
  exercise: Exercise,
  levelInput: string,
  gender: 'male' | 'female' = 'male'
): { series: number; repeticiones: number; peso_objetivo: number } {
  const level = normalizeLevel(levelInput);
  const cat = detectEquipmentCategory(exercise);
  const f = getMuscleFlags(exercise);
  const n = (exercise.name || '').toLowerCase();

  // 1. Peso objetivo en KG
  const [begKg, intKg, expKg] = getBaseTripleKg(exercise, cat);
  let rawKg = level === 'beginner' ? begKg : level === 'intermediate' ? intKg : expKg;

  if (rawKg > 0 && gender === 'female') {
    rawKg *= f.isLowerBody ? 0.7 : 0.62;
  }

  const peso_objetivo = roundGymWeight(rawKg);

  // 2. Series y repeticiones según nivel y naturaleza del ejercicio
  const isCoreOrCalfOrForearm = f.isAbs || f.isCalves || f.isForearms || f.isCardio;
  const isHeavyCompound =
    (cat === 'barbell' || cat === 'smith' || cat === 'machine' || cat === 'kettlebell' || cat === 'zeroLoad') &&
    /(squat|sentadilla|deadlift|peso muerto|bench|press de banca|overhead press|military press|press militar|row|remo|leg press|prensa|hip thrust|empuje de cadera|pull[- ]?up|dominada|dip|fondo|lunge|zancada)/i.test(
      n
    );

  let series = 4;
  let repeticiones = 10;

  if (level === 'beginner') {
    series = 3;
    repeticiones = isCoreOrCalfOrForearm ? 15 : 12;
  } else if (level === 'intermediate') {
    series = 4;
    repeticiones = isCoreOrCalfOrForearm ? 15 : isHeavyCompound ? 10 : 12;
  } else {
    series = isHeavyCompound ? 5 : 4;
    repeticiones = isCoreOrCalfOrForearm ? 15 : isHeavyCompound ? 8 : 10;
  }

  return { series, repeticiones, peso_objetivo };
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function selectExercisesForLevel(
  exercises: Exercise[],
  muscles: string[],
  levelInput: string,
  count: number,
  existingIds: Set<string>,
  matchMuscle: (primaryMuscles: string[], selected: string) => boolean
): Exercise[] {
  if (count <= 0) return [];
  const targetLevel = normalizeLevel(levelInput);
  const musclePool = exercises.filter((ex) =>
    muscles.some((m) => matchMuscle(ex.primary_muscles, m))
  );
  if (musclePool.length === 0) return [];

  const isPureStretch = (ex: Exercise) =>
    /(stretch|estiramiento|circles|círculos|circulos)/i.test(ex.name || '');

  // Dividir por nivel respetando prioridad de ejercicios no usados (anti-repetición)
  const orderPool = (items: Exercise[]) => {
    const copy = shuffleInPlace([...items]);
    const fresh = copy.filter((ex) => !existingIds.has(ex.id));
    const used = copy.filter((ex) => existingIds.has(ex.id));
    return [...fresh, ...used];
  };

  // Nivel exacto (en intermedio/avanzado evitar estiramientos puros primero)
  const exactAll = musclePool.filter((ex) => normalizeLevel(ex.level) === targetLevel);
  const exactMain = targetLevel === 'beginner' ? exactAll : exactAll.filter((ex) => !isPureStretch(ex));
  const exactFallbackStretch = targetLevel === 'beginner' ? [] : exactAll.filter((ex) => isPureStretch(ex));

  // Niveles adyacentes como respaldo ordenado si faltan ejercicios del músculo
  const adjacentOrder: WorkoutLevel[] =
    targetLevel === 'beginner'
      ? ['intermediate', 'expert']
      : targetLevel === 'expert'
      ? ['intermediate', 'beginner']
      : ['beginner', 'expert'];

  const adjacentPools = adjacentOrder.flatMap((lvl) => {
    const sub = musclePool.filter((ex) => normalizeLevel(ex.level) === lvl);
    const nonStretch = sub.filter((ex) => !isPureStretch(ex));
    const stretch = sub.filter((ex) => isPureStretch(ex));
    return [...orderPool(nonStretch), ...orderPool(stretch)];
  });

  const combined = [...orderPool(exactMain), ...orderPool(exactFallbackStretch), ...adjacentPools];

  const picked: Exercise[] = [];
  const pickedIds = new Set<string>();
  for (const ex of combined) {
    if (pickedIds.has(ex.id)) continue;
    pickedIds.add(ex.id);
    picked.push(ex);
    if (picked.length >= count) break;
  }

  return picked;
}
