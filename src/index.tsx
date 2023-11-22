import * as React from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

type Props = {
  defaultValue: [number, number];
  onValueChange: (value: [number, number]) => void;
  minDelta?: number;
  trackHeight?: number;
  thumbSize?: number;
  thumbColor?: string;
  trackColor?: string;
  fillColor?: string;
};

export function RangeSlider({
  defaultValue,
  onValueChange,
  thumbSize = 30,
  trackHeight = 5,
  minDelta = 0,
  thumbColor = '#111',
  trackColor = '#000',
  fillColor = 'tomato',
}: Props) {
  const width = useSharedValue(0);

  const start = useSharedValue(defaultValue[0]);
  const end = useSharedValue(defaultValue[1]);

  const offsetStart = useSharedValue(0);
  const offsetEnd = useSharedValue(0);

  const activeStart = useSharedValue(false);
  const activeEnd = useSharedValue(false);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      offsetStart.value = (start.value * width.value) / 100;
      offsetEnd.value = (end.value * width.value) / 100;

      activeStart.value = e.x < offsetStart.value + thumbSize;
      activeEnd.value = e.x > offsetEnd.value + thumbSize;
    })
    .onUpdate((e) => {
      if (!activeStart.value && !activeEnd.value) {
        return;
      }

      const offset = activeStart.value ? offsetStart : offsetEnd;
      const result = ((offset.value + e.translationX) / width.value) * 100;

      if (activeStart.value) {
        start.value = Math.min(end.value - minDelta, Math.max(0, result));
      } else {
        end.value = Math.max(start.value + minDelta, Math.min(100, result));
      }
    })
    .onFinalize(() => {
      activeStart.value = false;
      activeEnd.value = false;

      runOnJS(onValueChange)([start.value, end.value]);
    });

  const fillStyle = useAnimatedStyle(() => {
    return {
      width: ((end.value - start.value) / 100) * width.value,
      transform: [
        { translateX: (start.value / 100) * width.value + thumbSize },
      ],
    };
  });

  const startThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: (start.value / 100) * width.value }],
    };
  });

  const endThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: (end.value / 100) * width.value }],
    };
  });

  const thumbStyle = {
    position: 'absolute',
    width: thumbSize,
    aspectRatio: 1,
    borderRadius: thumbSize / 2,
    top: 0,
    backgroundColor: thumbColor,
  } as const;

  return (
    <GestureDetector gesture={gesture}>
      <View>
        <View
          style={{
            height: trackHeight,
            width: '100%',
            backgroundColor: trackColor,
            borderRadius: trackHeight / 2,
          }}
        >
          <Animated.View
            style={[
              fillStyle,
              StyleSheet.absoluteFill,
              {
                backgroundColor: fillColor,
                height: trackHeight,
              },
            ]}
          />
        </View>
        <View
          style={{
            position: 'absolute',
            top: -thumbSize / 2 + trackHeight / 2,
            left: thumbSize,
            right: thumbSize,
            height: thumbSize,
          }}
          onLayout={({ nativeEvent }) => {
            width.value = nativeEvent.layout.width;
          }}
        >
          <Animated.View
            style={[thumbStyle, startThumbStyle, { left: -thumbSize }]}
          />
          <Animated.View style={[thumbStyle, endThumbStyle, { left: 0 }]} />
        </View>
      </View>
    </GestureDetector>
  );
}
