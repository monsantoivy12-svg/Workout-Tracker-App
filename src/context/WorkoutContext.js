import { createContext, useContext, useState } from 'react';

const WorkoutContext = createContext();
export const useWorkouts = () => useContext(WorkoutContext);

const initialWorkouts = [
  {
    id: '1', name: 'Morning Run', duration: 30, calories: 300, notes: '5km easy pace',
    image: 'https://i.ytimg.com/vi/JqSIh5IiVAs/hqdefault.jpg',
  },
  {
    id: '2', name: 'Push Day', duration: 45, calories: 350, notes: 'Chest, shoulders, triceps',
    image: 'https://i.ytimg.com/vi/Za1r5qoQqlM/hqdefault.jpg',
  },
  {
    id: '3', name: 'Pull Day', duration: 45, calories: 340, notes: 'Pull-ups, rows, bicep curls',
    image: 'https://i.ytimg.com/vi/c83XiYpbW8o/hqdefault.jpg',
  },
  {
    id: '4', name: 'Leg Day', duration: 50, calories: 400, notes: 'Squats, deadlifts, lunges, calf raises',
    image: 'https://tse1.mm.bing.net/th/id/OIP.i5VejvGnfBDI0DyVNNAdYwHaEK?r=0&pid=Api&h=220&P=0',
  },
  {
    id: '5', name: 'Core Crusher', duration: 15, calories: 120, notes: 'Crunches, leg raises, planks',
    image: 'https://i.ytimg.com/vi/JX0yy74tlCI/hqdefault.jpg',
  },
];

const same = (a, b) => String(a) === String(b);

// Pangitaa ang pinakagamay nga ID (1, 2, 3, ...) nga wala pa magamit
const getNextId = (list) => {
  const used = new Set(list.map((w) => String(w.id)));
  let n = 1;
  while (used.has(String(n))) n++;
  return String(n);
};

export function WorkoutProvider({ children }) {
  const [workouts, setWorkouts] = useState(initialWorkouts);

  // CREATE: gamiton ang pinakagamay nga libre nga ID (mobalik sa na-delete)
  const addWorkout = (w) =>
    setWorkouts((p) => [{ ...w, id: getNextId(p) }, ...p]);

  // UPDATE
  const updateWorkout = (id, data) =>
    setWorkouts((p) => p.map((w) => (same(w.id, id) ? { ...w, ...data } : w)));

  // DELETE
  const deleteWorkout = (id) =>
    setWorkouts((p) => p.filter((w) => !same(w.id, id)));

  // READ
  const getWorkout = (id) => workouts.find((w) => same(w.id, id));

  return (
    <WorkoutContext.Provider value={{ workouts, addWorkout, updateWorkout, deleteWorkout, getWorkout }}>
      {children}
    </WorkoutContext.Provider>
  );
}