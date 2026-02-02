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
    private isActive: boolean = false; // 添加活跃状态标记
    private notificationPromise: Thenable<string | undefined> | null = null; // 跟踪通知状态

    /**
     * 开始渐进式提醒
     * @param type 提醒类型
     * @param onFullScreen 全屏提醒回调
     */
    startProgressiveReminder(type: 'sit' | 'drink', onFullScreen: () => void): void {
        // 如果已经有活跃的提醒，先停止它
        if (this.isActive) {
            console.log('停止现有的渐进式提醒，开始新的提醒');
            this.stopProgressiveReminder();
        }

        this.reminderType = type;
        this.onFullScreenCallback = onFullScreen;
        this.currentLevel = 1;
        this.isActive = true;

        const config = getConfig();
        const level1Duration = config.progressiveReminderLevel1Duration * 60 * 1000; // 转换为毫秒
        const level2Duration = config.progressiveReminderLevel2Duration * 60 * 1000;

        console.log(`开始渐进式提醒: ${type}, 第1级持续${config.progressiveReminderLevel1Duration}分钟`);

        // 第一级：状态栏提醒
        this.showStatusBarReminder();

        // 配置的时间后升级到第二级
        this.progressiveTimer = setTimeout(() => {
            if (this.currentLevel === 1 && this.isActive) {
                console.log(`升级到第2级提醒: ${type}`);
                this.currentLevel = 2;
                this.showNotificationReminder();

                // 再经过配置的时间后升级到第三级
                this.progressiveTimer = setTimeout(() => {
                    if (this.currentLevel === 2 && this.isActive) {
                        console.log(`升级到第3级提醒: ${type}`);
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
        if (!this.isActive) {
            return;
        }

        const texts = getTexts();
        const message = this.reminderType === 'sit' ? texts.sitReminderMessage : texts.drinkReminderMessage;
        const title = this.reminderType === 'sit' ? texts.sitReminderTitle : texts.drinkReminderTitle;

        // 使用信息提示而不是警告提示，避免无法清除的问题
        console.log(`显示第2级通知: ${title}`);
        this.notificationPromise = vscode.window
            .showInformationMessage(`${title}\n${message}`, texts.confirmMessage, texts.snoozeButton);
        
        this.notificationPromise.then(selection => {
            // 清理通知引用
            this.notificationPromise = null;
            
            if (!this.isActive) {
                console.log('提醒已停止，忽略通知回调');
                return;
            }

            if (selection === texts.confirmMessage) {
                console.log('用户确认提醒');
                this.stopProgressiveReminder();
                // 触发确认回调
                vscode.commands.executeCommand('movedYet.confirmReminder', this.reminderType);
            } else if (selection === texts.snoozeButton) {
                console.log('用户选择稍后提醒');
                this.snoozeReminder();
            } else {
                console.log('用户关闭了通知，但没有选择操作');
                // 用户直接关闭通知，继续等待升级到第三级
            }
        }, error => {
            console.error('通知处理错误:', error);
            this.notificationPromise = null;
        });
    }

    /**
     * 第三级：全屏强制提醒
     */
    private showFullScreenReminder(): void {
        if (!this.isActive) {
            return;
        }
        
        console.log('显示第3级全屏提醒');
        this.stopProgressiveReminder();
        if (this.onFullScreenCallback) {
            this.onFullScreenCallback();
        }
    }

    /**
     * 稍后提醒（5分钟）
     */
    private snoozeReminder(): void {
        console.log('稍后提醒被触发');
        this.stopProgressiveReminder();

        const config = getConfig();
        const snoozeTime = config.progressiveReminderLevel1Duration * 60 * 1000; // 使用第一级的时间作为稍后提醒时间

        // 稍后提醒后重新开始渐进式提醒
        setTimeout(() => {
            if (this.reminderType && this.onFullScreenCallback) {
                console.log(`稍后提醒时间到，重新开始渐进式提醒: ${this.reminderType}`);
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
        console.log('停止渐进式提醒');
        
        this.isActive = false;

        if (this.progressiveTimer) {
            clearTimeout(this.progressiveTimer);
            this.progressiveTimer = null;
        }

        if (this.statusBarItem) {
            this.statusBarItem.dispose();
            this.statusBarItem = null;
        }

        // 清理通知引用（注意：无法直接取消VS Code的通知）
        this.notificationPromise = null;

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

    /**
     * 检查是否有活跃的提醒
     */
    isReminderActive(): boolean {
        return this.isActive;
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
