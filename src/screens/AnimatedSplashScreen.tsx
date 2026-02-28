import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

const REVEAL_STAGGER_MS = 35;
const WORD_START_DELAY_MS = 180;
const HOLD_BEFORE_FADE_MS = 500;
const FADE_OUT_MS = 300;

const TITLE = 'MAKLER';
const SUBTITLE = 'QARAQALPAQ';

const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onFinish }) => {
  const titleLetters = useMemo(() => TITLE.split(''), []);
  const subtitleLetters = useMemo(() => SUBTITLE.split(''), []);

  const containerOpacity = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  const titleLetterValues = useRef(titleLetters.map(() => new Animated.Value(0))).current;
  const subtitleLetterValues = useRef(subtitleLetters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.03,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    const titleAnimations = titleLetterValues.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 320,
        delay: i * REVEAL_STAGGER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );

    const subtitleBaseDelay = titleLetterValues.length * REVEAL_STAGGER_MS + WORD_START_DELAY_MS;
    const subtitleAnimations = subtitleLetterValues.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 320,
        delay: subtitleBaseDelay + i * REVEAL_STAGGER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );


    const sequence = Animated.sequence([
      Animated.parallel([...titleAnimations, ...subtitleAnimations]),
      Animated.delay(HOLD_BEFORE_FADE_MS),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    sequence.start(({ finished }) => {
      pulse.stop();
      if (finished) {
        onFinish();
      }
    });

    return () => {
      pulse.stop();
    };
  }, [containerOpacity, onFinish, pulseScale, subtitleLetterValues, titleLetterValues]);

  const renderWord = (
    letters: string[],
    values: Animated.Value[],
    letterStyle: 'titleLetter' | 'subtitleLetter',
  ) => {
    return letters.map((char, index) => (
      <Animated.Text
        key={`${char}-${index}`}
        style={[
          styles[letterStyle],
          {
            opacity: values[index],
            transform: [
              {
                translateY: values[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        {char}
      </Animated.Text>
    ));
  };

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <Animated.View style={[styles.centerContent, { transform: [{ scale: pulseScale }] }]}>
        <View style={styles.titleRow}>{renderWord(titleLetters, titleLetterValues, 'titleLetter')}</View>
        <View style={styles.subtitleRow}>{renderWord(subtitleLetters, subtitleLetterValues, 'subtitleLetter')}</View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
  },
  subtitleRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  titleLetter: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#0F172A',
    lineHeight: 48,
    marginHorizontal: 1,
  },
  subtitleLetter: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#475569',
    marginHorizontal: 1,
  },
});

export default AnimatedSplashScreen;
