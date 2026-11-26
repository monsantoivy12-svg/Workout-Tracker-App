import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { exDetail } from '../data/exerciseLibrary';
import AppButton from './AppButton';
import ExerciseAnimation from './ExerciseAnimation';

const REPS_SET_SECONDS = 30; // every set of a reps exercise gets this countdown

const fmt = (s) => {
  const t = Math.max(0, s);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

// reps exercise = has reps and no seconds; timer exercise = everything else
const isReps = (ex) => !!ex.reps && !ex.seconds;
const workSeconds = (ex) => (isReps(ex) ? REPS_SET_SECONDS : ex.seconds || 60);

const cleanList = (exercises) => (exercises || []).filter((e) => e && !e.rest);

// each set = 1 work step, then a rest step (except the last one)
const buildSteps = (list, rest) => {
  const steps = [];
  list.forEach((ex, ei) => {
    const sets = Math.max(1, ex.sets || 1);
    for (let s = 1; s <= sets; s++) {
      steps.push({ type: 'work', ei, set: s, sets });
      const last = ei === list.length - 1 && s === sets;
      if (!last && rest > 0) steps.push({ type: 'rest' });
    }
  });
  return steps;
};

export default function WorkoutSession({ visible, title, exercises, rest = 30, onExerciseDone, onClose }) {
  const insets = useSafeAreaInsets();

  // snapshot taken when the session opens, so outside changes can't break it
  const [list, setList] = useState(() => cleanList(exercises));
  const [restSec, setRestSec] = useState(rest);

  const steps = useMemo(() => buildSteps(list, restSec), [list, restSec]);

  const [phase, setPhase] = useState('overview'); // overview | ready | run | done
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);

  const startValue = (i) => {
    const st = steps[i];
    if (!st) return 0;
    if (st.type === 'rest') return restSec;
    const ex = list[st.ei];
    return ex ? workSeconds(ex) : 0;
  };

  // opens: take a fresh snapshot. closes: stop everything and reset.
  useEffect(() => {
    if (visible) {
      setList(cleanList(exercises));
      setRestSec(rest);
    }
    setPhase('overview');
    setIdx(0);
    setRunning(false);
    setLeft(0);
  }, [visible]);

  // safe exit: stop the timer first, then close
  const handleClose = () => {
    setRunning(false);
    Vibration.cancel();
    setPhase('overview');
    setIdx(0);
    setLeft(0);
    if (onClose) onClose();
  };

  const step = steps[idx];
  const isRest = phase === 'run' && step?.type === 'rest';
  const ex = step?.type === 'work' ? list[step.ei] : null;
  const repsMode = phase === 'run' && !!ex && isReps(ex);

  const begin = () => {
    if (!steps.length) return;
    setIdx(0);
    setLeft(3);
    setPhase('ready');
    setRunning(true);
  };

  // timer: always counts down (only while the session is open)
  useEffect(() => {
    if (!visible || !running || (phase !== 'ready' && phase !== 'run')) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [visible, running, phase]);

  const goNext = (completed) => {
    if (!step) return;
    if (completed && step.type === 'work' && step.set === step.sets && list[step.ei]) {
      onExerciseDone && onExerciseDone(list[step.ei]);
    }
    Vibration.vibrate(completed ? 300 : 50);
    if (idx >= steps.length - 1) {
      setPhase('done');
      setRunning(false);
      return;
    }
    const ni = idx + 1;
    setIdx(ni);
    setLeft(startValue(ni));
  };

  const goPrev = () => {
    let pi = idx - 1;
    if (pi >= 0 && steps[pi]?.type === 'rest') pi -= 1;
    if (pi < 0) return;
    setIdx(pi);
    setLeft(startValue(pi));
  };

  // reached 0: ready -> run, or auto-next (timer AND reps sets)
  useEffect(() => {
    if (!visible || !running || left > 0) return;
    if (phase === 'ready') {
      Vibration.vibrate(100);
      setPhase('run');
      setLeft(startValue(idx));
      return;
    }
    if (phase === 'run') goNext(true);
  }, [left, running, phase]);

  // render nothing while closed
  if (!visible) return null;

  const total = list.length;
  const curEi = step ? (step.type === 'work' ? step.ei : steps[idx - 1]?.ei ?? 0) : 0;
  const nxt = steps[idx + 1];
  const nxtEx = nxt?.type === 'work' ? list[nxt.ei] : null;
  const animEx = isRest ? nxtEx : ex; // exercise to animate (during rest, the next one)
  const broken = (phase === 'ready' || phase === 'run') && !step;

  const Segments = () => (
    <View style={{ flexDirection: 'row', gap: 4, marginTop: 14 }}>
      {list.map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 5,
            borderRadius: 3,
            backgroundColor: phase === 'done' || i <= curEi ? colors.primary : colors.surface,
          }}
        />
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 20,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900', flex: 1, marginLeft: 12 }} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* ===== OVERVIEW ===== */}
        {phase === 'overview' ? (
          <>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 18 }}>
              {total} {total === 1 ? 'Exercise' : 'Exercises'}
            </Text>
            <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
              {list.map((e, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      backgroundColor: colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 20 }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17 }}>{e.name}</Text>
                    <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 2 }}>{exDetail(e)}</Text>
                  </View>
                </View>
              ))}
              <View style={{ height: 10 }} />
            </ScrollView>
            <AppButton title="START" onPress={begin} />
          </>
        ) : null}

        {/* ===== FALLBACK ===== */}
        {broken ? (
          <>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>
                Something went wrong with this session.
              </Text>
            </View>
            <AppButton title="Close" onPress={handleClose} />
          </>
        ) : null}

        {/* ===== READY / RUN ===== */}
        {!broken && (phase === 'ready' || phase === 'run') ? (
          <>
            <Segments />
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingTop: 14, alignItems: 'center', justifyContent: 'center' }}
              showsVerticalScrollIndicator={false}
            >

              {/* Animated exercise figure */}
              {animEx ? (
                <View style={{ alignSelf: 'stretch', marginBottom: 8 }}>
                  <ExerciseAnimation
                    exercise={animEx}
                    height={170}
                    playing={running || phase === 'ready'}
                  />
                </View>
              ) : null}

              {phase === 'ready' ? (
                <View style={{ alignItems: 'center', paddingVertical: 14 }}>
                  <Text style={{ color: colors.primary, fontSize: 34, fontWeight: '900' }}>Ready to go!</Text>
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 6, textAlign: 'center' }}>
                    {ex?.name}
                  </Text>
                  <View
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: 55,
                      borderWidth: 6,
                      borderColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 18,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 54, fontWeight: '900' }}>{Math.max(0, left)}</Text>
                  </View>
                </View>
              ) : isRest ? (
                <View style={{ alignItems: 'center', paddingVertical: 14 }}>
                  <Text style={{ color: colors.primary, fontWeight: '800', letterSpacing: 1 }}>REST</Text>
                  <Text style={{ color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 6 }}>Take a breather</Text>
                  {nxtEx ? (
                    <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>
                      Next: {nxtEx.name} • Set {nxt?.set} of {nxt?.sets}
                    </Text>
                  ) : null}
                  <Text style={{ color: running ? colors.primary : colors.text, fontSize: 76, fontWeight: '900', marginTop: 10 }}>
                    {fmt(left)}
                  </Text>
                </View>
              ) : ex ? (
                <View style={{ alignItems: 'center', paddingVertical: 14 }}>
                  <Text style={{ color: colors.primary, fontWeight: '800', letterSpacing: 1 }}>
                    EXERCISE {(step?.ei ?? 0) + 1} OF {total}
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 6, textAlign: 'center' }}>
                    {ex.name}
                  </Text>
                  <Text style={{ color: colors.muted, marginTop: 4 }}>
                    Set {step?.set} of {step?.sets} • {exDetail(ex)}
                  </Text>
                  {repsMode ? (
                    <>
                      <Text style={{ color: colors.text, fontSize: 60, fontWeight: '900', marginTop: 12 }}>{ex.reps} reps</Text>
                      <Text style={{ color: running ? colors.primary : colors.text, fontSize: 44, fontWeight: '900', marginTop: 4 }}>
                        {fmt(left)}
                      </Text>
                      <Text style={{ color: colors.muted, marginTop: 2 }}>{REPS_SET_SECONDS}s per set</Text>
                    </>
                  ) : (
                    <Text style={{ color: running ? colors.primary : colors.text, fontSize: 76, fontWeight: '900', marginTop: 10 }}>
                      {fmt(left)}
                    </Text>
                  )}
                </View>
              ) : null}
              <View style={{ height: 10 }} />
            </ScrollView>

            {/* Controls */}
            {repsMode ? <AppButton title="✓ Done set" onPress={() => goNext(true)} /> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={goPrev}
                disabled={phase === 'ready'}
                style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center', opacity: phase === 'ready' ? 0.3 : 1 }}
              >
                <Feather name="skip-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <AppButton
                title={running ? '⏸ PAUSE' : '▶ START'}
                style={{ flex: 1 }}
                onPress={() => setRunning((r) => !r)}
              />
              <TouchableOpacity
                onPress={() => (phase === 'ready' ? setLeft(0) : goNext(false))}
                style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}
              >
                <Feather name="skip-forward" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {isRest ? (
              <AppButton title="+10s rest" variant="outline" onPress={() => setLeft((s) => s + 10)} />
            ) : null}
            <AppButton title="End workout" variant="danger" onPress={handleClose} />
          </>
        ) : null}

        {/* ===== DONE ===== */}
        {phase === 'done' ? (
          <>
            <Segments />
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="check-circle" size={80} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 14 }}>Workout complete!</Text>
              <Text style={{ color: colors.muted, marginTop: 6 }}>{total} exercise(s) done. Great job!</Text>
            </View>
            <AppButton title="Close" onPress={handleClose} />
          </>
        ) : null}
      </View>
    </Modal>
  );
}