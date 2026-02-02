import * as vscode from 'vscode';
import { getConfig } from './configService';
import { resetAllTimers } from './timerService';

/**
 * 活动检测服务
 * 监听用户的鼠标和键盘活动，在无活动时重置计时器
 */
class ActivityDetectionService {
    private lastActivityTime: number = Date.now();
    private inactivityTimer: NodeJS.Timeout | null = null;
    private disposables: vscode.Disposable[] = [];
    private isEnabled: boolean = false;

    /**
     * 启动活动检测
     */
    public start(): void {
        const config = getConfig();
        
        if (!config.enableActivityDetection) {
            this.stop();
            return;
        }

        this.isEnabled = true;
        this.lastActivityTime = Date.now();
        
        // 监听文本编辑器变化（键盘输入）
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(() => {
                this.onActivity();
            })
        );

        // 监听编辑器选择变化（鼠标点击、键盘导航）
        this.disposables.push(
            vscode.window.onDidChangeTextEditorSelection(() => {
                this.onActivity();
            })
        );

        // 监听活动编辑器变化（切换文件）
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(() => {
                this.onActivity();
            })
        );

        // 监听命令执行（各种用户操作）
        this.disposables.push(
            vscode.commands.registerCommand('activityDetection.recordActivity', () => {
                this.onActivity();
            })
        );

        // 监听工作区文件夹变化
        this.disposables.push(
            vscode.workspace.onDidChangeWorkspaceFolders(() => {
                this.onActivity();
            })
        );

        // 监听配置变化
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('movedYet.enableActivityDetection') || 
                    e.affectsConfiguration('movedYet.inactivityResetTime')) {
                    this.restart();
                }
                this.onActivity();
            })
        );

        // 启动无活动检测定时器
        this.startInactivityTimer();

        console.log('活动检测服务已启动');
    }

    /**
     * 停止活动检测
     */
    public stop(): void {
        this.isEnabled = false;
        
        // 清理所有监听器
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];

        // 清理无活动定时器
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }

        console.log('活动检测服务已停止');
    }

    /**
     * 重启活动检测服务
     */
    public restart(): void {
        this.stop();
        this.start();
    }

    /**
     * 记录用户活动
     */
    private onActivity(): void {
        if (!this.isEnabled) {
            return;
        }

        const now = Date.now();
        const config = getConfig();
        const inactivityThreshold = config.inactivityResetTime * 60 * 1000; // 转换为毫秒

        try {
            // 如果距离上次活动时间超过阈值，说明用户刚从长时间无活动状态恢复
            if (now - this.lastActivityTime > inactivityThreshold) {
                console.log(`检测到用户活动恢复，重置所有计时器（无活动时间: ${Math.round((now - this.lastActivityTime) / 60000)} 分钟）`);
                resetAllTimers();
                
                // 显示提示信息
                const texts = require('./configService').getTexts();
                vscode.window.showInformationMessage(
                    `${texts.resetMessage} - 检测到您刚回到工作状态`
                );
            }

            this.lastActivityTime = now;
            this.startInactivityTimer();
        } catch (error) {
            console.error('活动检测处理错误:', error);
            // 发生错误时仍然更新活动时间，避免功能完全失效
            this.lastActivityTime = now;
        }
    }

    /**
     * 启动无活动检测定时器
     */
    private startInactivityTimer(): void {
        // 清除现有定时器
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }

        try {
            const config = getConfig();
            const inactivityTime = config.inactivityResetTime * 60 * 1000; // 转换为毫秒

            // 设置新的定时器
            this.inactivityTimer = setTimeout(() => {
                if (this.isEnabled) {
                    console.log(`用户无活动超过 ${config.inactivityResetTime} 分钟，等待活动恢复...`);
                    // 不在这里重置计时器，而是等待下次活动时重置
                }
            }, inactivityTime);
        } catch (error) {
            console.error('启动无活动检测定时器错误:', error);
        }
    }

    /**
     * 获取上次活动时间
     */
    public getLastActivityTime(): number {
        return this.lastActivityTime;
    }

    /**
     * 获取无活动时长（分钟）
     */
    public getInactivityDuration(): number {
        return Math.round((Date.now() - this.lastActivityTime) / 60000);
    }

    /**
     * 检查是否启用
     */
    public isActive(): boolean {
        return this.isEnabled;
    }
}

// 单例实例
let activityDetectionService: ActivityDetectionService | null = null;

/**
 * 初始化活动检测服务
 */
export function initActivityDetectionService(): void {
    if (!activityDetectionService) {
        activityDetectionService = new ActivityDetectionService();
    }
    activityDetectionService.start();
}

/**
 * 获取活动检测服务实例
 */
export function getActivityDetectionService(): ActivityDetectionService {
    if (!activityDetectionService) {
        throw new Error('活动检测服务未初始化');
    }
    return activityDetectionService;
}

/**
 * 停止活动检测服务
 */
export function stopActivityDetectionService(): void {
    if (activityDetectionService) {
        activityDetectionService.stop();
    }
}