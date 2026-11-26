import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/theme';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const YEAR_MIN = 2000;
const YEAR_MAX = 2100;
const YEARS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i);
const ITEM_H = 48;

export default function CalendarModal({ visible, selected, hasWorkoutOn, onSelect, onClose }) {
  const [view, setView] = useState({ y: selected.getFullYear(), m: selected.getMonth() });
  const [pickYear, setPickYear] = useState(false);

  useEffect(() => {
    if (visible) {
      setView({ y: selected.getFullYear(), m: selected.getMonth() });
      setPickYear(false);
    }
  }, [visible]);

  const shiftMonth = (n) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  // build grid
  const first = new Date(view.y, view.m, 1).getDay();
  const total = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const today = new Date();
  const same = (a, b) => a.toDateString() === b.toDateString();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {/* Header: month arrows + month + year */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => shiftMonth(-1)} style={{ padding: 6 }}>
              <Feather name="chevron-left" size={22} color={colors.text} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17 }}>{MONTHS[view.m]} </Text>
              <TouchableOpacity
                onPress={() => setPickYear((p) => !p)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: colors.dark, fontWeight: '900', fontSize: 16 }}>{view.y}</Text>
                <Feather name={pickYear ? 'chevron-up' : 'chevron-down'} size={16} color={colors.dark} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => shiftMonth(1)} style={{ padding: 6 }}>
              <Feather name="chevron-right" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {pickYear ? (
            /* Scrollable year list */
            <FlatList
              style={{ height: ITEM_H * 5 }}
              data={YEARS}
              keyExtractor={(y) => String(y)}
              initialScrollIndex={Math.max(0, view.y - YEAR_MIN - 2)}
              getItemLayout={(_, i) => ({ length: ITEM_H, offset: ITEM_H * i, index: i })}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: y }) => {
                const active = y === view.y;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setView((v) => ({ ...v, y }));
                      setPickYear(false);
                    }}
                    style={{
                      height: ITEM_H,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 12,
                      backgroundColor: active ? colors.primary : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: active ? 20 : 17,
                        fontWeight: active ? '900' : '600',
                        color: active ? colors.dark : colors.text,
                      }}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <>
              {/* Weekday letters */}
              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                {DAY_LETTERS.map((d, i) => (
                  <Text
                    key={i}
                    style={{ width: '14.2857%', textAlign: 'center', color: colors.muted, fontWeight: '700', fontSize: 12 }}
                  >
                    {d}
                  </Text>
                ))}
              </View>

              {/* Days grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {cells.map((day, i) => {
                  if (!day) return <View key={i} style={{ width: '14.2857%', height: 46 }} />;
                  const date = new Date(view.y, view.m, day);
                  const isSel = same(date, selected);
                  const isToday = same(date, today);
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => onSelect(date)}
                      style={{ width: '14.2857%', height: 46, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSel ? colors.primary : 'transparent',
                          borderWidth: isToday && !isSel ? 2 : 0,
                          borderColor: colors.primary,
                        }}
                      >
                        <Text style={{ color: isSel ? colors.dark : colors.text, fontWeight: '700' }}>{day}</Text>
                      </View>
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 3,
                          marginTop: 1,
                          backgroundColor: hasWorkoutOn(date) ? colors.primary : 'transparent',
                        }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <TouchableOpacity onPress={onClose} style={{ alignItems: 'center', marginTop: 12 }}>
            <Text style={{ color: colors.muted, fontWeight: '700' }}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}