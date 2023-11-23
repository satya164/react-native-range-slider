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

type Props<T extends number | [number, number]> = {
  value: T;
  onValueChange: (value: T) => void;
  range?: readonly [number, number];
  step?: number;
  minDelta?: T extends number ? undefined : number;
  trackHeight?: number;
  thumbSize?: number;
  thumbColor?: string;
  trackColor?: string;
  fillColor?: string;
};

export function RangeSlider<T extends number | [number, number]>({
  value,
  onValueChange,
  range = [0, 100],
  step = 1,
  minDelta = 0,
  thumbSize = 30,
  trackHeight = 5,
  thumbColor = '#111',
  trackColor = '#000',
  fillColor = '#0e7afe',
}: Props<T>) {
  // Get the distance between the range
  const distance = range[1] - range[0];
  const beginning = range[0];
  const single = typeof value === 'number';

  const current = useSharedValue(createPair(value, beginning));

  // If the value prop changes, update the current value
  React.useEffect(() => {
    current.value = createPair(value, beginning);
  }, [value, beginning, current]);

  const active = useSharedValue({
    start: false,
    end: false,
  });

  const offset = useSharedValue({
    start: 0,
    end: 0,
  });

  const width = useSharedValue(0);

  // Multiplier to convert the value from range to pixels
  const px = useDerivedValue(() => width.value / distance);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      // Record the initial position of the thumbs so we can add the translationX
      offset.value = {
        start: current.value.start * px.value,
        end: current.value.end * px.value,
      };

      if (single) {
        // Only the end thumb is present for single value
        active.value = {
          start: false,
          end: true,
        };
      } else {
        // Detect which thumb is active based on the touch position
        active.value = {
          start: e.x < offset.value.start + thumbSize,
          end: e.x > offset.value.end + thumbSize,
        };
      }
    })
    .onUpdate((e) => {
      let start, end;

      if (active.value.start) {
        // The start thumb can't go past the end thumb and should be at least minDelta away from it
        start = normalize(
          // Calculate the new value based on how much the finger moved
          // Then convert the final result from pixels back to range
          (offset.value.start + e.translationX) / px.value,
          0,
          current.value.end - minDelta,
          step
        );
      }

      if (active.value.end) {
        // The end thumb can't go past the start thumb and should be at least minDelta away from it
        end = normalize(
          // Calculate the new value based on how much the finger moved
          // Then convert the final result from pixels back to range
          (offset.value.end + e.translationX) / px.value,
          current.value.start + minDelta,
          distance,
          step
        );
      }

      current.value = {
        start: start ?? current.value.start,
        end: end ?? current.value.end,
      };
    })
    .onFinalize(() => {
      active.value = {
        start: false,
        end: false,
      };

      // @ts-expect-error: The type will be different based on the defaultValue
      const result: T = single
        ? current.value.end + range[0]
        : [current.value.start + range[0], current.value.end + range[0]];

      runOnJS(onValueChange)(result);
    });

  const fillStyle = useAnimatedStyle(() => {
    const scaleX = (current.value.end - current.value.start) / distance;

    return {
      transform: [
        // The fill should start at the same position as the start thumb
        { translateX: current.value.start * px.value },
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
      transform: [{ translateX: current.value.start * px.value }],
    };
  });

  const endThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: current.value.end * px.value }],
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
            top: thumbSize / 2 - trackHeight / 2,
            height: trackHeight,
            backgroundColor: trackColor,
            borderRadius: trackHeight / 2,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              fillStyle,
              StyleSheet.absoluteFill,
              {
                position: 'absolute',
                left: single
                  ? // For single value, start thumb is not present
                    // So we need to move the fill towards the left
                    -thumbSize
                  : 0,
                height: '100%',
                backgroundColor: fillColor,
              },
            ]}
          />
        </View>
        <View
          style={{
            position: 'absolute',
            // Reserve additional space for the start and end thumbs on both sides
            right: thumbSize,
            left: single
              ? // For single value, start thumb is not present
                // So we need to remove the space for it from the left
                0
              : thumbSize,
            height: '100%',
          }}
          onLayout={({ nativeEvent }) => {
            width.value = nativeEvent.layout.width;
          }}
        >
          {single ? null : ( // Don't render the start thumb for single value
            <Animated.View
              style={[thumbStyle, startThumbStyle, { left: -thumbSize }]}
            />
          )}
          <Animated.View style={[thumbStyle, endThumbStyle, { left: 0 }]} />
        </View>
      </View>
    </GestureDetector>
  );
}

const createPair = (value: number | [number, number], beginning: number) => {
  // We operate on the scale of 0-distance to keep things simple
  // We'll add it back when we call the onValueChange callback
  return {
    // If we are dealing with a single value, we only show the end thumb
    // So we set the start thumb to 0
    start: typeof value === 'number' ? 0 : value[0] - beginning,
    end: typeof value === 'number' ? value - beginning : value[1] - beginning,
  };
};

// Clamp the value to the bounds and round it to the nearest step
const normalize = (value: number, min: number, max: number, step: number) => {
  'worklet';

  return Math.round(Math.min(Math.max(value, min), max) / step) * step;
};
