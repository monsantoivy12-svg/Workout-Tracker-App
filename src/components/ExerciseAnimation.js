import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Line, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../constants/theme';

const PERIOD = 1800; // ms per cycle

// pose: head, neck, hip, eN/hN (near elbow/hand), eF/hF (far), kN/fN (near knee/foot), kF/fF (far)
const P = (head, neck, hip, eN, hN, eF, hF, kN, fN, kF, fF) => ({
  head, neck, hip, eN, hN, eF, hF, kN, fN, kF, fF,
});

const STAND = P([120, 18], [120, 34], [120, 74], [136, 52], [154, 52], [134, 54], [152, 56], [122, 106], [124, 138], [116, 106], [114, 138]);
const ARMS_DOWN = { eN: [124, 56], hN: [126, 78], eF: [116, 56], hF: [114, 78] };

// plank / push-up base (facing right)
const PLANK = P([170, 74], [152, 84], [96, 104], [154, 111], [156, 138], [150, 111], [152, 138], [62, 118], [30, 136], [60, 120], [28, 138]);
// lying down (head on the left)
const LIE = P([54, 126], [70, 128], [112, 128], [90, 130], [112, 132], [90, 130], [112, 132], [146, 98], [166, 128], [142, 100], [160, 128]);

const ANIMS = {
  squat: {
    focus: 'legs',
    A: STAND,
    B: P([124, 54], [116, 68], [96, 104], [134, 66], [152, 64], [132, 68], [150, 66], [126, 106], [124, 138], [120, 106], [116, 138]),
  },
  pushup: {
    focus: 'chest',
    A: PLANK,
    B: P([170, 114], [152, 120], [98, 124], [128, 128], [156, 138], [126, 129], [154, 138], [64, 130], [30, 136], [62, 131], [28, 138]),
  },
  plank: { focus: 'core', A: PLANK, B: { ...PLANK, hip: [96, 106], head: [170, 76] } },
  climber: {
    focus: 'core',
    A: { ...PLANK, kN: [126, 112], fN: [112, 130] },
    B: { ...PLANK, kF: [124, 114], fF: [110, 130], kN: [62, 118], fN: [30, 136] },
  },
  jacks: {
    focus: 'full',
    A: P([120, 18], [120, 34], [120, 74], [106, 54], [104, 78], [134, 54], [136, 78], [112, 106], [110, 138], [128, 106], [130, 138]),
    B: P([120, 18], [120, 34], [120, 74], [96, 30], [80, 8], [144, 30], [160, 8], [100, 106], [84, 138], [140, 106], [156, 138]),
  },
  knees: {
    focus: 'legs',
    A: P([120, 18], [120, 34], [120, 74], [112, 52], [128, 44], [128, 52], [112, 44], [146, 78], [136, 100], [118, 106], [116, 138]),
    B: P([120, 18], [120, 34], [120, 74], [128, 52], [112, 44], [112, 52], [128, 44], [118, 106], [118, 138], [146, 78], [136, 100]),
  },
  lunge: {
    focus: 'legs',
    A: { ...STAND, eN: [104, 52], hN: [118, 70], eF: [102, 54], hF: [116, 72] },
    B: P([117, 46], [117, 62], [116, 100], [102, 80], [116, 96], [100, 82], [114, 98], [148, 100], [148, 138], [96, 120], [74, 138]),
  },
  crunch: {
    focus: 'core',
    A: { ...LIE, eN: [66, 108], hN: [56, 118], eF: [70, 108], hF: [60, 118] },
    B: { ...LIE, neck: [86, 100], head: [74, 94], eN: [92, 84], hN: [78, 94], eF: [96, 86], hF: [82, 96] },
  },
  legraise: {
    focus: 'core',
    A: { ...LIE, kN: [146, 128], fN: [180, 128], kF: [144, 129], fF: [178, 129] },
    B: { ...LIE, kN: [114, 98], fN: [116, 66], kF: [118, 98], fF: [120, 66] },
  },
  bridge: {
    focus: 'glutes',
    A: LIE,
    B: { ...LIE, hip: [118, 100], neck: [80, 124], head: [64, 126], kN: [150, 92], kF: [146, 94] },
  },
  deadlift: {
    focus: 'back',
    A: { ...STAND, ...ARMS_DOWN },
    B: P([142, 56], [128, 60], [92, 76], [130, 82], [132, 104], [126, 82], [128, 104], [112, 106], [124, 138], [108, 106], [116, 138]),
  },
  curl: {
    focus: 'arms',
    A: { ...STAND, ...ARMS_DOWN },
    B: { ...STAND, eN: [124, 56], hN: [140, 40], eF: [116, 56], hF: [132, 40] },
  },
  press: {
    focus: 'shoulders',
    A: { ...STAND, eN: [132, 46], hN: [130, 28], eF: [128, 46], hF: [126, 28] },
    B: { ...STAND, eN: [126, 14], hN: [124, -8], eF: [122, 14], hF: [120, -8] },
  },
  generic: {
    focus: 'full',
    A: { ...STAND, ...ARMS_DOWN },
    B: { ...STAND, eN: [134, 40], hN: [148, 26], eF: [128, 40], hF: [142, 24] },
  },
};

