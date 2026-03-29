export type FocusPhase = "idle" | "focus" | "break" | "paused" | "completed";

export type SessionStatus = "active" | "paused" | "completed";

export type TimerPreset = {
  id: string;
  label: string;
  focusMinutes: number;
  breakMinutes: number;
};

export type FocusSession = {
  id: string;
  taskId?: string;
  subject: string;
  startedAt: string;
  completedAt?: string;
  focusMinutes: number;
  breakMinutes: number;
  status: SessionStatus;
};

export type StudyTask = {
  id: string;
  title: string;
  subject: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
};

export type FocusRoom = {
  id: string;
  name: string;
  vibe: string;
  occupancy: number;
  syncedPresetId: string;
};

export type PresenceUser = {
  id: string;
  name: string;
  avatar: string;
  status: "studying" | "break" | "done";
};

export type DashboardSnapshot = {
  currentPhase: FocusPhase;
  activePreset: TimerPreset;
  todayFocusMinutes: number;
  weeklyFocusMinutes: number[];
  currentStreak: number;
  longestStreak: number;
  liveUsers: number;
  focusScore: number;
  tasks: StudyTask[];
  rooms: FocusRoom[];
  presence: PresenceUser[];
  recentSessions: FocusSession[];
};

export type TimerRuntimeState = {
  phase: FocusPhase;
  activeSegment: "focus" | "break";
  preset: TimerPreset;
  secondsRemaining: number;
  previousPhase?: "focus" | "break";
  completedFocusMinutes: number;
  startedAt?: string;
  taskId?: string;
};

export type SubjectSummary = {
  subject: string;
  sessions: number;
  totalMinutes: number;
};

export const timerPresets: TimerPreset[] = [
  { id: "classic", label: "Classic Sprint", focusMinutes: 25, breakMinutes: 5 },
  { id: "deep", label: "Deep Work", focusMinutes: 50, breakMinutes: 10 },
  { id: "reset", label: "Quick Reset", focusMinutes: 15, breakMinutes: 5 },
];

export const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const createMockDashboardSnapshot = (): DashboardSnapshot => ({
  currentPhase: "focus",
  activePreset: timerPresets[1],
  todayFocusMinutes: 145,
  weeklyFocusMinutes: [90, 120, 60, 140, 110, 160, 145],
  currentStreak: 6,
  longestStreak: 14,
  liveUsers: 184,
  focusScore: 87,
  tasks: [
    {
      id: "task-1",
      title: "Revise operating systems notes",
      subject: "Systems",
      estimatedPomodoros: 4,
      completedPomodoros: 3,
    },
    {
      id: "task-2",
      title: "Practice calculus problem set",
      subject: "Math",
      estimatedPomodoros: 3,
      completedPomodoros: 1,
    },
    {
      id: "task-3",
      title: "Flashcards for networking quiz",
      subject: "Networks",
      estimatedPomodoros: 2,
      completedPomodoros: 2,
    },
  ],
  rooms: [
    {
      id: "room-1",
      name: "Silent Library",
      vibe: "Rain, soft keys, deep work",
      occupancy: 46,
      syncedPresetId: "deep",
    },
    {
      id: "room-2",
      name: "Exam Sprint",
      vibe: "Fast cycles, high energy",
      occupancy: 29,
      syncedPresetId: "classic",
    },
    {
      id: "room-3",
      name: "Night Owl",
      vibe: "Late-night calm and lo-fi",
      occupancy: 18,
      syncedPresetId: "reset",
    },
  ],
  presence: [
    { id: "user-1", name: "Maya", avatar: "MA", status: "studying" },
    { id: "user-2", name: "Alex", avatar: "AL", status: "studying" },
    { id: "user-3", name: "Noor", avatar: "NO", status: "break" },
    { id: "user-4", name: "Sam", avatar: "SA", status: "done" },
  ],
  recentSessions: [
    {
      id: "session-1",
      taskId: "task-1",
      subject: "Systems",
      startedAt: "2026-03-29T08:00:00.000Z",
      completedAt: "2026-03-29T08:50:00.000Z",
      focusMinutes: 50,
      breakMinutes: 10,
      status: "completed",
    },
    {
      id: "session-2",
      taskId: "task-2",
      subject: "Math",
      startedAt: "2026-03-29T06:30:00.000Z",
      completedAt: "2026-03-29T06:55:00.000Z",
      focusMinutes: 25,
      breakMinutes: 5,
      status: "completed",
    },
    {
      id: "session-3",
      taskId: "task-1",
      subject: "Systems",
      startedAt: "2026-03-28T12:10:00.000Z",
      completedAt: "2026-03-28T12:35:00.000Z",
      focusMinutes: 25,
      breakMinutes: 5,
      status: "completed",
    },
    {
      id: "session-4",
      taskId: "task-3",
      subject: "Networks",
      startedAt: "2026-03-27T19:40:00.000Z",
      completedAt: "2026-03-27T20:05:00.000Z",
      focusMinutes: 25,
      breakMinutes: 5,
      status: "completed",
    },
  ],
});

