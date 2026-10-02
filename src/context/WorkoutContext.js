import { createContext, useContext, useState } from 'react';

const WorkoutContext = createContext();
export const useWorkouts = () => useContext(WorkoutContext);

export function WorkoutProvider({ children }) {
  const [workouts, setWorkouts] = useState([
    {
      id: '1', name: 'Morning Run', duration: 30, calories: 300, notes: '5km easy pace',
      image: 'https://i.ytimg.com/vi/JqSIh5IiVAs/hqdefault.jpg',
    },
    {
      id: '2', name: 'Push Day', duration: 45, calories: 350, notes: 'Chest, shoulders, triceps',
      image: 'https://i.ytimg.com/vi/Za1r5qoQqlM/hqdefault.jpg',
    },
  ]);

  // CREATE
  const addWorkout = (w) => setWorkouts((p) => [{ ...w, id: Date.now().toString() }, ...p]);
  // UPDATE
  const updateWorkout = (id, data) => setWorkouts((p) => p.map((w) => (w.id === id ? { ...w, ...data } : w)));
  // DELETE
  const deleteWorkout = (id) => setWorkouts((p) => p.filter((w) => w.id !== id));
  // READ
  const getWorkout = (id) => workouts.find((w) => w.id === id);

  return (
    <WorkoutContext.Provider value={{ workouts, addWorkout, updateWorkout, deleteWorkout, getWorkout }}>
      {children}
    </WorkoutContext.Provider>
  );
}