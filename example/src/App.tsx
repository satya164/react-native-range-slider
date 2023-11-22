import * as React from 'react';

import { StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RangeSlider } from 'react-native-range-slider';

export default function App() {
  const [value, setValue] = React.useState<[number, number]>([10, 50]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <RangeSlider minDelta={5} defaultValue={value} onValueChange={setValue} />
      <Text>
        Range: {value[0]} - {value[1]}
      </Text>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 20,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
