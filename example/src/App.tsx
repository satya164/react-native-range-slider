import * as React from 'react';

import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RangeSlider } from 'react-native-range-slider';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <RangeSlider
        minDelta={4}
        defaultValue={[10, 50]}
        onValueChange={(value) => {
          console.log('value changed', value);
        }}
      />
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
