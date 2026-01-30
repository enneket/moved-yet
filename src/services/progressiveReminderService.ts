import * as vscode from 'vscode';
import { getTexts, getConfig } from './configService';

/**
 * 渐进式提醒服务
 * 实现三级提醒机制：状态栏 → 通知 → 全屏
 */
export class ProgressiveReminderService {
    private statusBarItem: vscode.StatusBarItem | null = null;
    private progressiveTimer: NodeJS.Timeout | null = null;
    private currentLevel: number = 0;
    private reminderType: 'sit' | 'drink' | null = null;
    private onFullScreenCallback: (() => void) | null = null;

    /**
     * 开始渐进式提醒
     * @param type 提醒类型
     * @param onFullScreen 全屏提醒回调
     */
    startProgressiveReminder(type: 'sit' | 'drink', onFullScreen: () => void): void {
        this.reminderType = type;
        this.onFullScreenCallback = onFullScreen;
        this.currentLevel = 1;

        const config = getConfig();
        const level1Duration = config.progressiveReminderLevel1Duration * 60 * 1000; // 转换为毫秒
        const level2Duration = config.progressiveReminderLevel2Duration * 60 * 1000;

        // 第一级：状态栏提醒
        this.showStatusBarReminder();

        // 配置的时间后升级到第二级
        this.progressiveTimer = setTimeout(() => {
            if (this.currentLevel === 1) {
                this.currentLevel = 2;
                this.showNotificationReminder();

                // 再经过配置的时间后升级到第三级
                this.progressiveTimer = setTimeout(() => {
                    if (this.currentLevel === 2) {
                        this.currentLevel = 3;
                        this.showFullScreenReminder();
                    }
                }, level2Duration);
            }
        }, level1Duration);
    }

    /**
     * 第一级：状态栏温和提示
     */
    private showStatusBarReminder(): void {
        const texts = getTexts();
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

        const icon = this.reminderType === 'sit' ? '🚶‍♂️' : '💧';
        const message = this.reminderType === 'sit' ? texts.sitStatus : texts.drinkStatus;

        this.statusBarItem.text = `$(alert) ${icon} ${texts.gentleReminder}`;
        this.statusBarItem.tooltip = message;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        this.statusBarItem.command = 'movedYet.confirmFromStatusBar';
        this.statusBarItem.show();
    }

    /**
     * 第二级：通知消息
     */
    private showNotificationReminder(): void {
        const texts = getTexts();
        const message = this.reminderType === 'sit' ? texts.sitReminderMessage : texts.drinkReminderMessage;
        const title = this.reminderType === 'sit' ? texts.sitReminderTitle : texts.drinkReminderTitle;

        vscode.window
            .showWarningMessage(`${title}\n${message}`, texts.confirmMessage, texts.snoozeButton)
            .then(selection => {
                if (selection === texts.confirmMessage) {
                    this.stopProgressiveReminder();
                    // 触发确认回调
                    vscode.commands.executeCommand('movedYet.confirmReminder', this.reminderType);
                } else if (selection === texts.snoozeButton) {
                    this.snoozeReminder();
                }
            });
    }

    /**
     * 第三级：全屏强制提醒
     */
    private showFullScreenReminder(): void {
        this.stopProgressiveReminder();
        if (this.onFullScreenCallback) {
            this.onFullScreenCallback();
        }
    }

    /**
     * 稍后提醒（5分钟）
     */
    private snoozeReminder(): void {
        this.stopProgressiveReminder();

        const config = getConfig();
        const snoozeTime = config.progressiveReminderLevel1Duration * 60 * 1000; // 使用第一级的时间作为稍后提醒时间

        // 稍后提醒后重新开始渐进式提醒
        setTimeout(() => {
            if (this.reminderType && this.onFullScreenCallback) {
                this.startProgressiveReminder(this.reminderType, this.onFullScreenCallback);
            }
        }, snoozeTime);

        const texts = getTexts();
        vscode.window.showInformationMessage(`${texts.snoozeButton} ✓`);
    }

    /**
     * 停止渐进式提醒
     */
    stopProgressiveReminder(): void {
        if (this.progressiveTimer) {
            clearTimeout(this.progressiveTimer);
            this.progressiveTimer = null;
        }

        if (this.statusBarItem) {
            this.statusBarItem.dispose();
            this.statusBarItem = null;
        }

        this.currentLevel = 0;
        this.reminderType = null;
        this.onFullScreenCallback = null;
    }

    /**
     * 获取当前提醒级别
     */
    getCurrentLevel(): number {
        return this.currentLevel;
    }
}

let progressiveReminderServiceInstance: ProgressiveReminderService | null = null;

export function initProgressiveReminderService(): void {
    progressiveReminderServiceInstance = new ProgressiveReminderService();
}

export function getProgressiveReminderService(): ProgressiveReminderService {
    if (!progressiveReminderServiceInstance) {
        throw new Error('ProgressiveReminderService not initialized');
    }
    return progressiveReminderServiceInstance;
}