const pickKind = (name = '') => {
  const n = String(name).toLowerCase();
  if (/jumping jack|jump rope/.test(n)) return 'jacks';
  if (/mountain/.test(n)) return 'climber';
  if (/high knee|jog|sprint|run|stair/.test(n)) return 'knees';
  if (/push-?\s?up/.test(n)) return 'pushup';
  if (/plank/.test(n)) return 'plank';
  if (/bridge/.test(n)) return 'bridge';
  if (/leg raise/.test(n)) return 'legraise';
  if (/crunch|twist|sit-?up/.test(n)) return 'crunch';
  if (/lunge/.test(n)) return 'lunge';
  if (/squat|burpee|box jump/.test(n)) return 'squat';
  if (/deadlift/.test(n)) return 'deadlift';
  if (/curl/.test(n)) return 'curl';
  if (/shoulder press|overhead/.test(n)) return 'press';
  return 'generic';
};

const lerp = (a, b, t) => a + (b - a) * t;
const lerpPt = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const KEYS = ['head', 'neck', 'hip', 'eN', 'hN', 'eF', 'hF', 'kN', 'fN', 'kF', 'fF'];

const glowPoint = (focus, j) => {
  switch (focus) {
    case 'legs': return lerpPt(j.hip, j.kN, 0.5);
    case 'glutes': return j.hip;
    case 'chest': return lerpPt(j.neck, j.hip, 0.2);
    case 'arms': return lerpPt(j.neck, j.eN, 0.9);
    case 'shoulders': return j.neck;
    default: return lerpPt(j.neck, j.hip, 0.5); // core, back, full
  }
};

const SKIN = '#E8B896';
const SKIN_FAR = '#C99777';
const SHORTS = '#2A2A33';
const SHORTS_FAR = '#1E1E25';
const HAIR = '#3B2A22';

export default function ExerciseAnimation({ exercise, playing = true, height = 220 }) {
  const [t, setT] = useState(0);
  const tRef = useRef(0);

  useEffect(() => {
    if (!playing) return undefined;
    let raf;
    let last = 0;
    const base = Date.now() - tRef.current * PERIOD;
    const tick = (now) => {
      tRef.current = (Date.now() - base) / PERIOD;
      // update about 30 times per second (lighter on the phone)
      if (now - last > 33) {
        last = now;
        setT(tRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  if (!exercise) return null;

  const anim = ANIMS[pickKind(exercise.name)];
  const phase = t % 1;
  const s = (1 - Math.cos(phase * Math.PI * 2)) / 2; // 0 -> 1 -> 0 (smooth)

  const j = {};
  KEYS.forEach((k) => {
    j[k] = lerpPt(anim.A[k], anim.B[k], s);
  });

  const g = glowPoint(anim.focus, j);
  const glowR = 20 + 8 * s;

  const line = (a, b, w, c, key) => (
    <Line
      key={key}
      x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
      stroke={c} strokeWidth={w} strokeLinecap="round"
    />
  );

  const leg = (hip, knee, foot, far) => [
    line(hip, knee, 12, far ? SKIN_FAR : SKIN, `t${far}`),
    line(knee, foot, 9, far ? SKIN_FAR : SKIN, `s${far}`),
    line(hip, lerpPt(hip, knee, 0.55), 14, far ? SHORTS_FAR : SHORTS, `sh${far}`),
  ];
  const arm = (neck, elbow, hand, far) => [
    line(neck, elbow, 8, far ? SKIN_FAR : SKIN, `u${far}`),
    line(elbow, hand, 7, far ? SKIN_FAR : SKIN, `f${far}`),
  ];

  const label = exercise.seconds
    ? `${exercise.sets || 1}x${exercise.seconds}s`
    : `${exercise.sets || 1}x${exercise.reps || 10}`;

  return (
    <View
      style={{
        height,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: colors.surface || '#1C1C22',
        borderWidth: 1,
        borderColor: colors.border || '#333',
        alignSelf: 'stretch',
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 -16 240 168" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FF2D2D" stopOpacity="0.95" />
            <Stop offset="60%" stopColor="#FF2D2D" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#FF2D2D" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* shadow */}
        <Ellipse cx="120" cy="141" rx="92" ry="5" fill="rgba(0,0,0,0.25)" />

        {/* far arm + far leg */}
        {arm(j.neck, j.eF, j.hF, true)}
        {leg(j.hip, j.kF, j.fF, true)}

        {/* torso (sports top) */}
        {line(j.neck, j.hip, 20, colors.primary, 'torso')}
        {line(lerpPt(j.neck, j.hip, 0.15), lerpPt(j.neck, j.hip, 0.85), 8, 'rgba(255,255,255,0.25)', 'torso-hl')}

        {/* muscle glow */}
        <Circle cx={g[0]} cy={g[1]} r={glowR} fill="url(#glow)" />

        {/* near leg + near arm */}
        {leg(j.hip, j.kN, j.fN, false)}
        {arm(j.neck, j.eN, j.hN, false)}

        {/* head */}
        <Circle cx={j.head[0] - 1.5} cy={j.head[1] - 1.5} r="11.5" fill={HAIR} />
        <Circle cx={j.head[0] + 1.5} cy={j.head[1] + 1} r="9" fill={SKIN} />
      </Svg>

      <View
        style={{
          position: 'absolute',
          right: 12,
          bottom: 10,
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 5,
        }}
      >
        <Text style={{ color: '#111', fontWeight: '900', fontSize: 16 }}>{label}</Text>
      </View>
    </View>
  );
}