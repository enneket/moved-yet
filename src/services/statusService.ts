import * as vscode from 'vscode';
import { getConfig, getTexts } from './configService';
import { timerState } from './timerService';

export function showCurrentStatus(): void {
    const config = getConfig();
    const texts = getTexts();
    const now = Date.now();

    let status = `${texts.statusTitle}\n\n`;

    if (config.enableSit) {
        const sitElapsed = Math.floor((now - timerState.sitStartTime) / 1000 / 60);
        const sitRemaining = config.sitInterval - sitElapsed;
        status += `${texts.sitStatus}: ${
            sitRemaining > 0 ? `${sitRemaining}${texts.minutesLater}` : texts.comingSoon
        }\n`;
    } else {
        status += `${texts.sitStatus}: ${texts.disabled}\n`;
    }

    if (config.enableDrink) {
        const drinkElapsed = Math.floor((now - timerState.drinkStartTime) / 1000 / 60);
        const drinkRemaining = config.drinkInterval - drinkElapsed;
        status += `${texts.drinkStatus}: ${
            drinkRemaining > 0 ? `${drinkRemaining}${texts.minutesLater}` : texts.comingSoon
        }\n`;
    } else {
        status += `${texts.drinkStatus}: ${texts.disabled}\n`;
    }

    // 添加工作时长状态
    try {
        const { getHistoryService } = require('./historyService');
        const historyService = getHistoryService();
        const workStatus = historyService.getWorkStatus();
        
        status += `\n工作计时: ${workStatus.isActive ? '进行中' : '已暂停'}`;
        if (workStatus.isActive) {
            status += ` (本次 ${workStatus.currentSessionMinutes} 分钟)`;
        } else {
            status += ` (暂停 ${workStatus.inactiveMinutes} 分钟)`;
        }
        status += `\n今日工作: ${Math.round(workStatus.totalTodayMinutes / 60 * 10) / 10} 小时`;
    } catch (error) {
        status += `\n工作计时: 未知状态`;
    }

    // 添加活动检测状态
    if (config.enableActivityDetection) {
        try {
            const { getActivityDetectionService } = require('./activityDetectionService');
            const activityService = getActivityDetectionService();
            const inactivityDuration = activityService.getInactivityDuration();
            status += `\n活动检测: 启用 (无活动 ${inactivityDuration} 分钟)`;
        } catch (error) {
            status += `\n活动检测: 启用`;
        }
    } else {
        status += `\n活动检测: 已禁用`;
    }

    vscode.window.showInformationMessage(status);
}
