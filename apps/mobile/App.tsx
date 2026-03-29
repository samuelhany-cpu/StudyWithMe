import { startTransition, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { appCopy, studyPalette } from "@studywithme/design-tokens";
import {
  createMockDashboardSnapshot,
  createTimerRuntime,
  formatFocusMinutes,
  formatSecondsClock,
  getProgressRatio,
  pauseTimer,
  resetTimer,
  resumeTimer,
  tickTimer,
  timerPresets,
  updateTimerPreset,
  weekLabels,
} from "@studywithme/domain";
import { getSupabaseStatusMessage, readSupabaseConfig } from "@studywithme/supabase";

const snapshot = createMockDashboardSnapshot();

const tabs = ["Dashboard", "Rooms", "Tasks"] as const;

type Tab = (typeof tabs)[number];

const supabaseState = readSupabaseConfig({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [timerState, setTimerState] = useState(() => createTimerRuntime(snapshot.activePreset));

  useEffect(() => {
    if (!["focus", "break"].includes(timerState.phase)) {
      return;
    }

    const interval = setInterval(() => {
      setTimerState((current) => tickTimer(current));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.phase]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Cross-platform focus</Text>
          <Text style={styles.heroTitle}>{appCopy.name}</Text>
          <Text style={styles.heroCopy}>{appCopy.summary}</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>{snapshot.liveUsers} studying live</Text>
          </View>
          <Text style={styles.statusText}>{getSupabaseStatusMessage(supabaseState.configured)}</Text>
        </View>

        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const active = tab === activeTab;

            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, active && styles.tabButtonActive]}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab}</Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === "Dashboard" ? (
          <>
            <View style={styles.timerCard}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.sectionEyebrow}>Current cycle</Text>
                  <Text style={styles.timerPreset}>{timerState.preset.label}</Text>
                </View>
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>{timerState.phase}</Text>
                </View>
              </View>
              <Text style={styles.timerValue}>{formatSecondsClock(timerState.secondsRemaining)}</Text>
              <Text style={styles.timerMeta}>
                Focus today {formatFocusMinutes(snapshot.todayFocusMinutes + timerState.completedFocusMinutes)}
              </Text>
              <View style={styles.buttonRow}>
                <Pressable style={styles.primaryButton} onPress={() => setTimerState((current) => resumeTimer(current))}>
                  <Text style={styles.primaryButtonLabel}>
                    {timerState.phase === "paused"
                      ? "Resume"
                      : timerState.phase === "idle"
                        ? "Start session"
                        : "Keep flowing"}
                  </Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => setTimerState((current) => pauseTimer(current))}>
                  <Text style={styles.secondaryButtonLabel}>Pause</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => setTimerState(resetTimer(timerState.preset))}>
                  <Text style={styles.secondaryButtonLabel}>Reset</Text>
                </Pressable>
              </View>
              <View style={styles.presetWrap}>
                {timerPresets.map((preset) => {
                  const active = preset.id === timerState.preset.id;

                  return (
                    <Pressable
                      key={preset.id}
                      style={[styles.presetChip, active && styles.presetChipActive]}
                      onPress={() =>
                        startTransition(() => {
                          setTimerState((current) => updateTimerPreset(current, preset));
                        })
                      }
                    >
                      <Text style={[styles.presetChipLabel, active && styles.presetChipLabelActive]}>
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.statGrid}>
              <MetricCard label="Current streak" value={`${snapshot.currentStreak} days`} detail="Consistency is rising" />
              <MetricCard label="Longest streak" value={`${snapshot.longestStreak} days`} detail="Best personal run" />
            </View>

            <View style={styles.panel}>
              <Text style={styles.sectionEyebrow}>Weekly trend</Text>
              <Text style={styles.sectionTitle}>Focus rhythm</Text>
              <View style={styles.chartRow}>
                {snapshot.weeklyFocusMinutes.map((minutes, index) => (
                  <View key={weekLabels[index]} style={styles.chartColumn}>
                    <Text style={styles.chartValue}>{minutes}</Text>
                    <View style={styles.chartTrack}>
                      <View style={[styles.chartBar, { height: Math.max(minutes * 0.8, 18) }]} />
                    </View>
                    <Text style={styles.chartLabel}>{weekLabels[index]}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}

        {activeTab === "Rooms" ? (
          <View style={styles.panel}>
            <Text style={styles.sectionEyebrow}>Ambient rooms</Text>
            <Text style={styles.sectionTitle}>Quiet spaces with synced timers</Text>
            {snapshot.rooms.map((room) => (
              <View key={room.id} style={styles.roomCard}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roomTitle}>{room.name}</Text>
                    <Text style={styles.roomCopy}>{room.vibe}</Text>
                  </View>
                  <Text style={styles.roomCount}>{room.occupancy}</Text>
                </View>
              </View>
            ))}
            <Text style={styles.helperCopy}>v1 keeps rooms calm: presence, occupancy, synced timer, no chat.</Text>
          </View>
        ) : null}

        {activeTab === "Tasks" ? (
          <View style={styles.panel}>
            <Text style={styles.sectionEyebrow}>Task-linked sessions</Text>
            <Text style={styles.sectionTitle}>Study goals for today</Text>
            {snapshot.tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskCopy}>{task.subject}</Text>
                  </View>
                  <Text style={styles.taskCount}>
                    {task.completedPomodoros}/{task.estimatedPomodoros}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${getProgressRatio(task) * 100}%` }]} />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.sectionEyebrow}>Live presence</Text>
          <Text style={styles.sectionTitle}>People focusing now</Text>
          <View style={styles.presenceWrap}>
            {snapshot.presence.map((user) => (
              <View key={user.id} style={styles.presencePill}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.avatar}</Text>
                </View>
                <View>
                  <Text style={styles.presenceName}>{user.name}</Text>
                  <Text style={styles.presenceStatus}>{user.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: studyPalette.canvas,
  },
  content: {
    padding: 18,
    gap: 16,
  },
  hero: {
    backgroundColor: studyPalette.paper,
    borderColor: studyPalette.border,
    borderWidth: 1,
    borderRadius: 30,
    padding: 22,
    gap: 10,
    shadowColor: studyPalette.cardShadow,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  heroEyebrow: {
    color: studyPalette.mutedInk,
    fontSize: 11,
    letterSpacing: 2.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: studyPalette.ink,
    fontSize: 34,
    fontWeight: "700",
  },
  heroCopy: {
    color: studyPalette.mutedInk,
    fontSize: 15,
    lineHeight: 23,
  },
  liveBadge: {
    alignSelf: "flex-start",
    backgroundColor: studyPalette.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  statusText: {
    color: studyPalette.mutedInk,
    fontSize: 12,
    lineHeight: 18,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: studyPalette.border,
    paddingVertical: 12,
    backgroundColor: "rgba(255,250,242,0.7)",
  },
  tabButtonActive: {
    backgroundColor: studyPalette.night,
    borderColor: studyPalette.night,
  },
  tabLabel: {
    textAlign: "center",
    color: studyPalette.mutedInk,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#fff",
  },
  timerCard: {
    backgroundColor: studyPalette.night,
    borderRadius: 30,
    padding: 22,
    gap: 14,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionEyebrow: {
    color: studyPalette.mutedInk,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  timerPreset: {
    marginTop: 6,
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  phaseBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  phaseBadgeText: {
    color: "#fff",
    textTransform: "capitalize",
  },
  timerValue: {
    color: "#fff",
    fontSize: 54,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },
  timerMeta: {
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: studyPalette.accent,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonLabel: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  presetWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  presetChipActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  presetChipLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  presetChipLabelActive: {
    color: studyPalette.night,
  },
  statGrid: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: studyPalette.paper,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: studyPalette.border,
    padding: 18,
  },
  metricLabel: {
    color: studyPalette.mutedInk,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  metricValue: {
    marginTop: 10,
    color: studyPalette.ink,
    fontSize: 28,
    fontWeight: "700",
  },
  metricDetail: {
    marginTop: 6,
    color: studyPalette.mutedInk,
    fontSize: 13,
  },
  panel: {
    backgroundColor: studyPalette.paper,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: studyPalette.border,
    padding: 22,
    gap: 14,
  },
  sectionTitle: {
    color: studyPalette.ink,
    fontSize: 25,
    fontWeight: "700",
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  chartValue: {
    color: studyPalette.mutedInk,
    fontSize: 11,
  },
  chartTrack: {
    height: 140,
    width: "100%",
    justifyContent: "flex-end",
  },
  chartBar: {
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: studyPalette.accent,
  },
  chartLabel: {
    color: studyPalette.mutedInk,
    fontSize: 10,
    textTransform: "uppercase",
  },
  roomCard: {
    borderRadius: 24,
    backgroundColor: studyPalette.night,
    padding: 18,
  },
  roomTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  roomCopy: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 20,
  },
  roomCount: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  helperCopy: {
    color: studyPalette.mutedInk,
    fontSize: 13,
    lineHeight: 19,
  },
  taskCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: studyPalette.border,
    backgroundColor: "#fff",
    padding: 16,
    gap: 12,
  },
  taskTitle: {
    color: studyPalette.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  taskCopy: {
    marginTop: 4,
    color: studyPalette.mutedInk,
  },
  taskCount: {
    color: studyPalette.mutedInk,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: studyPalette.accentSoft,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: studyPalette.accent,
  },
  presenceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  presencePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: studyPalette.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studyPalette.night,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  presenceName: {
    color: studyPalette.ink,
    fontWeight: "700",
  },
  presenceStatus: {
    color: studyPalette.mutedInk,
    textTransform: "capitalize",
    fontSize: 12,
  },
});
