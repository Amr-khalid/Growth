/**
 * i18n Translation Dictionary — Arabic (ar) & English (en)
 */

export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // Navigation / Tabs
    tabDashboard: 'الرئيسية',
    tabHabits: 'العادات',
    tabTasks: 'المهام',
    tabCalendar: 'التقويم',
    tabAnalytics: 'التحليلات',

    // Language Toggle
    currentLanguageLabel: 'العربية',
    switchLanguage: 'English',

    // Dashboard
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء النور',
    tasksDone: 'مهام مكتملة',
    habitsDone: 'عادات مكتملة',
    dailyMissions: 'المهمة اليومية 🚀',
    habitsToday: 'عادات اليوم ⚡',
    lifeOverview: 'نظرة عامة 🎯',
    noMissionsToday: 'لا توجد مهام يومية محددة لليوم',
    noHabitsToday: 'لا توجد عادات محددة لليوم',
    addMission: 'إضافة مهمة',

    // Streak & Grace Widget
    currentStreak: 'الاستريك الحالي',
    longestStreak: 'أعلى استريك',
    graceDaysTitle: 'أيام المهلة (Grace Days)',
    graceDaysRemaining: 'متبقية',
    graceShield: 'مهلة',
    daysUnit: 'أيام',
    dayUnit: 'يوم',
    inGraceNotice: 'أنت الآن في يوم المهلة رقم {day}. أنجز أي نشاط اليوم قبل أن يتصفر الاستريك!',
    streakResetNotice: 'تم تصفير الاستريك لتجاوز المهلة (3 أيام بدون نشاط). ابدأ سلسلة جديدة اليوم! 🚀',
    streakSuccessNotice: 'ممتاز! حافظت على نشاطك اليوم ورصيد المهلة 3/3 مكتمل 🛡️✨',

    // Calendar
    calendarTitle: 'التقويم ومتابعة النشاط 📅',
    calendarSubtitle: 'تتبع نشاطك اليومي وحافظ على سلسلة الاستريك بدون انقطاع',
    todayButton: 'اليوم',
    activeDayLegend: 'يوم نشط (🟢)',
    graceDayLegend: 'يوم مهلة (🛡️)',
    inactiveDayLegend: 'بدون نشاط (⚪)',
    dayDetailTitle: 'تفاصيل نشاط يوم {date}',
    completedHabits: 'العادات المكتملة ⚡',
    completedTasks: 'المهام المنجزة ✅',
    noActivityOnDate: 'لم يتم تسجيل أنشطة مكتملة في هذا اليوم.',
    graceProtectedNotice: '🛡️ هذا اليوم محمي تحت مهلة الـ 3 أيام للاستريك!',

    // Grace Rules Info Card
    graceRulesTitle: 'كيف يعمل نظام المهلة (3 أيام)؟',
    graceRule1: 'أيام المهلة (🛡️ 3/3): يمنحك النظام 3 أيام مهلة مرنة. إذا توقفت يوم أو يومين أو 3 أيام متتالية، يحمي النظام الاستريك الخاص بك.',
    graceRule2: 'التصفير عند التجاوز: إذا مضت 4 أيام متتالية دون إنجاز أي عادة أو مهمة، يتم تصفير الاستريك لإعادة التحفيز من جديد.',
    graceRule3: 'استعادة المهلة: إنجاز نشاط في أي يوم نشط يعيد تجديد رصيد المهلة كاملاً (3/3 أيام).',

    // Days of Week
    sun: 'الأحد',
    mon: 'الإثنين',
    tue: 'الثلاثاء',
    wed: 'الأربعاء',
    thu: 'الخميس',
    fri: 'الجمعة',
    sat: 'السبت',

    // Categories
    catWork: 'العمل والتطوير',
    catHealth: 'الصحة والرياضة',
    catRelationships: 'العلاقات',
    catFinance: 'المال والاستثمار',
  },
  en: {
    // Navigation / Tabs
    tabDashboard: 'Dashboard',
    tabHabits: 'Habits',
    tabTasks: 'Tasks',
    tabCalendar: 'Calendar',
    tabAnalytics: 'Analytics',

    // Language Toggle
    currentLanguageLabel: 'English',
    switchLanguage: 'العربية',

    // Dashboard
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    tasksDone: 'Tasks Done',
    habitsDone: 'Habits Done',
    dailyMissions: 'Daily Mission 🚀',
    habitsToday: 'Habits Today ⚡',
    lifeOverview: 'Life Overview 🎯',
    noMissionsToday: 'No daily missions set for today',
    noHabitsToday: 'No habits scheduled for today',
    addMission: 'Add Mission',

    // Streak & Grace Widget
    currentStreak: 'Current Streak',
    longestStreak: 'Longest Streak',
    graceDaysTitle: 'Grace Days Allowance',
    graceDaysRemaining: 'remaining',
    graceShield: 'Grace',
    daysUnit: 'Days',
    dayUnit: 'Day',
    inGraceNotice: 'You are on Grace Day {day}. Complete an activity today before your streak resets!',
    streakResetNotice: 'Streak reset after exceeding 3 grace days of inactivity. Start a new streak today! 🚀',
    streakSuccessNotice: 'Awesome! Active today & full 3/3 grace allowance intact 🛡️✨',

    // Calendar
    calendarTitle: 'Activity & Streak Calendar 📅',
    calendarSubtitle: 'Track your daily progress & keep your streak alive without interruption',
    todayButton: 'Today',
    activeDayLegend: 'Active Day (🟢)',
    graceDayLegend: 'Grace Day (🛡️)',
    inactiveDayLegend: 'Inactive Day (⚪)',
    dayDetailTitle: 'Activity Details for {date}',
    completedHabits: 'Completed Habits ⚡',
    completedTasks: 'Completed Tasks ✅',
    noActivityOnDate: 'No completed activities recorded on this date.',
    graceProtectedNotice: '🛡️ This day is protected under your 3-day grace period!',

    // Grace Rules Info Card
    graceRulesTitle: 'How does the 3-Day Grace Period work?',
    graceRule1: 'Grace Allowance (🛡️ 3/3): You receive a flexible 3-day buffer. If you pause for 1, 2, or 3 consecutive days, your streak remains safe.',
    graceRule2: 'Reset Trigger: If 4 consecutive days pass without activity, your streak resets to 0 to spark a fresh start.',
    graceRule3: 'Grace Refill: Completing any activity on an active day fully refills your grace allowance back to 3/3 days.',

    // Days of Week
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',

    // Categories
    catWork: 'Work & Growth',
    catHealth: 'Health & Fitness',
    catRelationships: 'Relationships',
    catFinance: 'Finance & Money',
  },
} as const;

export type TranslationKey = keyof typeof translations.ar;
 // Dictionary sync
