import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import ScreenBackground from '../components/ScreenBackground';
import VideoPlayer from '../components/VideoPlayer';
import WorkoutSession from '../components/WorkoutSession';
import { colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { defaultImageFor } from '../data/categoryImages';
import { DEFAULT_REST, exDetail, getExercises } from '../data/exerciseLibrary';
import { defaultVideoFor } from '../data/localVideos';
import { removeWorkout, selectWorkoutById } from '../store/workoutsSlice';
import { fixImageUrl, hasVideo as isPlayable, youTubeThumb } from '../utils/video';

const levelOf = (w) => {
  if (w.level) return w.level;
  if (w.duration <= 20) return 'Easy';
  if (w.duration <= 45) return 'Moderate';
  return 'Hard';
};

const fmtSec = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${r} sec`;
};

const Chip = ({ icon, label }) => (
  <View
    style={{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    }}
  >
    <Feather name={icon} size={15} color={colors.primary} />
    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>{label}</Text>
  </View>
);

function ExerciseRow({ index, item, image, done, onPress }) {
  const [failed, setFailed] = useState(false);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: done ? colors.primary : colors.border,
      }}
    >
      <Text style={{ color: colors.text, fontWeight: '800', width: 24, textAlign: 'center' }}>{index + 1}</Text>
      {image && !failed ? (
        <Image
          source={{ uri: image }}
          style={{ width: 52, height: 52, borderRadius: 10, marginHorizontal: 10 }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 10,
            marginHorizontal: 10,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="activity" size={22} color={colors.muted} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: done ? colors.muted : colors.text,
            fontWeight: '800',
            fontSize: 15,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {item.name}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{item.detail}</Text>
      </View>
      {done ? (
        <Feather name="check-circle" size={20} color={colors.primary} />
      ) : (
        <Feather name="chevron-right" size={20} color={colors.muted} />
      )}
    </TouchableOpacity>
  );
}

export default function WorkoutDetailScreen() {
  useTheme();
  const params = useLocalSearchParams(); // dynamic route param from /workout/[id]
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const dispatch = useDispatch();
  const w = useSelector(selectWorkoutById(id));
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);

  // ---- ALL hooks must be above any early return ----
  const [imgFailed, setImgFailed] = useState(false);
  const [selected, setSelected] = useState(null);
  const [doneList, setDoneList] = useState([]);
  const [session, setSession] = useState(null); // exercises to run
  const [sessionOpen, setSessionOpen] = useState(false);
  const [playing, setPlaying] = useState(false); // video nag-play sulod sa hero card

  // "Rest" placeholder items are left out: the session adds the rest timer itself
  const exercises = getExercises(w)
    .filter((e) => !e.rest)
    .map((e, i) => ({ ...e, _i: i, detail: exDetail(e) }));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const toggleDone = (i) =>
    setDoneList((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));

  if (!w)
    return (
      <ScreenBackground>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
          <Text style={{ marginVertical: 20, color: colors.text, fontSize: 16 }}>
            Workout not found (ID: {String(id)}).
          </Text>
          <AppButton title="← Back" onPress={goBack} />
        </View>
      </ScreenBackground>
    );

  const onDelete = () =>
    Alert.alert('Delete', `Delete "${w.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(removeWorkout(id));
          goBack();
        },
      },
    ]);

  const level = levelOf(w);
  const videoUrl = w.video || defaultVideoFor(w.category); // automatic if no video
  const hasVideo = isPlayable(videoUrl);
  const heroUri = fixImageUrl(w.image) || youTubeThumb(videoUrl) || defaultImageFor(w.category);
  const rest = w.rest ?? DEFAULT_REST;
  const about =
    `A ${level.toLowerCase()} ${w.duration}-minute ${(w.category || 'workout').toLowerCase()} routine designed to burn around ` +
    `${w.calories} kcal. Stay consistent, keep good form and finish every set.`;

  const playVideo = () => {
    if (!hasVideo) return;
    setPlaying(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const startFull = () => {
    if (!exercises.length) return Alert.alert('No exercises', 'Edit this workout and add exercises first.');
    setPlaying(false);
    setDoneList([]);
    setSession(exercises);
    setSessionOpen(true);
  };

  const startOne = (ex) => {
    setSelected(null);
    setPlaying(false);
    setTimeout(() => {
      setSession([ex]);
      setSessionOpen(true);
    }, 350); // wait for the pop-up to close
  };

  const sel = selected !== null ? exercises[selected] : null;

  return (
    <ScreenBackground>
      <ScrollView
        ref={scrollRef}
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Top bar */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity onPress={goBack} style={{ width: 40, height: 40, justifyContent: 'center' }}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>Workout</Text>
          <TouchableOpacity
            onPress={() => router.push(`/edit/${w.id}`)}
            style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' }}
          >
            <Feather name="edit-2" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Hero: image + play button, o ang video mismo kung nag-play */}
        <AppCard style={{ marginHorizontal: 16, marginBottom: 0, padding: 0, overflow: 'hidden', height: 220 }}>
          {playing && hasVideo ? (
            <VideoPlayer url={videoUrl} height={220} autoplay />
          ) : (
            <TouchableOpacity activeOpacity={hasVideo ? 0.85 : 1} onPress={playVideo} style={{ flex: 1 }}>
              {heroUri && !imgFailed ? (
                <Image
                  source={{ uri: heroUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
                  <Feather name="activity" size={56} color={colors.muted} />
                </View>
              )}
              {hasVideo ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                  }}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="play" size={28} color={colors.dark} />
                  </View>
                </View>
              ) : null}
            </TouchableOpacity>
          )}
        </AppCard>

        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12, marginTop: 16, letterSpacing: 0.5 }}>
            {(w.category || 'Workout').toUpperCase()}
          </Text>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 }}>{w.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Feather name="clock" size={15} color={colors.muted} />
            <Text style={{ color: colors.muted, marginLeft: 6 }}>{w.duration} min</Text>
            <Text style={{ color: colors.muted, marginHorizontal: 8 }}>•</Text>
            <Feather name="bar-chart-2" size={15} color={colors.muted} />
            <Text style={{ color: colors.muted, marginLeft: 6 }}>{level}</Text>
          </View>

          {/* Start workout */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={startFull}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 30,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
            }}
          >
            <Feather name="play" size={18} color={colors.dark} />
            <Text style={{ color: colors.dark, fontWeight: '900', fontSize: 16, marginLeft: 8 }}>Start Workout</Text>
          </TouchableOpacity>

          {hasVideo ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => (playing ? setPlaying(false) : playVideo())}
              style={{
                borderRadius: 30,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
                borderWidth: 2,
                borderColor: colors.primary,
              }}
            >
              <Feather name={playing ? 'x-circle' : 'video'} size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 15, marginLeft: 8 }}>
                {playing ? 'Close video' : 'Watch video'}
              </Text>
            </TouchableOpacity>
          ) : null}

          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 24 }}>About This Workout</Text>
          <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 8 }}>{about}</Text>
          {w.notes ? (
            <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 6 }}>
              Notes: <Text style={{ color: colors.text }}>{w.notes}</Text>
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Chip icon="hash" label={`ID: ${w.id}`} />
            <Chip icon="zap" label={`${w.calories} kcal`} />
            <Chip icon="pause-circle" label={`Rest ${rest}s`} />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 28,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>Workout Plan</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {exercises.length} {exercises.length === 1 ? 'Exercise' : 'Exercises'}
            </Text>
          </View>

          {exercises.length === 0 ? (
            <Text style={{ color: colors.muted }}>No exercises listed. Edit this workout to add some.</Text>
          ) : (
            exercises.map((ex, i) => (
              <ExerciseRow
                key={i}
                index={i}
                item={ex}
                image={heroUri}
                done={doneList.includes(i)}
                onPress={() => setSelected(i)}
              />
            ))
          )}

          <AppButton title="Edit" variant="secondary" onPress={() => router.push(`/edit/${w.id}`)} style={{ marginTop: 12 }} />
          <AppButton title="Delete" variant="danger" onPress={onDelete} />
          <AppButton title="← Back" variant="outline" onPress={goBack} />
        </View>
      </ScrollView>

      {/* Workout session: timer only (uses the workout's saved rest time) */}
      <WorkoutSession
        visible={sessionOpen}
        title={w.name}
        exercises={session || []}
        rest={rest}
        onExerciseDone={(e) => setDoneList((d) => (d.includes(e._i) ? d : [...d, e._i]))}
        onClose={() => setSessionOpen(false)}
      />

      {/* Single exercise pop-up */}
      <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSelected(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        >
          {sel ? (
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 20,
                paddingBottom: insets.bottom + 20,
              }}
            >
              <View
                style={{
                  alignSelf: 'center',
                  width: 44,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                  marginBottom: 16,
                }}
              />

              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>
                EXERCISE {selected + 1} OF {exercises.length}
              </Text>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '900', marginTop: 4 }}>{sel.name}</Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>{sel.detail}</Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Chip icon="layers" label={`${sel.sets || 1} sets`} />
                {sel.reps && !sel.seconds ? (
                  <Chip icon="repeat" label={`${sel.reps} reps`} />
                ) : (
                  <Chip icon="clock" label={fmtSec(sel.seconds || 60)} />
                )}
                <Chip icon="pause-circle" label={`Rest ${rest}s`} />
              </View>

              <AppButton title="▶ Start this exercise" onPress={() => startOne(sel)} style={{ marginTop: 16 }} />
              <AppButton
                title={doneList.includes(selected) ? 'Mark as not done' : '✓ Mark as done'}
                variant="secondary"
                onPress={() => toggleDone(selected)}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <AppButton
                  title="← Previous"
                  variant="outline"
                  style={{ flex: 1, opacity: selected === 0 ? 0.4 : 1 }}
                  onPress={() => selected > 0 && setSelected(selected - 1)}
                />
                <AppButton
                  title="Next →"
                  variant="outline"
                  style={{ flex: 1, opacity: selected === exercises.length - 1 ? 0.4 : 1 }}
                  onPress={() => selected < exercises.length - 1 && setSelected(selected + 1)}
                />
              </View>

              <AppButton title="Close" variant="secondary" onPress={() => setSelected(null)} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </Modal>
    </ScreenBackground>
  );
}