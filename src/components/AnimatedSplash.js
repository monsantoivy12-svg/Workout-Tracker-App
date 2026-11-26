import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import Logo from './Logo';

// 3 ka dots nga nag-bounce ug nag-fade, magkasunod-sunod
function LoadingDots() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = dots.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(v, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 350,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          // pahulay aron magkasunod-sunod ang 3 ka dots
          Animated.delay((2 - i) * 160),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 24 }}>
      {dots.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            marginHorizontal: 5,
            backgroundColor: colors.primary,
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
            transform: [
              { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
              { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

// onReady: gitawag kung na-render na ang splash (aron i-hide ang native splash)
// onFinish: gitawag kung human na ang animation
export default function AnimatedSplash({ onReady, onFinish }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // logo mo-fade in ug mo-zoom
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),
      // tagline + loading dots
      Animated.parallel([
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // hold (mas taas aron makita ang dots)
      Animated.delay(1600),
      // fade out tibuok splash
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish && onFinish());
  }, []);

  return (
    <Animated.View
      onLayout={() => onReady && onReady()}
      pointerEvents="auto"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: screenOpacity,
        zIndex: 999,
      }}
    >
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Logo size={1.3} />
      </Animated.View>

      <Animated.View style={{ opacity: tagOpacity, marginTop: 8 }}>
        <Text style={{ color: colors.muted, fontSize: 14, fontWeight: '700', letterSpacing: 1 }}>
          Set Goals, Crush Them, Repeat!
        </Text>
      </Animated.View>

      <Animated.View style={{ opacity: dotsOpacity, marginTop: 36 }}>
        <LoadingDots />
      </Animated.View>
    </Animated.View>
  );
}