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
  // Optional — when provided, a "See all >" link renders next to the title.
  // Existing screens that don't pass this prop are unaffected.
  onSeeAll?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PopularProcesses({
  processes,
  title = 'Popular Processes',
  onPressProcess,
  onSeeAll,
}: PopularProcessesProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#E8E0FF' : '#1E1340';

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>

        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: isDark ? '#B8A9FF' : '#4B39EF' }]}>
              See all &gt;
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.grid}>
        {processes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.pill, { backgroundColor: isDark ? '#2A2040' : '#EBEBEB' }]}
            onPress={() => onPressProcess?.(item)}
            activeOpacity={0.75}
          >
            <Text
              style={[styles.pillText, { color: textColor }]}
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

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
  },

  seeAll: {
    fontSize: 14,
    fontWeight: '600',
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