export const getWeeklyAverage = (minutes: number[]) =>
  Math.round(minutes.reduce((total, value) => total + value, 0) / Math.max(minutes.length, 1));

export const getWeeklyPeak = (minutes: number[]) => Math.max(...minutes, 1);

export const getProgressRatio = (task: StudyTask) =>
  Math.min(task.completedPomodoros / Math.max(task.estimatedPomodoros, 1), 1);

export const formatFocusMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export const formatTimerLabel = (minutes: number) => `${minutes.toString().padStart(2, "0")}:00`;

export const formatSecondsClock = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
};

export const createTimerRuntime = (preset: TimerPreset): TimerRuntimeState => ({
  phase: "idle",
  activeSegment: "focus",
  preset,
  secondsRemaining: preset.focusMinutes * 60,
  completedFocusMinutes: 0,
});

export const updateTimerPreset = (state: TimerRuntimeState, preset: TimerPreset): TimerRuntimeState => ({
  ...createTimerRuntime(preset),
  taskId: state.taskId,
});

export const assignTaskToTimer = (state: TimerRuntimeState, taskId?: string): TimerRuntimeState => ({
  ...state,
  taskId,
});

export const pauseTimer = (state: TimerRuntimeState): TimerRuntimeState => {
  if (state.phase === "completed" || state.phase === "paused" || state.phase === "idle") {
    return state;
  }

  return {
    ...state,
    phase: "paused",
    previousPhase: state.activeSegment,
  };
};

export const resumeTimer = (state: TimerRuntimeState): TimerRuntimeState => {
  if (state.phase === "idle") {
    return {
      ...state,
      phase: "focus",
      startedAt: state.startedAt ?? new Date().toISOString(),
    };
  }

  if (state.phase !== "paused") {
    return state;
  }

  return {
    ...state,
    phase: state.previousPhase ?? state.activeSegment,
    previousPhase: undefined,
  };
};

export const tickTimer = (state: TimerRuntimeState): TimerRuntimeState => {
  if (state.phase === "idle" || state.phase === "paused" || state.phase === "completed") {
    return state;
  }

  if (state.secondsRemaining > 1) {
    return {
      ...state,
      secondsRemaining: state.secondsRemaining - 1,
    };
  }

  if (state.activeSegment === "focus") {
    return {
      ...state,
      phase: "break",
      activeSegment: "break",
      secondsRemaining: state.preset.breakMinutes * 60,
      completedFocusMinutes: state.completedFocusMinutes + state.preset.focusMinutes,
    };
  }

  return {
    ...state,
    phase: "completed",
    activeSegment: "break",
    secondsRemaining: 0,
  };
};

export const resetTimer = (preset: TimerPreset, taskId?: string): TimerRuntimeState => ({
  ...createTimerRuntime(preset),
  taskId,
});

export const serializeTimerRuntime = (state: TimerRuntimeState) => JSON.stringify(state);

