import * as vscode from 'vscode';
import { getTexts, getConfig } from './services/configService';
import { startTimers, resetAllTimers, clearAllTimers } from './services/timerService';
import { showCurrentStatus } from './services/statusService';
import { initHistoryService, getHistoryService } from './services/historyService';
import { initProgressiveReminderService } from './services/progressiveReminderService';
import { initActivityDetectionService, stopActivityDetectionService } from './services/activityDetectionService';
import { initDailyReportService, getDailyReportService } from './services/dailyReportService';
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

    // 初始化服务（注意顺序：先初始化不依赖计时器的服务）
    initHistoryService(context);
    initProgressiveReminderService();
    initDailyReportService(context);
    
    // 先启动计时器，再启动活动检测
    // 这样可以避免活动检测在计时器启动前就触发重置
    console.log('启动健康提醒计时器...');
    startTimers();
    
    // 最后启动活动检测服务
    console.log('启动活动检测服务...');
    initActivityDetectionService();

    // 检查是否需要显示每日健康报告
    // 每天9点后首次启动时显示昨天的健康报告
    // 延迟5秒显示，避免启动时打扰用户
    setTimeout(() => {
        const reportService = getDailyReportService();
        if (reportService.shouldShowDailyReport()) {
            const historyService = getHistoryService();
            const yesterdayStats = historyService.getYesterdayStats();
            // 只有当昨天有数据时才显示报告
            if (yesterdayStats && (yesterdayStats.sitCount > 0 || yesterdayStats.drinkCount > 0)) {
                reportService.showDailyReport();
            }
        }
    }, 5000);

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

    // 注册查看每日报告命令
    const dailyReportCommand = vscode.commands.registerCommand('movedYet.showDailyReport', () => {
        getDailyReportService().showDailyReport();
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
            
            // 获取工作状态
            const historyService = getHistoryService();
            const workStatus = historyService.getWorkStatus();
            
            vscode.window.showInformationMessage(
                `活动检测状态:\n` +
                `- 启用状态: ${activityService.isActive() ? '已启用' : '已禁用'}\n` +
                `- 无活动时长: ${inactivityDuration} 分钟\n` +
                `- 重置阈值: ${currentConfig.inactivityResetTime} 分钟\n` +
                `- 工作计时: ${workStatus.isActive ? '进行中' : '已暂停'}\n` +
                `- 今日工作: ${Math.round(workStatus.totalTodayMinutes / 60 * 10) / 10} 小时`
            );
        } catch (error) {
            vscode.window.showErrorMessage('活动检测服务未正确初始化');
        }
    });

    // 注册暂停工作计时命令
    const pauseWorkTimerCommand = vscode.commands.registerCommand('movedYet.pauseWorkTimer', async () => {
        try {
            const historyService = getHistoryService();
            await historyService.pauseWorkTimer();
            vscode.window.showInformationMessage('工作计时已暂停');
        } catch (error) {
            vscode.window.showErrorMessage('暂停工作计时失败');
        }
    });

    // 注册恢复工作计时命令
    const resumeWorkTimerCommand = vscode.commands.registerCommand('movedYet.resumeWorkTimer', () => {
        try {
            const historyService = getHistoryService();
            historyService.resumeWorkTimer();
            vscode.window.showInformationMessage('工作计时已恢复');
        } catch (error) {
            vscode.window.showErrorMessage('恢复工作计时失败');
        }
    });

    // 注册清理所有提醒命令（紧急修复）
    const clearAllRemindersCommand = vscode.commands.registerCommand('movedYet.clearAllReminders', () => {
        try {
            // 停止渐进式提醒
            const progressiveService = require('./services/progressiveReminderService').getProgressiveReminderService();
            progressiveService.stopProgressiveReminder();
            
            // 重置所有计时器
            resetAllTimers();
            
            // 强制重启活动检测服务
            const { getActivityDetectionService } = require('./services/activityDetectionService');
            try {
                getActivityDetectionService().restart();
            } catch (error) {
                console.error('重启活动检测服务失败:', error);
            }
            
            // 显示成功消息
            vscode.window.showInformationMessage('所有提醒已清理，计时器已重置。如果通知仍然存在，请重启VS Code。');
            console.log('紧急清理：所有提醒已停止');
        } catch (error) {
            console.error('清理提醒失败:', error);
            vscode.window.showErrorMessage('清理提醒失败，请重启VS Code');
        }
    });

    // 注册强制重启插件命令
    const forceRestartCommand = vscode.commands.registerCommand('movedYet.forceRestart', () => {
        try {
            // 停止所有服务
            clearAllTimers();
            stopActivityDetectionService();
            
            const progressiveService = require('./services/progressiveReminderService').getProgressiveReminderService();
            progressiveService.stopProgressiveReminder();
            
            // 重新初始化所有服务
            setTimeout(() => {
                initHistoryService(context);
                initProgressiveReminderService();
                initActivityDetectionService();
                startTimers();
                
                vscode.window.showInformationMessage('插件已强制重启，所有提醒已清理');
            }, 1000);
            
        } catch (error) {
            console.error('强制重启失败:', error);
            vscode.window.showErrorMessage('强制重启失败，请手动重启VS Code');
        }
    });

    // 注册验证提醒函数注册状态命令
    const verifyReminderFunctionsCommand = vscode.commands.registerCommand('movedYet.verifyReminderFunctions', () => {
        try {
            const { sitReminderFunction, drinkReminderFunction } = require('./services/timerService');
            
            // 检查函数是否是默认的空函数
            const defaultFunction = () => {};
            const isSitDefault = sitReminderFunction.toString() === defaultFunction.toString();
            const isDrinkDefault = drinkReminderFunction.toString() === defaultFunction.toString();
            
            const message = `
🔍 提醒函数注册验证

久坐提醒函数:
- 类型: ${typeof sitReminderFunction}
- 是否为默认空函数: ${isSitDefault ? '❌ 是' : '✅ 否'}
- 函数内容: ${sitReminderFunction.toString().substring(0, 100)}...

喝水提醒函数:
- 类型: ${typeof drinkReminderFunction}
- 是否为默认空函数: ${isDrinkDefault ? '❌ 是' : '✅ 否'}
- 函数内容: ${drinkReminderFunction.toString().substring(0, 100)}...

${isSitDefault || isDrinkDefault ? '⚠️ 发现问题：提醒函数未正确注册！' : '✅ 提醒函数注册正常'}
            `.trim();
            
            vscode.window.showInformationMessage(message);
            
            // 如果发现问题，尝试重新导入reminderUI
            if (isSitDefault || isDrinkDefault) {
                try {
                    delete require.cache[require.resolve('./ui/reminderUI')];
                    require('./ui/reminderUI');
                    vscode.window.showInformationMessage('已尝试重新加载提醒函数，请再次验证');
                } catch (error) {
                    console.error('重新加载提醒函数失败:', error);
                }
            }
            
        } catch (error) {
            console.error('验证提醒函数失败:', error);
            vscode.window.showErrorMessage('验证提醒函数失败: ' + (error instanceof Error ? error.message : String(error)));
        }
    });
    const forceRestartTimersCommand = vscode.commands.registerCommand('movedYet.forceRestartTimers', () => {
        try {
            const { clearAllTimers, startTimers } = require('./services/timerService');
            
            // 强制清除所有计时器
            clearAllTimers();
            
            // 等待一下再重新启动
            setTimeout(() => {
                startTimers();
                
                // 验证启动结果
                const { timerState } = require('./services/timerService');
                const config = getConfig();
                
                let message = '计时器已强制重启\n\n';
                message += `久坐计时器: ${timerState.sitTimer ? '✅ 已启动' : '❌ 启动失败'} (${config.enableSit ? '已启用' : '已禁用'})\n`;
                message += `喝水计时器: ${timerState.drinkTimer ? '✅ 已启动' : '❌ 启动失败'} (${config.enableDrink ? '已启用' : '已禁用'})`;
                
                vscode.window.showInformationMessage(message);
            }, 100);
            
        } catch (error) {
            console.error('强制重启计时器失败:', error);
            vscode.window.showErrorMessage('强制重启计时器失败: ' + (error instanceof Error ? error.message : String(error)));
        }
    });
    const testShortRemindersCommand = vscode.commands.registerCommand('movedYet.testShortReminders', () => {
        try {
            // 临时设置短间隔进行测试
            const { clearAllTimers } = require('./services/timerService');
            const { setSitReminderFunction, setDrinkReminderFunction } = require('./services/timerService');
            
            clearAllTimers();
            
            // 设置1分钟后的久坐提醒
            const sitTimer = setTimeout(() => {
                vscode.window.showInformationMessage('🪑 测试久坐提醒 - 这是1分钟后的久坐提醒测试', '确认').then(() => {
                    vscode.window.showInformationMessage('久坐提醒测试完成');
                });
            }, 60 * 1000);
            
            // 设置1.5分钟后的喝水提醒
            const drinkTimer = setTimeout(() => {
                vscode.window.showInformationMessage('💧 测试喝水提醒 - 这是1.5分钟后的喝水提醒测试', '确认').then(() => {
                    vscode.window.showInformationMessage('喝水提醒测试完成');
                });
            }, 90 * 1000);
            
            vscode.window.showInformationMessage('测试已开始：久坐提醒1分钟后，喝水提醒1.5分钟后');
            
        } catch (error) {
            console.error('测试短间隔提醒失败:', error);
            vscode.window.showErrorMessage('测试失败: ' + (error instanceof Error ? error.message : String(error)));
        }
    });
    // 注册调试计时器状态命令
    const debugTimersCommand = vscode.commands.registerCommand('movedYet.debugTimers', () => {
        try {
            const config = getConfig();
            const { timerState, sitReminderFunction, drinkReminderFunction } = require('./services/timerService');
            const now = Date.now();
            
            const sitElapsed = Math.floor((now - timerState.sitStartTime) / 1000 / 60);
            const drinkElapsed = Math.floor((now - timerState.drinkStartTime) / 1000 / 60);
            
            const debugInfo = `
🔍 计时器调试信息

📋 配置状态:
- 久坐提醒: ${config.enableSit ? '启用' : '禁用'} (${config.sitInterval}分钟)
- 喝水提醒: ${config.enableDrink ? '启用' : '禁用'} (${config.drinkInterval}分钟)
- 渐进式提醒: ${config.enableProgressiveReminder ? '启用' : '禁用'}
- 活动检测: ${config.enableActivityDetection ? '启用' : '禁用'}

⏱️ 计时器状态:
- 久坐计时器: ${timerState.sitTimer ? '运行中 (ID: ' + timerState.sitTimer + ')' : '❌ 未运行'}
- 喝水计时器: ${timerState.drinkTimer ? '运行中 (ID: ' + timerState.drinkTimer + ')' : '❌ 未运行'}
- 久坐开始时间: ${new Date(timerState.sitStartTime).toLocaleTimeString()}
- 喝水开始时间: ${new Date(timerState.drinkStartTime).toLocaleTimeString()}
- 久坐已运行: ${sitElapsed} 分钟 ${config.enableSit ? '(剩余 ' + (config.sitInterval - sitElapsed) + ' 分钟)' : '(已禁用)'}
- 喝水已运行: ${drinkElapsed} 分钟 ${config.enableDrink ? '(剩余 ' + (config.drinkInterval - drinkElapsed) + ' 分钟)' : '(已禁用)'}

🔧 提醒函数:
- 久坐提醒函数: ${typeof sitReminderFunction} ${sitReminderFunction === (() => {}) ? '❌ 默认空函数' : '✅ 已注册'}
- 喝水提醒函数: ${typeof drinkReminderFunction} ${drinkReminderFunction === (() => {}) ? '❌ 默认空函数' : '✅ 已注册'}

🚨 问题诊断:
${!config.enableSit ? '- 久坐提醒已禁用' : ''}
${!config.enableDrink ? '- 喝水提醒已禁用' : ''}
${!timerState.sitTimer && config.enableSit ? '- 久坐计时器未启动（可能是启动失败）' : ''}
${!timerState.drinkTimer && config.enableDrink ? '- 喝水计时器未启动（可能是启动失败）' : ''}

🧪 建议操作:
${!timerState.sitTimer && config.enableSit ? '1. 运行"重置所有计时器"命令' : ''}
${!timerState.drinkTimer && config.enableDrink ? '2. 运行"强制重启插件"命令' : ''}
3. 运行"测试短间隔提醒"命令验证功能
            `.trim();
            
            vscode.window.showInformationMessage(debugInfo);
            console.log('Timer Debug Info:', {
                config,
                timerState,
                sitElapsed,
                drinkElapsed,
                sitReminderFunction: sitReminderFunction.toString(),
                drinkReminderFunction: drinkReminderFunction.toString()
            });
            
        } catch (error) {
            console.error('调试计时器失败:', error);
            vscode.window.showErrorMessage('调试计时器失败: ' + (error instanceof Error ? error.message : String(error)));
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
        dailyReportCommand,
        testActivityCommand,
        pauseWorkTimerCommand,
        resumeWorkTimerCommand,
        clearAllRemindersCommand,
        forceRestartCommand,
        forceRestartTimersCommand,
        verifyReminderFunctionsCommand,
        testShortRemindersCommand,
        debugTimersCommand,
        confirmFromStatusBarCommand,
        confirmReminderCommand
    );

    // 监听配置变化，当健康提醒配置改变时重置计时器
    const configChangeListener = vscode.workspace.onDidChangeConfiguration(e => {
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
    
    context.subscriptions.push(configChangeListener);

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
