export const CATEGORIES = ['Strength', 'Cardio', 'HIIT', 'Core', 'Mobility'];
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const DEFAULT_REST = 30; // segundos, matag set

// sets + reps  O  sets + seconds (per set)
export const exerciseLibrary = {
  Strength: [
    { name: 'Bench press', sets: 4, reps: 8 },
    { name: 'Squats', sets: 4, reps: 10 },
    { name: 'Deadlifts', sets: 3, reps: 8 },
    { name: 'Shoulder press', sets: 3, reps: 10 },
    { name: 'Bent-over rows', sets: 4, reps: 10 },
    { name: 'Pull-ups', sets: 4, reps: 6 },
    { name: 'Bicep curls', sets: 3, reps: 12 },
    { name: 'Tricep dips', sets: 3, reps: 12 },
  ],
  Cardio: [
    { name: 'Jumping jacks', sets: 3, seconds: 60 },
    { name: 'High knees', sets: 3, seconds: 45 },
    { name: 'Jump rope', sets: 3, seconds: 60 },
    { name: 'Mountain climbers', sets: 3, seconds: 45 },
    { name: 'Brisk jog', sets: 1, seconds: 600 },
    { name: 'Stair climb', sets: 1, seconds: 300 },
  ],
  HIIT: [
    { name: 'Burpees', sets: 4, seconds: 40 },
    { name: 'Jump squats', sets: 4, seconds: 40 },
    { name: 'Sprint intervals', sets: 6, seconds: 30 },
    { name: 'Box jumps', sets: 4, seconds: 30 },
    { name: 'Battle ropes', sets: 4, seconds: 30 },
  ],
  Core: [
    { name: 'Crunches', sets: 3, reps: 15 },
    { name: 'Leg raises', sets: 3, reps: 12 },
    { name: 'Russian twists', sets: 3, reps: 20 },
    { name: 'Bicycle crunches', sets: 3, reps: 20 },
    { name: 'Plank', sets: 3, seconds: 45 },
  ],
  Mobility: [
    { name: 'Hamstring stretch', sets: 2, seconds: 30 },
    { name: 'Hip opener', sets: 2, seconds: 30 },
    { name: 'Cat-cow', sets: 2, seconds: 30 },
    { name: 'Child pose', sets: 1, seconds: 60 },
    { name: 'Shoulder rolls', sets: 1, seconds: 60 },
  ],
};

// "Squats 4x10" | "Plank 3x30s" | "Brisk jog 15 min" | "Burpees 40s on / 20s off" | "Lunges 3x12 each leg"
export const parseExerciseText = (text) => {
  const t = String(text).trim();
  let m = t.match(/^(.+?)\s+(\d+)x(\d+)(s?)\b/i);
  if (m)
    return m[4]
      ? { name: m[1], sets: +m[2], seconds: +m[3] }
      : { name: m[1], sets: +m[2], reps: +m[3] };
  m = t.match(/^(.+?)\s+(\d+)\s*min\b/i);
  if (m) return { name: m[1], sets: 1, seconds: +m[2] * 60 };
  m = t.match(/^(.+?)\s+(\d+)\s*s(?:ec)?\b/i);
  if (m) return { name: m[1], sets: 1, seconds: +m[2] };
  return { name: t, sets: 1, seconds: 60 };
};

// pagbanabana lang (para sa total duration): reps = mga 3 segundos kada rep
export const exSeconds = (e) => {
  const sets = e.sets || 1;
  if (e.seconds) return sets * e.seconds;
  if (e.reps) return sets * Math.max(20, e.reps * 3);
  return 60;
};

export const exDetail = (e) => {
  const sets = e.sets || 1;
  let what = '1 min';
  if (e.seconds) what = e.seconds >= 60 && e.seconds % 60 === 0 ? `${e.seconds / 60} min` : `${e.seconds} sec`;
  else if (e.reps) what = `${e.reps} reps`;
  return `${sets} ${sets === 1 ? 'set' : 'sets'} • ${what}`;
};

// total minutos: work + rest tali sa matag set
export const workoutMinutes = (list, rest = DEFAULT_REST) => {
  const work = list.reduce((a, e) => a + exSeconds(e), 0);
  const totalSets = list.reduce((a, e) => a + (e.sets || 1), 0);
  return Math.max(1, Math.round((work + rest * Math.max(0, totalSets - 1)) / 60));
};

// gamiton ang w.exercises; kung wala, i-parse gikan sa notes (daan nga data)
export const getExercises = (w) => {
  if (!w) return [];
  if (w.exercises && w.exercises.length) return w.exercises;
  return (w.notes || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseExerciseText);
};

// Suggested workout -> workout nga i-add sa user (apil ang video)
export const buildSuggestedWorkout = (item) => {
  const lines = item.exercises || [];
  return {
    name: item.name,
    category: item.category,
    level: item.level,
    duration: item.duration,
    calories: item.calories,
    notes: lines.map((e) => (typeof e === 'string' ? e : e.name)).join(', '),
    image: item.image,
    video: item.video || '',
    rest: item.rest ?? DEFAULT_REST,
    exercises: lines.map((e) => (typeof e === 'string' ? parseExerciseText(e) : e)),
  };
};