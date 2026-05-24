import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  onPressSeeAll?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PopularProcesses({
  processes,
  title = 'Popular Processes',
  onPressProcess,
  onPressSeeAll,
}: PopularProcessesProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const accentColor = isDark ? '#B8A4FF' : '#5D3FD3';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: isDark ? '#E8E0FF' : '#1E1340' }]}>
          {title}
        </Text>
        {onPressSeeAll && (
          <TouchableOpacity
            style={styles.seeAllChip}
            onPress={onPressSeeAll}
            activeOpacity={0.7}
          >
            <Text style={[styles.seeAllText, { color: accentColor }]}>See all</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={accentColor} />
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
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    height: 30,
    maxWidth: 166,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
  },
});