# react-native-range-slider

> [!WARNING]
> 🚧 This is a work in progress. It is not ready for production use and the API is subject to change.

A range slider component built with Reanimated & Gesture Handler

## Installation

```sh
npm install react-native-range-slider
```

## Usage

```js
import { RangeSlider } from 'react-native-range-slider';

// ...

<RangeSlider
  range={[15, 75]}
  step={5}
  value={singleValue}
  onValueChange={setSingleValue}
/>;
```

## Props

### `value` (`number | [number, number]`) (required)

The value of the slider. Pass a number for a single value slider or a tuple of 2 numbers for a range slider.

### `onValueChange` (`(value: number) => void`) (required)

Callback which is called when the value of the slider changes.

### `range` (`[number, number]`)

The range of the slider. The first value is the minimum value and the second value is the maximum value.

Default: `[0, 100]`

### `step` (`number`)

The step value of the slider. The slider will snap to multiples of this value.

Default: `1`

### `minDelta` (`number`)

The minimum distance between the two thumbs. Only applicable for range slider.

Default: `0`

### `thumbColor` (`string`)

The color of the thumbs of the slider.

Default: `#fff`

### `thumbSize` (`number`)

The size of the thumbs of the slider.

Default: `27`

### `trackColor` (`string`)

The color of the track of the slider.

Default: `rgba(0, 0, 0, 0.1)`

### `trackFillColor` (`string`)

The color of the filled part of the track of the slider.

Default: `#3478f6`

### `trackHeight` (`number`)

The height of the track of the slider.

Default: `4`

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
