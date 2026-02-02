import * as vscode from 'vscode';
import { getConfig, getTexts } from '../services/configService';
import { resetSitTimer, resetDrinkTimer, setSitReminderFunction, setDrinkReminderFunction } from '../services/timerService';
import { getHistoryService } from '../services/historyService';
import { getProgressiveReminderService } from '../services/progressiveReminderService';

/**
 * 初始化提醒功能
 * 通过设置函数引用，解决循环依赖问题
 * 这种方式允许timerService调用UI功能，而UI模块也可以调用timerService的功能
 */
setSitReminderFunction(() => handleReminder('sit'));
setDrinkReminderFunction(() => handleReminder('drink'));

/**
 * 处理提醒（支持渐进式提醒）
 */
function handleReminder(type: 'sit' | 'drink'): void {
    const config = getConfig();

    if (config.enableProgressiveReminder) {
        // 使用渐进式提醒
        const progressiveService = getProgressiveReminderService();
        progressiveService.startProgressiveReminder(type, () => {
            if (type === 'sit') {
                showSitReminder();
            } else {
                showDrinkReminder();
            }
        });
    } else {
        // 直接显示全屏提醒
        if (type === 'sit') {
            showSitReminder();
        } else {
            showDrinkReminder();
        }
    }
}

/**
 * 显示久坐提醒
 * 创建一个模态窗口，提醒用户起身活动
 * 确认后会重置久坐计时器
 */
export async function showSitReminder(): Promise<void> {
    const texts = getTexts();
    await showReminderModal(texts.sitReminderTitle, texts.sitReminderMessage, texts.sitReminderButton, () => {
        resetSitTimer();
        recordReminderHistory('sit', true);
    });
}

/**
 * 显示喝水提醒
 * 创建一个模态窗口，提醒用户喝水
 * 确认后会重置喝水计时器
 */
export async function showDrinkReminder(): Promise<void> {
    console.log('showDrinkReminder called');
    const texts = getTexts();
    console.log('Drink reminder texts:', {
        title: texts.drinkReminderTitle,
        message: texts.drinkReminderMessage,
        button: texts.drinkReminderButton
    });
    
    await showReminderModal(texts.drinkReminderTitle, texts.drinkReminderMessage, texts.drinkReminderButton, () => {
        console.log('Drink reminder onConfirm callback called');
        console.log('Calling resetDrinkTimer...');
        resetDrinkTimer();
        console.log('resetDrinkTimer completed');
        console.log('Recording reminder history...');
        recordReminderHistory('drink', true);
        console.log('Drink reminder process completed');
    });
}

/**
 * 记录提醒历史
 */
function recordReminderHistory(type: 'sit' | 'drink', confirmed: boolean): void {
    const config = getConfig();
    if (config.enableHistory) {
        try {
            getHistoryService().recordReminder(type, confirmed);
        } catch (error) {
            console.error('Failed to record reminder history:', error);
        }
    }
}

/**
 * 显示一个模态提醒窗口，阻止用户进行其他操作直到确认
 */
async function showReminderModal(title: string, message: string, buttonText: string, onConfirm: () => void): Promise<void> {
    // 创建webview面板作为全屏模态窗口
    const panel = vscode.window.createWebviewPanel(
        'movedYet',
        '健康提醒',
        {
            viewColumn: vscode.ViewColumn.One,
            preserveFocus: false
        },
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );

    // 生成HTML内容
    const html = generateReminderHTML(title, message, buttonText);
    panel.webview.html = html;

    // 确保面板获得焦点并处于活动状态
    panel.reveal(vscode.ViewColumn.One, true);

    // 创建一个模态状态，阻止其他操作
    const disposables: vscode.Disposable[] = [];

    // 处理webview消息
    const messageHandler = panel.webview.onDidReceiveMessage(message => {
        console.log('Received message from webview:', message);
        if (message.command === 'confirm') {
            console.log('Processing confirm command...');
            // 释放所有阻止操作的资源
            disposables.forEach(d => d.dispose());
            panel.dispose();
            console.log('Calling onConfirm callback...');
            onConfirm();
            const texts = getTexts();
            vscode.window.showInformationMessage(texts.confirmMessage);
            console.log('Confirm process completed');
        }
    });
    disposables.push(messageHandler);

    // 防止面板被意外关闭
    panel.onDidDispose(() => {
        // 如果面板被关闭，也释放所有资源
        disposables.forEach(d => d.dispose());
    });
}

/**
 * 生成提醒HTML内容（无倒计时版本）
 */
function generateReminderHTML(title: string, message: string, buttonText: string): string {
    const texts = getTexts();
    const config = getConfig();
    const isEnglish = config.language === 'en';

    return `
<!DOCTYPE html>
<html lang="${isEnglish ? 'en' : 'zh-CN'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isEnglish ? 'Health Reminder' : '健康提醒'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ${
                isEnglish
                    ? '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    : '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
            };
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 999999;
        }

        .reminder-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 60px 80px;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
            max-width: 600px;
            width: 90%;
            animation: slideIn 0.5s ease-out;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        .title {
            font-size: 2.5em;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .message {
            font-size: 1.2em;
            color: #666;
            line-height: 1.6;
            margin-bottom: 40px;
        }

        .confirm-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.1em;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
            opacity: 1;
            pointer-events: auto;
        }

        .confirm-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
        }

        .pulse {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    </style>
</head>
<body>
    <div class="reminder-container pulse">
        <div class="title">${title}</div>
        <div class="message">${message}</div>
        <button id="confirmBtn" class="confirm-btn">${buttonText}</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const confirmBtn = document.getElementById('confirmBtn');

        console.log('WebView loaded, button text:', '${buttonText}');
        console.log('Button element:', confirmBtn);

        // 确认按钮点击事件 - 立即可点击
        confirmBtn.addEventListener('click', (e) => {
            console.log('Button clicked!', e);
            console.log('Sending confirm message...');
            vscode.postMessage({
                command: 'confirm'
            });
        });

        // 添加调试信息
        confirmBtn.addEventListener('mousedown', () => {
            console.log('Button mousedown');
        });

        confirmBtn.addEventListener('mouseup', () => {
            console.log('Button mouseup');
        });

        // 获得焦点
        window.focus();
        document.body.focus();

        // 支持回车键确认
        document.addEventListener('keydown', (e) => {
            console.log('Key pressed:', e.key);
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                console.log('Triggering button click via keyboard');
                confirmBtn.click();
            }
        });

        // 添加更多调试信息
        console.log('Button styles:', window.getComputedStyle(confirmBtn));
        console.log('Button disabled:', confirmBtn.disabled);
        console.log('Button pointer-events:', window.getComputedStyle(confirmBtn).pointerEvents);
    </script>
</body>
</html>`;
}