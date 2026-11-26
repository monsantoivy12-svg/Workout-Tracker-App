import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import ScreenHeader from '../components/ScreenHeader';
import SuggestionForm from '../components/SuggestionForm';
import WorkoutForm from '../components/WorkoutForm';
import { colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import {
  addSuggestion,
  removeSuggestion,
  selectSuggestions,
  updateSuggestion,
} from '../store/suggestionsSlice';
import { addWorkout, deleteWorkout, updateWorkout } from '../store/workoutsSlice';
import { fixImageUrl, getYouTubeId, youTubeThumb } from '../utils/video';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : 'Never';
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
const fmtTime = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;

function Tile({ icon, value, label }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Feather name={icon} size={20} color={colors.primary} />
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 20, marginTop: 6 }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function UserCard({ user, list, open, onToggle, onAdd, onEdit, onDelete }) {
  const mins = list.reduce((a, w) => a + (w.duration || 0), 0);
  const kcal = list.reduce((a, w) => a + (w.calories || 0), 0);
  const sorted = [...list].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const initial = user.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <AppCard>
      <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={{ fontWeight: '900', fontSize: 18, color: colors.dark }}>{initial}</Text>
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginTop: 14 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 18 }}>{list.length}</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Workouts</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 18 }}>{fmtTime(mins)}</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Total time</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 18 }}>{kcal}</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Kcal</Text>
        </View>
      </View>

      {open ? (
        <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Joined: {fmtDate(user.createdAt)}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>Last login: {fmtDateTime(user.lastLogin)}</Text>

          <Text style={{ color: colors.text, fontWeight: '800', marginTop: 12 }}>Workouts</Text>
          <AppButton title="+ Add workout for this user" onPress={onAdd} style={{ marginTop: 8 }} />

          {sorted.length === 0 ? (
            <Text style={{ color: colors.muted, marginTop: 6 }}>No workouts yet.</Text>
          ) : (
            sorted.map((w) => (
              <View key={w.id} style={{ marginTop: 8, padding: 12, borderRadius: 14, backgroundColor: colors.surface }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={{ color: colors.text, fontWeight: '800' }} numberOfLines={1}>
                      {w.name}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11 }}>{fmtDate(w.date)}</Text>
                  </View>
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>
                    {w.duration} min • {w.calories} kcal
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <AppButton title="Edit" variant="secondary" style={{ flex: 1, paddingVertical: 10 }} onPress={() => onEdit(w)} />
                  <AppButton title="Delete" variant="danger" style={{ flex: 1, paddingVertical: 10 }} onPress={() => onDelete(w)} />
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}
    </AppCard>
  );
}

function SuggestionRow({ item, onEdit, onDelete }) {
  const [failed, setFailed] = useState(false);
  const uri = fixImageUrl(item.image) || youTubeThumb(item.video);
  const hasVideo = !!getYouTubeId(item.video) || /^asset:/i.test(item.video || '');

  return (
    <AppCard>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {uri && !failed ? (
          <Image
            source={{ uri }}
            style={{ width: 84, aspectRatio: 16 / 9, borderRadius: 10 }}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <View
            style={{
              width: 84,
              aspectRatio: 16 / 9,
              borderRadius: 10,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="activity" size={20} color={colors.muted} />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
            {item.category} • {item.level} • {item.duration} min
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Feather name={hasVideo ? 'video' : 'video-off'} size={13} color={hasVideo ? colors.primary : colors.muted} />
            <Text style={{ color: hasVideo ? colors.primary : colors.muted, fontSize: 11, marginLeft: 4 }}>
              {hasVideo ? 'In-app video' : 'No valid video link'}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <AppButton title="Edit" variant="secondary" style={{ flex: 1, paddingVertical: 10 }} onPress={onEdit} />
        <AppButton title="Delete" variant="danger" style={{ flex: 1, paddingVertical: 10 }} onPress={onDelete} />
      </View>
    </AppCard>
  );
}

export default function AdminScreen() {
  useTheme();
  const dispatch = useDispatch();
  const allUsers = useSelector((s) => s.auth.users);
  const byUser = useSelector((s) => s.workouts.byUser);
  const suggestions = useSelector(selectSuggestions);

  const users = allUsers.filter((u) => u.role !== 'admin');
  const totalWorkouts = users.reduce((a, u) => a + (byUser[u.email]?.length || 0), 0);
  const activeToday = users.filter((u) => u.lastLogin && sameDay(u.lastLogin, new Date())).length;

  const [tab, setTab] = useState('users'); // 'users' | 'suggested'
  const [open, setOpen] = useState(null); // email of expanded user
  const [editing, setEditing] = useState(null); // suggestion form
  const [userForm, setUserForm] = useState(null); // { email, workout? }

  const Seg = ({ id, label, icon }) => {
    const active = tab === id;
    return (
      <TouchableOpacity
        onPress={() => {
          setTab(id);
          setEditing(null);
          setUserForm(null);
        }}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: active ? colors.primary : 'transparent',
        }}
      >
        <Feather name={icon} size={16} color={active ? colors.dark : colors.muted} />
        <Text style={{ marginLeft: 6, fontWeight: '800', color: active ? colors.dark : colors.muted }}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const confirmDeleteSuggestion = (item) =>
    Alert.alert('Delete', `Delete "${item.name}" from suggestions?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(removeSuggestion(item.id)) },
    ]);

  const confirmDeleteWorkout = (email, w) =>
    Alert.alert('Delete', `Delete "${w.name}" from this user?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteWorkout({ email, id: w.id })) },
    ]);

  const formUser = userForm ? users.find((u) => u.email === userForm.email) : null;

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Admin" subtitle="Monitor users & manage suggested workouts" />

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 4,
          marginHorizontal: 16,
          marginTop: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Seg id="users" label="Users" icon="users" />
        <Seg id="suggested" label="Suggested" icon="star" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {tab === 'users' ? (
          userForm ? (
            <AppCard
              title={
                userForm.workout
                  ? `Edit workout for ${formUser?.name || 'user'}`
                  : `New workout for ${formUser?.name || 'user'}`
              }
            >
              <WorkoutForm
                key={userForm.workout?.id || 'new'}
                initial={userForm.workout || {}}
                submitLabel={userForm.workout ? 'Update Workout' : 'Save Workout'}
                onSubmit={(d) => {
                  if (userForm.workout)
                    dispatch(updateWorkout({ email: userForm.email, id: userForm.workout.id, data: d }));
                  else dispatch(addWorkout({ email: userForm.email, workout: d }));
                  setUserForm(null);
                }}
              />
              <AppButton title="Cancel" variant="outline" onPress={() => setUserForm(null)} />
            </AppCard>
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                <Tile icon="users" value={users.length} label="Users" />
                <Tile icon="activity" value={totalWorkouts} label="Workouts" />
                <Tile icon="log-in" value={activeToday} label="Active today" />
              </View>

              {users.length === 0 ? (
                <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 24 }}>
                  No registered users yet.
                </Text>
              ) : (
                users.map((u) => (
                  <UserCard
                    key={u.email}
                    user={u}
                    list={byUser[u.email] || []}
                    open={open === u.email}
                    onToggle={() => setOpen(open === u.email ? null : u.email)}
                    onAdd={() => setUserForm({ email: u.email })}
                    onEdit={(w) => setUserForm({ email: u.email, workout: w })}
                    onDelete={(w) => confirmDeleteWorkout(u.email, w)}
                  />
                ))
              )}
            </>
          )
        ) : editing ? (
          <AppCard title={editing.id ? 'Edit suggested workout' : 'New suggested workout'}>
            <SuggestionForm
              key={editing.id || 'new'}
              initial={editing.id ? editing : null}
              onCancel={() => setEditing(null)}
              onSubmit={(data) => {
                if (editing.id) dispatch(updateSuggestion({ id: editing.id, data }));
                else dispatch(addSuggestion(data));
                setEditing(null);
              }}
            />
          </AppCard>
        ) : (
          <>
            <AppButton title="+ Add suggested workout" onPress={() => setEditing({})} />
            <Text style={{ color: colors.muted, fontSize: 12, marginVertical: 8 }}>
              {suggestions.length} suggested workout(s). Users see these on their Home screen.
            </Text>
            {suggestions.map((s) => (
              <SuggestionRow key={s.id} item={s} onEdit={() => setEditing(s)} onDelete={() => confirmDeleteSuggestion(s)} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}