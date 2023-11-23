import * as React from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

type Props = {
  defaultValue: readonly [number, number];
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
  fillColor = '#0e7afe',
}: Props) {
  const width = useSharedValue(0);

  const range = useSharedValue({
    start: defaultValue[0],
    end: defaultValue[1],
  });

  const active = useSharedValue({
    start: false,
    end: false,
  });

  const offset = useSharedValue({
    start: 0,
    end: 0,
  });

  // Multiplier to convert the value from 0-100 range to pixels
  const px = useDerivedValue(() => width.value / 100);

  // Clamp the value to the bounds and round it to avoid decimal numbers
  const clamp = (value: number, min: number, max: number) => {
    'worklet';

    return Math.round(Math.min(Math.max(value, min), max));
  };

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      // Record the initial position of the thumbs so we can add the translationX
      offset.value = {
        start: range.value.start * px.value,
        end: range.value.end * px.value,
      };

      // Detect which thumb is active based on the touch position
      active.value = {
        start: e.x < offset.value.start + thumbSize,
        end: e.x > offset.value.end + thumbSize,
      };
    })
    .onUpdate((e) => {
      if (!active.value.start && !active.value.end) {
        return;
      }

      // Calculate the new value based on how much the finger moved
      // Then convert the final result to 0-100 range from pixels
      const diff = active.value.start ? offset.value.start : offset.value.end;
      const result = (diff + e.translationX) / px.value;

      if (active.value.start) {
        range.value = {
          // The start thumb can't go past the end thumb and should be at least minDelta away from it
          start: clamp(result, 0, range.value.end - minDelta),
          end: range.value.end,
        };
      } else {
        range.value = {
          start: range.value.start,
          // The end thumb can't go past the start thumb and should be at least minDelta away from it
          end: clamp(result, range.value.start + minDelta, 100),
        };
      }
    })
    .onFinalize(() => {
      active.value = {
        start: false,
        end: false,
      };

      runOnJS(onValueChange)([range.value.start, range.value.end]);
    });

  const fillStyle = useAnimatedStyle(() => {
    const scaleX = (range.value.end - range.value.start) / 100;

    return {
      transform: [
        // The fill should start at the same position as the start thumb
        { translateX: range.value.start * px.value },
        // The fill should be as wide as the distance between the two thumbs
        { scaleX },
        // Additional offset to keep it anchored to the left as scale is relative to the center
        // Any translation here will be scaled by the scaleX, so we need to divide to cancel it out
        // Simplified version of: -(width / 2 - (width * scale) / 2) / scale
        { translateX: -((width.value * (1 - scaleX)) / 2) / scaleX },
      ],
    };
  });

  const startThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: range.value.start * px.value }],
    };
  });

  const endThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: range.value.end * px.value }],
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
      <View style={{ height: thumbSize }}>
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
                height: trackHeight,
                backgroundColor: fillColor,
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
