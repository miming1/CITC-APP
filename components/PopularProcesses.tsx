import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {processes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.pill}
            onPress={() => onPressProcess?.(item)}
            activeOpacity={0.75}
          >
            <Text style={styles.pillText} numberOfLines={1}>{item.title}</Text>
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
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1340',
    marginBottom: 16,
  },

  // ── Pill grid ──────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // ── Pill button ────────────────────────────────────────────────────────────
  // Width is dynamic to text length but capped at 166 — height fixed at 30
  pill: {
    height: 30,
    maxWidth: 166,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 12,
    color: '#1E1340',
    fontWeight: '500',
  },

});