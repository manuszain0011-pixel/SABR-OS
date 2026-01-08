// ==================== CORE TYPES ====================
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

// Prayer status is intentionally explicit so scoring & analytics stay consistent.
export type PrayerStatus = 'none' | 'jamaah' | 'on_time' | 'late' | 'missed' | 'qada';
export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'tahajjud' | 'duha' | 'witr';
export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
export type AreaType = 'personal' | 'professional' | 'financial' | 'spiritual' | 'health' | 'relationships' | 'learning' | 'creative';
export type ViewType = 'list' | 'kanban' | 'calendar' | 'table' | 'gallery';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';

export interface PrayerTime {
  name: string;
  time: string;
  displayName: string;
  isCustom?: boolean;
}

// ==================== PROFILE & AREAS ====================
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  prayerCity: string;
  prayerCountry: string;
  /** Optional coords for higher accuracy (small towns/villages + correct timezone). */
  prayerLatitude?: number;
  /** Optional coords for higher accuracy (small towns/villages + correct timezone). */
  prayerLongitude?: number;
  /** 0 = Standard (Shafi/Maliki/Hanbali), 1 = Hanafi (later Asr) - Default is Hanafi */
  prayerAsrMethod: 0 | 1;
  /** Custom prayer times set by user to match local mosque (overrides API times) */
  customPrayerTimes: {
    fajr?: string;
    dhuhr?: string;
    asr?: string;
    maghrib?: string;
    isha?: string;
  };
  currency: string;
  weekStartsOn: 0 | 1 | 6;
  defaultView: ViewType;
}

export interface Area {
  id: string;
  name: string;
  type: AreaType;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  goals: string[];
  projects: string[];
}

// ==================== GOALS ====================
export interface Goal {
  id: string;
  title: string;
  description: string;
  areaId?: string;
  type: 'short_term' | 'medium_term' | 'long_term' | 'lifetime';
  status: Status;
  priority: Priority;
  startDate: string;
  targetDate: string;
  completedDate?: string;
  progress: number;
  milestones: Milestone[];
  linkedProjects: string[];
  linkedTasks: string[];
  tags: string[];
  notes: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  niyyah?: string;
  barakahScore?: number;
  attachedDua?: string;
  isSadaqahJariyah?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  isCompleted: boolean;
  completedDate?: string;
}

