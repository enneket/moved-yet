import * as vscode from 'vscode';
import { ReminderRecord, DailyStats, HistoryData } from '../models/types';

const HISTORY_KEY = 'movedYet.history';

/**
 * 历史记录服务
 * 负责记录和管理用户的健康提醒历史数据
 */
export class HistoryService {
    private context: vscode.ExtensionContext;
    private sessionStartTime: number;
    private lastActiveTime: number;
    private isWorkTimerActive: boolean;
    private inactivityThreshold: number = 10 * 60 * 1000; // 10分钟无活动阈值

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.sessionStartTime = Date.now();
        this.lastActiveTime = Date.now();
        this.isWorkTimerActive = true;
    }

    /**
     * 获取今天的日期字符串 YYYY-MM-DD
     */
    private getTodayDate(): string {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    /**
     * 获取历史数据
     */
    getHistory(): HistoryData {
        try {
            const history = this.context.globalState.get<HistoryData>(HISTORY_KEY);
            if (!history) {
                return {
                    dailyStats: {},
                    totalSitReminders: 0,
                    totalDrinkReminders: 0,
                    totalWorkTime: 0,
                };
            }
            return history;
        } catch (error) {
            console.error('获取历史数据失败:', error);
            // 返回默认数据，确保功能不中断
            return {
                dailyStats: {},
                totalSitReminders: 0,
                totalDrinkReminders: 0,
                totalWorkTime: 0,
            };
        }
    }

    /**
     * 保存历史数据
     */
    private async saveHistory(history: HistoryData): Promise<void> {
        try {
            await this.context.globalState.update(HISTORY_KEY, history);
        } catch (error) {
            console.error('保存历史数据失败:', error);
            // 即使保存失败，也不应该影响主要功能
        }
    }

    /**
     * 记录提醒
     */
    async recordReminder(type: 'sit' | 'drink', confirmed: boolean, snoozed: boolean = false): Promise<void> {
        try {
            const history = this.getHistory();
            const today = this.getTodayDate();

            // 创建提醒记录
            const record: ReminderRecord = {
                id: `${type}-${Date.now()}`,
                type,
                timestamp: Date.now(),
                confirmed,
                snoozed,
            };

            // 获取或创建今日统计
            if (!history.dailyStats[today]) {
                history.dailyStats[today] = {
                    date: today,
                    sitCount: 0,
                    drinkCount: 0,
                    workTimeMinutes: 0,
                    records: [],
                };
            }

            const dailyStats = history.dailyStats[today];
            dailyStats.records.push(record);

            // 更新计数
            if (confirmed) {
                if (type === 'sit') {
                    dailyStats.sitCount++;
                    history.totalSitReminders++;
                } else {
                    dailyStats.drinkCount++;
                    history.totalDrinkReminders++;
                }
            }

            await this.saveHistory(history);
        } catch (error) {
            console.error('记录提醒失败:', error);
            // 记录失败不应该影响主要功能
        }
    }

    /**
     * 记录用户活动（由活动检测服务调用）
     */
    recordActivity(): void {
        const now = Date.now();
        const wasInactive = !this.isWorkTimerActive;
        
        // 如果之前处于非活跃状态，现在恢复活跃
        if (wasInactive) {
            console.log(`工作计时恢复 - 非活跃时长: ${Math.round((now - this.lastActiveTime) / 60000)} 分钟`);
            this.sessionStartTime = now; // 重新开始计时
            this.isWorkTimerActive = true;
        }
        
        this.lastActiveTime = now;
    }

    /**
     * 检查并处理非活跃状态
     */
    private checkInactivity(): void {
        const now = Date.now();
        const inactiveTime = now - this.lastActiveTime;
        
        // 如果超过10分钟无活动且当前还在计时
        if (inactiveTime > this.inactivityThreshold && this.isWorkTimerActive) {
            console.log(`检测到10分钟无活动，暂停工作计时`);
            // 先保存到无活动开始前的工作时长
            this.updateWorkTimeInternal(this.lastActiveTime);
            this.isWorkTimerActive = false;
        }
    }

    /**
     * 内部工作时长更新方法
     */
    private async updateWorkTimeInternal(endTime?: number): Promise<void> {
        try {
            const history = this.getHistory();
            const today = this.getTodayDate();

            if (!history.dailyStats[today]) {
                history.dailyStats[today] = {
                    date: today,
                    sitCount: 0,
                    drinkCount: 0,
                    workTimeMinutes: 0,
                    records: [],
                };
            }

            // 计算实际工作时长
            const actualEndTime = endTime || Date.now();
            const sessionMinutes = Math.floor((actualEndTime - this.sessionStartTime) / 1000 / 60);
            
            // 只有在计时器活跃状态下才累加时间
            if (this.isWorkTimerActive && sessionMinutes > 0) {
                history.dailyStats[today].workTimeMinutes += sessionMinutes;
                history.totalWorkTime += sessionMinutes;
                console.log(`累加工作时长: ${sessionMinutes} 分钟`);
            }

            // 重置会话开始时间
            this.sessionStartTime = actualEndTime;

            await this.saveHistory(history);
        } catch (error) {
            console.error('更新工作时长失败:', error);
            // 重置会话开始时间，避免下次计算错误
            this.sessionStartTime = Date.now();
        }
    }

    /**
     * 更新工作时长（公共方法）
     */
    async updateWorkTime(): Promise<void> {
        // 先检查非活跃状态
        this.checkInactivity();
        
        // 然后更新工作时长
        await this.updateWorkTimeInternal();
    }

    /**
     * 获取当前工作状态信息
     */
    getWorkStatus(): {
        isActive: boolean;
        currentSessionMinutes: number;
        inactiveMinutes: number;
        totalTodayMinutes: number;
    } {
        const now = Date.now();
        const todayStats = this.getTodayStats();
        const inactiveTime = now - this.lastActiveTime;
        const currentSessionTime = this.isWorkTimerActive ? (now - this.sessionStartTime) : 0;
        
        return {
            isActive: this.isWorkTimerActive,
            currentSessionMinutes: Math.floor(currentSessionTime / 60000),
            inactiveMinutes: Math.floor(inactiveTime / 60000),
            totalTodayMinutes: todayStats?.workTimeMinutes || 0
        };
    }

    /**
     * 手动暂停工作计时
     */
    async pauseWorkTimer(): Promise<void> {
        if (this.isWorkTimerActive) {
            await this.updateWorkTimeInternal();
            this.isWorkTimerActive = false;
            console.log('手动暂停工作计时');
        }
    }

    /**
     * 手动恢复工作计时
     */
    resumeWorkTimer(): void {
        if (!this.isWorkTimerActive) {
            this.sessionStartTime = Date.now();
            this.lastActiveTime = Date.now();
            this.isWorkTimerActive = true;
            console.log('手动恢复工作计时');
        }
    }

    /**
     * 获取今日统计
     */
    getTodayStats(): DailyStats | null {
        const history = this.getHistory();
        const today = this.getTodayDate();
        return history.dailyStats[today] || null;
    }

    /**
     * 获取本周统计
     */
    getWeekStats(): { sitCount: number; drinkCount: number; workTimeMinutes: number } {
        const history = this.getHistory();
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let sitCount = 0;
        let drinkCount = 0;
        let workTimeMinutes = 0;

        Object.values(history.dailyStats).forEach(stats => {
            const statsDate = new Date(stats.date);
            if (statsDate >= weekAgo && statsDate <= now) {
                sitCount += stats.sitCount;
                drinkCount += stats.drinkCount;
                workTimeMinutes += stats.workTimeMinutes;
            }
        });

        return { sitCount, drinkCount, workTimeMinutes };
    }

    /**
     * 清除历史数据
     */
    async clearHistory(): Promise<void> {
        await this.context.globalState.update(HISTORY_KEY, undefined);
    }

    /**
     * 获取最近N天的统计数据
     */
    getRecentStats(days: number): DailyStats[] {
        const history = this.getHistory();
        const now = new Date();
        const stats: DailyStats[] = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const dailyStats = history.dailyStats[dateStr];

            if (dailyStats) {
                stats.push(dailyStats);
            } else {
                stats.push({
                    date: dateStr,
                    sitCount: 0,
                    drinkCount: 0,
                    workTimeMinutes: 0,
                    records: [],
                });
            }
        }

        return stats.reverse();
    }
}

let historyServiceInstance: HistoryService | null = null;

export function initHistoryService(context: vscode.ExtensionContext): void {
    historyServiceInstance = new HistoryService(context);
}

export function getHistoryService(): HistoryService {
    if (!historyServiceInstance) {
        throw new Error('HistoryService not initialized');
    }
    return historyServiceInstance;
}
