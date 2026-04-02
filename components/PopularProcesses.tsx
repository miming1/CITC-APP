import { StyleSheet, Text, View } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Process {
  id: string;
  // Add your actual process fields here, e.g.:
  // title: string;
  // icon?: string;
}

interface PopularProcessesProps {
  processes: Process[];
  // Optionally override the section title per page
  title?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PopularProcesses({
  processes,
  title = 'Popular Processes',
}: PopularProcessesProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {processes.map((item) => (
          /*
           * Replace this placeholder View with your actual process card.
           * Example: <ProcessCard key={item.id} process={item} />
           */
          <View key={item.id} style={styles.card} />
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

  // ── Card grid ──────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '31%',
    height: 70,
    backgroundColor: '#D8D3E8',
    borderRadius: 8,
  },

});