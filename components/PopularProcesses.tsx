import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Process {
  id: string;
  title: string;
}

interface PopularProcessesProps {
  processes: Process[];
  title?: string;
  onPressProcess?: (process: Process) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PopularProcesses({
  processes,
  title = 'Popular Processes',
  onPressProcess,
}: PopularProcessesProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? '#E8E0FF' : '#1E1340' }]}>
        {title}
      </Text>
      <View style={styles.grid}>
        {processes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.pill, { backgroundColor: isDark ? '#2A2040' : '#EBEBEB' }]}
            onPress={() => onPressProcess?.(item)}
            activeOpacity={0.75}
          >
            <Text
              style={[styles.pillText, { color: isDark ? '#E8E0FF' : '#1E1340' }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Section wrapper ────────────────────────────────────────────────────────
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 20,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  pill: {
    maxWidth: 1000,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 15,
    fontWeight: '500',
    marginVertical: 10,
  },

});