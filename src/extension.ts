import * as vscode from 'vscode';
import { getTexts, getConfig } from './services/configService';
import { startTimers, resetAllTimers, clearAllTimers } from './services/timerService';
import { showCurrentStatus } from './services/statusService';
import { initHistoryService, getHistoryService } from './services/historyService';
import { initProgressiveReminderService } from './services/progressiveReminderService';
import { initActivityDetectionService, stopActivityDetectionService } from './services/activityDetectionService';
import { showHealthDashboard } from './ui/dashboardUI';
// 导入reminderUI以确保提醒函数被正确注册
// 这是解决循环依赖的关键步骤
import './ui/reminderUI';

/**
 * 插件激活函数
 * 当插件被VS Code激活时调用
 *
 * 实现了以下功能：
 * 1. 注册命令
 * 2. 启动健康提醒计时器
 * 3. 监听配置变化
 * 4. 初始化历史记录服务
 * 5. 初始化渐进式提醒服务
 *
 * @param context 插件上下文
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('健康提醒插件已激活');

    // 初始化服务
    initHistoryService(context);
    initProgressiveReminderService();
    initActivityDetectionService();

    // 注册重置计时器命令
    const resetCommand = vscode.commands.registerCommand('movedYet.resetTimers', () => {
        resetAllTimers();
        const texts = getTexts();
        vscode.window.showInformationMessage(texts.resetMessage);
    });

    // 注册显示状态命令
    const statusCommand = vscode.commands.registerCommand('movedYet.showStatus', () => {
        showCurrentStatus();
    });

    // 注册查看历史命令
    const historyCommand = vscode.commands.registerCommand('movedYet.showHistory', () => {
        const historyService = getHistoryService();
        const todayStats = historyService.getTodayStats();
        const weekStats = historyService.getWeekStats();
        const texts = getTexts();

        const message = `
${texts.historyTitle}

${texts.todayStats}:
  ${texts.totalSit}: ${todayStats?.sitCount || 0}
  ${texts.totalDrink}: ${todayStats?.drinkCount || 0}
  ${texts.workTime}: ${todayStats ? Math.round(todayStats.workTimeMinutes / 60 * 10) / 10 : 0} 小时

${texts.weekStats}:
  ${texts.totalSit}: ${weekStats.sitCount}
  ${texts.totalDrink}: ${weekStats.drinkCount}
  ${texts.workTime}: ${Math.round(weekStats.workTimeMinutes / 60 * 10) / 10} 小时
        `.trim();

        vscode.window.showInformationMessage(message, texts.viewDashboard).then(selection => {
            if (selection === texts.viewDashboard) {
                showHealthDashboard(context);
            }
        });
    });

    // 注册查看仪表盘命令
    const dashboardCommand = vscode.commands.registerCommand('movedYet.showDashboard', () => {
        showHealthDashboard(context);
    });

    // 注册测试活动检测命令
    const testActivityCommand = vscode.commands.registerCommand('movedYet.testActivityDetection', () => {
        const currentConfig = getConfig();
        if (!currentConfig.enableActivityDetection) {
            vscode.window.showWarningMessage('活动检测功能已禁用，请在设置中启用');
            return;
        }

        try {
            const { getActivityDetectionService } = require('./services/activityDetectionService');
            const activityService = getActivityDetectionService();
            const inactivityDuration = activityService.getInactivityDuration();
            
            vscode.window.showInformationMessage(
                `活动检测状态:\n` +
                `- 启用状态: ${activityService.isActive() ? '已启用' : '已禁用'}\n` +
                `- 无活动时长: ${inactivityDuration} 分钟\n` +
                `- 重置阈值: ${currentConfig.inactivityResetTime} 分钟`
            );
        } catch (error) {
            vscode.window.showErrorMessage('活动检测服务未正确初始化');
        }
    });

    // 注册从状态栏确认提醒命令（用于渐进式提醒）
    const confirmFromStatusBarCommand = vscode.commands.registerCommand('movedYet.confirmFromStatusBar', () => {
        // 停止渐进式提醒
        const progressiveService = require('./services/progressiveReminderService').getProgressiveReminderService();
        progressiveService.stopProgressiveReminder();
        
        // 显示确认消息
        const texts = getTexts();
        vscode.window.showInformationMessage(texts.confirmMessage);
    });

    // 注册确认提醒命令（用于渐进式提醒的通知按钮）
    const confirmReminderCommand = vscode.commands.registerCommand('movedYet.confirmReminder', (type: 'sit' | 'drink') => {
        // 停止渐进式提醒
        const progressiveService = require('./services/progressiveReminderService').getProgressiveReminderService();
        progressiveService.stopProgressiveReminder();
        
        // 重置对应的计时器
        if (type === 'sit') {
            const { resetSitTimer } = require('./services/timerService');
            resetSitTimer();
        } else {
            const { resetDrinkTimer } = require('./services/timerService');
            resetDrinkTimer();
        }
        
        // 记录历史
        try {
            getHistoryService().recordReminder(type, true);
        } catch (error) {
            console.error('Failed to record reminder:', error);
        }
        
        // 显示确认消息
        const texts = getTexts();
        vscode.window.showInformationMessage(texts.confirmMessage);
    });

    // 将命令添加到上下文订阅中，确保插件卸载时命令被正确释放
    context.subscriptions.push(
        resetCommand, 
        statusCommand, 
        historyCommand, 
        dashboardCommand,
        testActivityCommand,
        confirmFromStatusBarCommand,
        confirmReminderCommand
    );

    // 启动健康提醒计时器
    startTimers();

    // 监听配置变化，当健康提醒配置改变时重置计时器
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('movedYet')) {
            resetAllTimers();
            // 重启活动检测服务以应用新配置
            const { getActivityDetectionService } = require('./services/activityDetectionService');
            try {
                getActivityDetectionService().restart();
            } catch (error) {
                console.error('重启活动检测服务失败:', error);
            }
        }
    });

    // 定期更新工作时长（每10分钟）
    const workTimeInterval = setInterval(() => {
        try {
            getHistoryService().updateWorkTime();
        } catch (error) {
            console.error('Failed to update work time:', error);
        }
    }, 10 * 60 * 1000);

    context.subscriptions.push({ dispose: () => clearInterval(workTimeInterval) });
}

/**
 * 插件停用函数
 * 当插件被VS Code停用时调用
 * 清除所有计时器，释放资源
 */
export function deactivate() {
    clearAllTimers();
    stopActivityDetectionService();
    
    // 保存最后的工作时长
    try {
        getHistoryService().updateWorkTime();
    } catch (error) {
        console.error('Failed to update work time on deactivate:', error);
    }
}