// ==================== PROJECTS ====================
export interface Project {
  id: string;
  title: string;
  description: string;
  areaId?: string;
  goalId?: string;
  status: Status;
  priority: Priority;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  progress: number;
  linkedTasks: string[];
  linkedNotes: string[];
  linkedResources: string[];
  tags: string[];
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== TASKS ====================
export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  goalId?: string;
  areaId?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  dueTime?: string;
  completedDate?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  recurrence: RecurrenceType;
  subtasks: Subtask[];
  tags: string[];
  linkedNotes: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

// ==================== IDEAS & NOTES ====================
export interface Idea {
  id: string;
  title: string;
  content: string;
  category: 'thought' | 'inspiration' | 'quote' | 'question' | 'observation';
  source?: string;
  linkedProjects: string[];
  linkedGoals: string[];
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'meeting' | 'research' | 'reflection' | 'template';
  areaId?: string;
  projectId?: string;
  linkedResources: string[];
  linkedTasks: string[];
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== RESOURCES & BOOKS ====================
export interface Resource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'podcast' | 'course' | 'tool' | 'website' | 'other';
  url?: string;
  description: string;
  areaId?: string;
  status: 'to_consume' | 'in_progress' | 'completed';
  rating?: number;
  notes: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: 'islamic' | 'self_help' | 'business' | 'fiction' | 'biography' | 'technical' | 'other';
  status: 'want_to_read' | 'reading' | 'completed' | 'abandoned';
  currentPage?: number;
  totalPages?: number;
  startDate?: string;
  completedDate?: string;
  rating?: number;
  review?: string;
  keyTakeaways: string[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'documentary' | 'lecture' | 'anime';
  status: 'want_to_watch' | 'watching' | 'completed' | 'abandoned';
  platform?: string;
  currentEpisode?: number;
  totalEpisodes?: number;
  rating?: number;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ==================== CONTACTS ====================
export interface Contact {
  id: string;
  name: string;
  type: 'personal' | 'professional' | 'family' | 'mentor' | 'other';
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  notes: string;
  lastInteraction?: string;
  interactionNotes: InteractionNote[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InteractionNote {
  id: string;
  date: string;
  type: 'call' | 'meeting' | 'email' | 'message' | 'other';
  notes: string;
}

// ==================== HABITS & JOURNAL ====================
export interface Habit {
  id: string;
  name: string;
  description?: string;
  areaId?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  unit?: string;
  color: string;
  icon: string;
  streak: number;
  longestStreak: number;
  completions: HabitCompletion[];
  isActive: boolean;
  createdAt: string;
}

export interface HabitCompletion {
  date: string;
  count: number;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: Mood;
  energyLevel: number;
  gratitude: string[];
  highlights: string[];
  challenges: string[];
  lessonsLearned: string[];
  tomorrowIntentions: string[];
  freeWriting: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ==================== REVIEWS ====================
export interface WeeklyReview {
  id: string;
  weekStart: string;
  weekEnd: string;
  accomplishments: string[];
  challenges: string[];
  lessonsLearned: string[];
  tasksCompleted: number;
  tasksPlanned: number;
  goalsProgress: { goalId: string; progress: number }[];
  prayerScore: number;
  habitScore: number;
  overallRating: number;
  nextWeekPriorities: string[];
  notes: string;
  createdAt: string;
}

export interface MonthlyReview {
  id: string;
  month: string;
  year: number;
  accomplishments: string[];
  challenges: string[];
  lessonsLearned: string[];
  goalsAchieved: string[];
  projectsCompleted: string[];
  financialSummary: {
    income: number;
    expenses: number;
    savings: number;
  };
  spiritualSummary: {
    prayerAverage: number;
    quranPages: number;
    fasts: number;
  };
  overallRating: number;
  nextMonthGoals: string[];
  notes: string;
  createdAt: string;
}

// ==================== FINANCE HUB ====================
export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  account?: string;
  paymentMethod?: string;
  isRecurring: boolean;
  recurrence?: RecurrenceType;
  tags: string[];
  attachments: string[];
  createdAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: 'monthly' | 'yearly' | 'quarterly';
  category: string;
  startDate: string;
  nextBillingDate: string;
  isActive: boolean;
  autoRenew: boolean;
  notes: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  name: string;
  type: 'loan' | 'credit_card' | 'mortgage' | 'personal' | 'other';
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: string;
  lender?: string;
  payments: DebtPayment[];
  isActive: boolean;
  createdAt: string;
}

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'emergency' | 'savings' | 'investment' | 'purchase' | 'charity' | 'hajj' | 'other';
  priority: Priority;
  linkedGoalId?: string;
  contributions: { date: string; amount: number }[];
  isCompleted: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  month: string;
  year: number;
}

// ==================== IBADAT HUB ====================
export interface PrayerRecord {
  date: string;
  fajr: PrayerEntry;
  dhuhr: PrayerEntry;
  asr: PrayerEntry;
  maghrib: PrayerEntry;
  isha: PrayerEntry;
  tahajjud?: PrayerEntry;
  duha?: PrayerEntry;
  witr?: PrayerEntry;
  notes?: string;
}

export interface PrayerEntry {
  status: PrayerStatus;
  onTime: boolean;
  khushu: number;
  spiPoints: number;
  sunnahBefore?: boolean;
  sunnahAfter?: boolean;
  notes?: string;
}

export interface QuranProgress {
  id: string;
  date: string;
  type: 'reading' | 'memorization' | 'revision' | 'tafsir';
  surahNumber: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  pagesRead?: number;
  duration?: number;
  notes?: string;
  createdAt: string;
}

export interface QuranGoal {
  id: string;
  type: 'complete_quran' | 'memorize_surah' | 'daily_pages' | 'tafsir';
  targetSurah?: number;
  targetPages?: number;
  targetDate: string;
  progress: number;
  isCompleted: boolean;
  createdAt: string;
}

export interface ZikrEntry {
  id: string;
  date: string;
  type: 'morning' | 'evening' | 'sleep' | 'custom';
  name: string;
  targetCount: number;
  target_count?: number; // added for schema compatibility
  completedCount: number;
  completed_count?: number; // added for schema compatibility
  createdAt: string;
}
export interface Dua {
  id: string;
  title: string;
  arabic?: string;
  transliteration?: string;
  translation: string;
  category: 'daily' | 'protection' | 'gratitude' | 'guidance' | 'forgiveness' | 'custom';
  source?: string;
  isFavorite: boolean;
  timesRecited: number;
  createdAt: string;
}

export interface FastingRecord {
  id: string;
  date: string;
  type: 'ramadan' | 'monday_thursday' | 'white_days' | 'ashura' | 'arafah' | 'shawwal' | 'voluntary';
  isCompleted: boolean;
  spiPoints: number;
  notes?: string;
}

// ==================== SCHEDULE ====================
export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'task' | 'meeting' | 'prayer' | 'habit' | 'event' | 'reminder';
  color: string;
  linkedTaskId?: string;
  linkedProjectId?: string;
  isRecurring: boolean;
  recurrence?: RecurrenceType;
  reminder?: number;
  createdAt: string;
}

// PrayerTime interface is defined at the top of this file

// ==================== STATISTICS ====================
export interface DailyStats {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  prayerScore: number;
  habitScore: number;
  quranPages: number;
  spiPoints: number;
  productivityScore: number;
}

export interface AreaStats {
  areaId: string;
  goalsTotal: number;
  goalsCompleted: number;
  projectsTotal: number;
  projectsCompleted: number;
  tasksTotal: number;
  tasksCompleted: number;
}
