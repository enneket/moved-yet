import * as vscode from 'vscode';

export interface TimerState {
    sitTimer: NodeJS.Timeout | null;
    drinkTimer: NodeJS.Timeout | null;
    sitStartTime: number;
    drinkStartTime: number;
    progressiveTimer: NodeJS.Timeout | null;
    progressiveLevel: number; // 0: 无提醒, 1: 状态栏, 2: 通知, 3: 全屏
}

export interface LanguageTexts {
    sitReminderTitle: string;
    sitReminderMessage: string;
    sitReminderButton: string;
    drinkReminderTitle: string;
    drinkReminderMessage: string;
    drinkReminderButton: string;
    confirmMessage: string;
    resetMessage: string;
    statusTitle: string;
    sitStatus: string;
    drinkStatus: string;
    disabled: string;
    minutesLater: string;
    comingSoon: string;
    waitSeconds: string;
    snoozeButton: string;
    gentleReminder: string;
    urgentReminder: string;
    historyTitle: string;
    todayStats: string;
    weekStats: string;
    totalSit: string;
    totalDrink: string;
    workTime: string;
    noHistory: string;
    viewHistory: string;
    viewDashboard: string;
}

export interface Config {
    sitInterval: number;
    drinkInterval: number;
    enableSit: boolean;
    enableDrink: boolean;
    language: string;
    enableProgressiveReminder: boolean;
    enableHistory: boolean;
    progressiveReminderLevel1Duration: number; // 第一级持续时间（分钟）
    progressiveReminderLevel2Duration: number; // 第二级持续时间（分钟）
}

export interface ReminderRecord {
    id: string;
    type: 'sit' | 'drink';
    timestamp: number;
    confirmed: boolean;
    snoozed: boolean;
}

export interface DailyStats {
    date: string; // YYYY-MM-DD
    sitCount: number;
    drinkCount: number;
    workTimeMinutes: number;
    records: ReminderRecord[];
}

export interface HistoryData {
    dailyStats: { [date: string]: DailyStats };
    totalSitReminders: number;
    totalDrinkReminders: number;
    totalWorkTime: number;
}
