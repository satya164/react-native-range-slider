import * as React from 'react';

import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RangeSlider } from 'react-native-range-slider';

export default function App() {
  const [singleValue, setSingleValue] = React.useState(30);
  const [rangeValue, setRangeValue] = React.useState<[number, number]>([
    24, 64,
  ]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View>
        <RangeSlider
          range={[15, 75]}
          step={5}
          value={singleValue}
          onValueChange={setSingleValue}
        />
        <Text style={styles.subtitle}>Selected: {singleValue}</Text>
      </View>
      <View>
        <RangeSlider
          range={[16, 256]}
          step={8}
          minDelta={8}
          value={rangeValue}
          onValueChange={setRangeValue}
        />
        <Text style={styles.subtitle}>
          Selected: {rangeValue[0]} - {rangeValue[1]}
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  subtitle: {
    marginTop: 10,
  },
});
