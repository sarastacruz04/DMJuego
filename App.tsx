import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import HeroAvatarHUD from './src/components/HeroAvatarHUD';
import StatsControlPanel from './src/components/StatsControlPanel';
import ArmoryGrid from './src/components/ArmoryGrid';
import ReduxLiveInspector from './src/components/ReduxLiveInspector';
import { colors, spacing } from './src/theme';

// App solo hace layout y monta el <Provider>. Las 4 zonas son hermanas y NO
// reciben props: cada una se conecta al store por su cuenta (cero prop drilling).
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
          <StatusBar style="light" />
          {/* Zona A: siempre visible arriba */}
          <HeroAvatarHUD />
          {/* Zonas B y C: desplazables en el centro */}
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <StatsControlPanel />
            <ArmoryGrid />
          </ScrollView>
          {/* Zona D: fija abajo, con la consola siempre visible */}
          <ReduxLiveInspector />
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
});
