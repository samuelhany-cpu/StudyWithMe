import AsyncStorage from "@react-native-async-storage/async-storage";
import { startTransition, useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { appCopy, studyPalette } from "@studywithme/design-tokens";
import {
  applyCompletedSessionToTasks,
  assignTaskToTimer,
  calculateStreaks,
  calculateTodayFocusMinutes,
  calculateWeeklyFocusMinutes,
  createCompletedSession,
  createMockDashboardSnapshot,
  createTimerRuntime,
  formatFocusMinutes,
  formatSecondsClock,
  getProgressRatio,
  getSubjectSummary,
  parseTimerRuntime,
  pauseTimer,
  resetTimer,
  resumeTimer,
  serializeTimerRuntime,
  tickTimer,
  timerPresets,
  updateTimerPreset,
  weekLabels,
} from "@studywithme/domain";
import {
  createStudyWithMeNativeClient,
  getSupabaseStatusMessage,
  readSupabaseConfig,
} from "@studywithme/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const snapshot = createMockDashboardSnapshot();
const tabs = ["Dashboard", "Rooms", "Tasks", "Settings"] as const;
const timerStorageKey = "study-with-me:mobile:timer";
const sessionsStorageKey = "study-with-me:mobile:sessions";
const tasksStorageKey = "study-with-me:mobile:tasks";

type Tab = (typeof tabs)[number];

const supabaseState = readSupabaseConfig({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

const supabase = createStudyWithMeNativeClient(supabaseState, AsyncStorage);

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [appScreen, setAppScreen] = useState<"auth" | "app">(supabaseState.configured ? "auth" : "app");
  const [email, setEmail] = useState("");
  const [authStatus, setAuthStatus] = useState("Send a magic link when Supabase is configured, or continue in local mode.");
  const [notificationStatus, setNotificationStatus] = useState("Notifications are available for focus and break events.");
  const [tasks, setTasks] = useState(snapshot.tasks);
  const [recentSessions, setRecentSessions] = useState(snapshot.recentSessions);
  const [timerState, setTimerState] = useState(() => createTimerRuntime(snapshot.activePreset));
  const previousPhase = useRef(timerState.phase);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  useEffect(() => {
    void hydrateState();
    void requestNotificationPermission();
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(timerStorageKey, serializeTimerRuntime(timerState));
  }, [timerState]);

  useEffect(() => {
    void AsyncStorage.setItem(sessionsStorageKey, JSON.stringify(recentSessions));
  }, [recentSessions]);

  useEffect(() => {
    void AsyncStorage.setItem(tasksStorageKey, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (!["focus", "break"].includes(timerState.phase)) {
      return;
    }

    const interval = setInterval(() => {
      setTimerState((current) => tickTimer(current));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.phase]);

  useEffect(() => {
    const phaseChanged = previousPhase.current !== timerState.phase;

    if (!phaseChanged) {
      return;
    }

    if (timerState.phase === "break") {
      void sendLocalNotification("Focus block complete", "Time for a short break.");
    }

    if (timerState.phase === "completed") {
      const session = createCompletedSession(timerState, tasks);

      if (session) {
        setRecentSessions((current) => [session, ...current].slice(0, 14));
        setTasks((current) => applyCompletedSessionToTasks(current, session));
      }

      void sendLocalNotification("Session finished", "Your focus and break cycle are complete.");
    }

    previousPhase.current = timerState.phase;
  }, [tasks, timerState]);

  const streaks = calculateStreaks(recentSessions, timezone);
  const weeklyFocusMinutes = calculateWeeklyFocusMinutes(recentSessions, timezone);
  const subjectSummary = getSubjectSummary(recentSessions).slice(0, 3);
  const todayFocusMinutes = calculateTodayFocusMinutes(recentSessions, timezone);
  const selectedTask = tasks.find((task) => task.id === timerState.taskId);

  async function hydrateState() {
    const [savedTimer, savedSessions, savedTasks] = await Promise.all([
      AsyncStorage.getItem(timerStorageKey),
      AsyncStorage.getItem(sessionsStorageKey),
      AsyncStorage.getItem(tasksStorageKey),
    ]);

    const parsedTimer = parseTimerRuntime(savedTimer);

    if (parsedTimer) {
      setTimerState(parsedTimer);
    }

    if (savedSessions) {
      setRecentSessions(JSON.parse(savedSessions));
    }

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }

  async function requestNotificationPermission() {
    const permission = await Notifications.requestPermissionsAsync();

    setNotificationStatus(
      permission.status === "granted"
        ? "Local notifications are enabled for timer milestones."
        : "Notifications are disabled. Timer events will stay in-app only.",
    );
  }

  async function sendMagicLink() {
    if (!supabase) {
      setAuthStatus("Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable auth.");
      return;
    }

    if (!email) {
      setAuthStatus("Enter an email address first.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ email });
    setAuthStatus(error ? error.message : "Magic link requested. Finish sign-in from your email, then return here.");
  }

  if (appScreen === "auth") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.authShell}>
          <Text style={styles.heroEyebrow}>Mobile auth</Text>
          <Text style={styles.heroTitle}>{appCopy.name}</Text>
          <Text style={styles.heroCopy}>
            Mobile keeps full parity for the core study flow. Sign in when Supabase is ready, or continue locally for now.
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor="#8a7a6c"
          />

          <Pressable style={styles.primaryButton} onPress={sendMagicLink}>
            <Text style={styles.primaryButtonLabel}>Send magic link</Text>
          </Pressable>

          <View style={styles.panel}>
            <Text style={styles.sectionEyebrow}>Status</Text>
            <Text style={styles.helperCopy}>{authStatus}</Text>
            <Text style={[styles.helperCopy, { marginTop: 8 }]}>
              Google OAuth is queued behind native redirect-scheme wiring.
            </Text>
          </View>

          <Pressable style={styles.secondaryButton} onPress={() => setAppScreen("app")}>
            <Text style={styles.secondaryButtonLabel}>Continue in local mode</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.statusText}>{notificationStatus}</Text>
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionEyebrow}>Current cycle</Text>
                  <Text style={styles.timerPreset}>{timerState.preset.label}</Text>
                  <Text style={styles.timerMetaLabel}>
                    {selectedTask ? `Linked task: ${selectedTask.title}` : "No task linked yet"}
                  </Text>
                </View>
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>{timerState.phase}</Text>
                </View>
              </View>
              <Text style={styles.timerValue}>{formatSecondsClock(timerState.secondsRemaining)}</Text>
              <Text style={styles.timerMeta}>
                Focus today {formatFocusMinutes(todayFocusMinutes)}
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
                <Pressable style={styles.secondaryButtonDark} onPress={() => setTimerState((current) => pauseTimer(current))}>
                  <Text style={styles.secondaryButtonDarkLabel}>Pause</Text>
                </Pressable>
                <Pressable
                  style={styles.secondaryButtonDark}
                  onPress={() => setTimerState((current) => resetTimer(current.preset, current.taskId))}
                >
                  <Text style={styles.secondaryButtonDarkLabel}>Reset</Text>
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
              <View style={styles.presetWrap}>
                {tasks.map((task) => {
                  const active = timerState.taskId === task.id;

                  return (
                    <Pressable
                      key={task.id}
                      style={[styles.presetChip, active && styles.taskChipActive]}
                      onPress={() =>
                        setTimerState((current) =>
                          assignTaskToTimer(current, active ? undefined : task.id),
                        )
                      }
                    >
                      <Text style={[styles.presetChipLabel, active && styles.taskChipLabelActive]}>
                        {task.subject}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.statGrid}>
              <MetricCard label="Current streak" value={`${streaks.currentStreak} days`} detail="Synced from saved sessions" />
              <MetricCard label="Longest streak" value={`${streaks.longestStreak} days`} detail="Timezone-aware streak rules" />
            </View>

            <View style={styles.panel}>
              <Text style={styles.sectionEyebrow}>Weekly trend</Text>
              <Text style={styles.sectionTitle}>Focus rhythm</Text>
              <View style={styles.chartRow}>
                {weeklyFocusMinutes.map((minutes, index) => (
                  <View key={weekLabels[index]} style={styles.chartColumn}>
                    <Text style={styles.chartValue}>{minutes}</Text>
                    <View style={styles.chartTrack}>
                      <View style={[styles.chartBar, { height: Math.max(minutes * 0.8, 18) }]} />
                    </View>
                    <Text style={styles.chartLabel}>{weekLabels[index]}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.summaryWrap}>
                {subjectSummary.map((subject) => (
                  <View key={subject.subject} style={styles.summaryChip}>
                    <Text style={styles.summaryChipText}>{subject.subject} {subject.totalMinutes}m</Text>
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
              <Pressable
                key={room.id}
                style={styles.roomCard}
                onPress={() => {
                  const preset = timerPresets.find((candidate) => candidate.id === room.syncedPresetId);

                  if (preset) {
                    setTimerState((current) => updateTimerPreset(current, preset));
                  }
                }}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roomTitle}>{room.name}</Text>
                    <Text style={styles.roomCopy}>{room.vibe}</Text>
                  </View>
                  <Text style={styles.roomCount}>{room.occupancy}</Text>
                </View>
              </Pressable>
            ))}
            <Text style={styles.helperCopy}>v1 keeps rooms calm: presence, occupancy, synced timer, no chat.</Text>
          </View>
        ) : null}

        {activeTab === "Tasks" ? (
          <View style={styles.panel}>
            <Text style={styles.sectionEyebrow}>Task-linked sessions</Text>
            <Text style={styles.sectionTitle}>Study goals for today</Text>
            {tasks.map((task) => (
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

        {activeTab === "Settings" ? (
          <View style={styles.panel}>
            <Text style={styles.sectionEyebrow}>Settings and auth</Text>
            <Text style={styles.sectionTitle}>Project wiring</Text>
            <Text style={styles.helperCopy}>{notificationStatus}</Text>
            <Text style={[styles.helperCopy, { marginTop: 8 }]}>
              {getSupabaseStatusMessage(supabaseState.configured)}
            </Text>
            <Text style={[styles.helperCopy, { marginTop: 8 }]}>
              Expo mobile auth currently supports the magic-link flow scaffolding; Google OAuth still needs redirect-scheme setup.
            </Text>
            <Pressable style={[styles.secondaryButton, { marginTop: 14 }]} onPress={() => setAppScreen("auth")}>
              <Text style={styles.secondaryButtonLabel}>Open auth screen</Text>
            </Pressable>
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

  async function sendLocalNotification(title: string, body: string) {
    if (!Device.isDevice) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  }
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
  authShell: {
    flex: 1,
    padding: 18,
    gap: 14,
    justifyContent: "center",
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
  input: {
    borderRadius: 20,
    backgroundColor: studyPalette.paper,
    borderWidth: 1,
    borderColor: studyPalette.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: studyPalette.ink,
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tabButton: {
    flexGrow: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: studyPalette.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
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
  timerMetaLabel: {
    marginTop: 6,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 18,
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
    borderColor: studyPalette.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: studyPalette.paper,
  },
  secondaryButtonLabel: {
    color: studyPalette.ink,
    fontWeight: "600",
  },
  secondaryButtonDark: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonDarkLabel: {
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
  taskChipActive: {
    backgroundColor: studyPalette.accent,
    borderColor: studyPalette.accent,
  },
  presetChipLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  presetChipLabelActive: {
    color: studyPalette.night,
  },
  taskChipLabelActive: {
    color: "#fff",
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
  summaryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  summaryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: studyPalette.border,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summaryChipText: {
    color: studyPalette.mutedInk,
    fontSize: 12,
    fontWeight: "600",
  },
});
