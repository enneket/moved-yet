import * as vscode from 'vscode';
import { FocusModeState } from '../models/types';
import { getConfig, getTexts } from './configService';
import { clearAllTimers, startTimers } from './timerService';

let focusModeState: FocusModeState = {
    isActive: false,
    startTime: 0,
    endTime: 0,
    duration: 0
};

let focusModeTimer: NodeJS.Timeout | null = null;
let statusBarItem: vscode.StatusBarItem | null = null;
let updateInterval: NodeJS.Timeout | null = null;

/**
 * 初始化专注模式服务
 */
export function initFocusModeService(context: vscode.ExtensionContext) {
    // 创建状态栏项
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'movedYet.toggleFocusMode';
    context.subscriptions.push(statusBarItem);
    
    // 初始化时显示状态栏
    updateStatusBar();
    statusBarItem.show();
    
    console.log('专注模式服务已初始化，状态栏按钮已显示');
}

/**
 * 启动专注模式
 */
export function startFocusMode(duration: number) {
    if (focusModeState.isActive) {
        return;
    }

    const now = Date.now();
    focusModeState = {
        isActive: true,
        startTime: now,
        endTime: now + duration * 60 * 1000,
        duration
    };

    // 停止所有提醒计时器
    clearAllTimers();

    // 设置专注模式结束计时器
    focusModeTimer = setTimeout(() => {
        endFocusMode();
    }, duration * 60 * 1000);

    // 启动状态栏更新
    startStatusBarUpdate();

    const texts = getTexts();
    vscode.window.showInformationMessage(
        `${texts.focusModeStarted} ${duration} ${texts.minutesLater}`
    );

    console.log(`专注模式已启动，持续 ${duration} 分钟`);
}

/**
 * 结束专注模式
 */
export function endFocusMode() {
    if (!focusModeState.isActive) {
        return;
    }

    focusModeState.isActive = false;

    // 清除计时器
    if (focusModeTimer) {
        clearTimeout(focusModeTimer);
        focusModeTimer = null;
    }

    // 停止状态栏更新
    stopStatusBarUpdate();

    // 重新启动提醒计时器
    startTimers();

    const texts = getTexts();
    vscode.window.showInformationMessage(texts.focusModeEnded);

    updateStatusBar();

    console.log('专注模式已结束');
}

/**
 * 切换专注模式
 */
export async function toggleFocusMode() {
    if (focusModeState.isActive) {
        // 如果正在专注模式，则退出
        endFocusMode();
    } else {
        // 如果不在专注模式，询问时长并启动
        const texts = getTexts();
        const config = getConfig();
        
        const input = await vscode.window.showInputBox({
            prompt: texts.focusModePrompt,
            value: config.focusModeDefaultDuration.toString(),
            validateInput: (value) => {
                const num = parseInt(value);
                if (isNaN(num) || num <= 0 || num > 480) {
                    return '请输入1-480之间的数字';
                }
                return null;
            }
        });

        if (input) {
            const duration = parseInt(input);
            startFocusMode(duration);
        }
    }
}

/**
 * 获取专注模式状态
 */
export function getFocusModeState(): FocusModeState {
    return { ...focusModeState };
}

/**
 * 检查是否在专注模式
 */
export function isFocusModeActive(): boolean {
    return focusModeState.isActive;
}

/**
 * 获取剩余时间（分钟）
 */
export function getRemainingMinutes(): number {
    if (!focusModeState.isActive) {
        return 0;
    }
    const remaining = focusModeState.endTime - Date.now();
    return Math.max(0, Math.ceil(remaining / 60 / 1000));
}

/**
 * 更新状态栏
 */
function updateStatusBar() {
    if (!statusBarItem) {
        return;
    }

    const texts = getTexts();
    
    if (focusModeState.isActive) {
        const remaining = getRemainingMinutes();
        statusBarItem.text = `🎯 ${texts.focusModeActive} (${remaining}${texts.minutesLater})`;
        statusBarItem.tooltip = `${texts.focusModeRemaining}: ${remaining} 分钟\n点击退出专注模式`;
        statusBarItem.show();
    } else {
        statusBarItem.text = '🎯 ' + texts.enterFocusMode;
        statusBarItem.tooltip = '点击进入专注模式';
        statusBarItem.show();
    }
}

/**
 * 启动状态栏更新
 */
function startStatusBarUpdate() {
    stopStatusBarUpdate();
    
    // 每分钟更新一次状态栏
    updateInterval = setInterval(() => {
        updateStatusBar();
    }, 60 * 1000);
    
    updateStatusBar();
}

/**
 * 停止状态栏更新
 */
function stopStatusBarUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

/**
 * 清理专注模式服务
 */
export function disposeFocusModeService() {
    if (focusModeTimer) {
        clearTimeout(focusModeTimer);
        focusModeTimer = null;
    }
    
    stopStatusBarUpdate();
    
    if (statusBarItem) {
        statusBarItem.dispose();
        statusBarItem = null;
    }
}