export const parseTimerRuntime = (
  value: string | null | undefined,
  presets: TimerPreset[] = timerPresets,
): TimerRuntimeState | null => {
  if (!value) {
    return null;
  }

  try {
    const raw = JSON.parse(value) as Partial<TimerRuntimeState> & { preset?: Partial<TimerPreset> };
    const preset = presets.find((item) => item.id === raw.preset?.id);

    if (!preset || typeof raw.secondsRemaining !== "number" || !raw.phase || !raw.activeSegment) {
      return null;
    }

    return {
      phase: raw.phase,
      activeSegment: raw.activeSegment,
      preset,
      secondsRemaining: raw.secondsRemaining,
      previousPhase: raw.previousPhase,
      completedFocusMinutes: raw.completedFocusMinutes ?? 0,
      startedAt: raw.startedAt,
      taskId: raw.taskId,
    };
  } catch {
    return null;
  }
};

export const createCompletedSession = (
  state: TimerRuntimeState,
  tasks: StudyTask[],
): FocusSession | null => {
  if (state.phase !== "completed") {
    return null;
  }

  const linkedTask = tasks.find((task) => task.id === state.taskId);

  return {
    id: `session-${Date.now()}`,
    taskId: state.taskId,
    subject: linkedTask?.subject ?? "General",
    startedAt: state.startedAt ?? new Date().toISOString(),
    completedAt: new Date().toISOString(),
    focusMinutes: state.preset.focusMinutes,
    breakMinutes: state.preset.breakMinutes,
    status: "completed",
  };
};

export const applyCompletedSessionToTasks = (tasks: StudyTask[], session: FocusSession) =>
  tasks.map((task) =>
    task.id === session.taskId
      ? {
          ...task,
          completedPomodoros: Math.min(task.completedPomodoros + 1, task.estimatedPomodoros),
        }
      : task,
  );

export const getSubjectSummary = (sessions: FocusSession[]): SubjectSummary[] => {
  const map = new Map<string, SubjectSummary>();

  sessions.forEach((session) => {
    const current = map.get(session.subject) ?? {
      subject: session.subject,
      sessions: 0,
      totalMinutes: 0,
    };

    current.sessions += 1;
    current.totalMinutes += session.focusMinutes;
    map.set(session.subject, current);
  });

  return [...map.values()].sort((left, right) => right.totalMinutes - left.totalMinutes);
};

const formatterForTimezone = (timezone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export const getSessionDayKey = (isoDate: string, timezone: string) =>
  formatterForTimezone(timezone).format(new Date(isoDate));

export const calculateStreaks = (sessions: FocusSession[], timezone: string) => {
  const uniqueDays = [...new Set(sessions.map((session) => getSessionDayKey(session.startedAt, timezone)))]
    .sort()
    .reverse();

  let currentStreak = 0;
  let longestStreak = 0;
  let previousDay: Date | null = null;
  const todayKey = getSessionDayKey(new Date().toISOString(), timezone);

  uniqueDays.forEach((dayKey, index) => {
    const currentDay = new Date(`${dayKey}T00:00:00`);

    if (index === 0) {
      longestStreak = 1;
      if (dayKey === todayKey) {
        currentStreak = 1;
      }
      previousDay = currentDay;
      return;
    }

    if (!previousDay) {
      return;
    }

    const difference = Math.round((previousDay.getTime() - currentDay.getTime()) / 86_400_000);

    if (difference === 1) {
      longestStreak += 1;
      if (currentStreak === index) {
        currentStreak += 1;
      }
    } else {
      longestStreak = Math.max(longestStreak, 1);
      if (currentStreak !== 0 && currentStreak !== index) {
        currentStreak = Math.max(currentStreak, 1);
      }
    }

    previousDay = currentDay;
  });

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak, uniqueDays.length > 0 ? 1 : 0),
  };
};

export const calculateTodayFocusMinutes = (sessions: FocusSession[], timezone: string) => {
  const todayKey = getSessionDayKey(new Date().toISOString(), timezone);

  return sessions
    .filter((session) => getSessionDayKey(session.startedAt, timezone) === todayKey)
    .reduce((total, session) => total + session.focusMinutes, 0);
};

export const calculateWeeklyFocusMinutes = (sessions: FocusSession[], timezone: string) => {
  const now = new Date();
  const labels = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - index));
    return getSessionDayKey(day.toISOString(), timezone);
  });

  return labels.map((dayKey) =>
    sessions
      .filter((session) => getSessionDayKey(session.startedAt, timezone) === dayKey)
      .reduce((total, session) => total + session.focusMinutes, 0),
  );
};
