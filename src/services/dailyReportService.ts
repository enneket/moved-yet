import * as vscode from 'vscode';
import { getHistoryService } from './historyService';
import { getConfig } from './configService';

/**
 * 每日健康报告服务
 * 负责生成和显示每日健康报告
 */
export class DailyReportService {
    private context: vscode.ExtensionContext;
    private lastReportDate: string | null = null;
    private readonly LAST_REPORT_KEY = 'movedYet.lastReportDate';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.lastReportDate = this.context.globalState.get<string>(this.LAST_REPORT_KEY) || null;
    }

    /**
     * 获取今天的日期字符串
     */
    private getTodayDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * 获取昨天的日期字符串
     */
    private getYesterdayDate(): string {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }

    /**
     * 检查当前时间是否在9点之后
     */
    private isAfter9AM(): boolean {
        const now = new Date();
        return now.getHours() >= 9;
    }

    /**
     * 检查是否应该显示今日报告
     * 规则：每天9点后首次启动时显示昨天的报告
     */
    shouldShowDailyReport(): boolean {
        const today = this.getTodayDate();
        
        // 如果今天还没显示过报告，且当前时间在9点之后
        if (this.lastReportDate !== today && this.isAfter9AM()) {
            return true;
        }
        
        return false;
    }

    /**
     * 标记今日报告已显示
     */
    private async markReportShown(): Promise<void> {
        const today = this.getTodayDate();
        this.lastReportDate = today;
        await this.context.globalState.update(this.LAST_REPORT_KEY, today);
    }

    /**
     * 生成健康评分（0-100）
     */
    private calculateHealthScore(sitCount: number, drinkCount: number, workHours: number): number {
        let score = 0;

        // 起身次数评分（最多40分）
        // 理想：每小时起身1次
        const idealSitCount = Math.max(1, Math.floor(workHours));
        const sitScore = Math.min(40, (sitCount / idealSitCount) * 40);
        score += sitScore;

        // 喝水次数评分（最多40分）
        // 理想：每小时喝水1-2次
        const idealDrinkCount = Math.max(1, Math.floor(workHours * 1.5));
        const drinkScore = Math.min(40, (drinkCount / idealDrinkCount) * 40);
        score += drinkScore;

        // 工作时长评分（最多20分）
        // 理想：4-8小时
        let workScore = 0;
        if (workHours >= 4 && workHours <= 8) {
            workScore = 20;
        } else if (workHours < 4) {
            workScore = (workHours / 4) * 20;
        } else {
            // 超过8小时扣分
            workScore = Math.max(0, 20 - (workHours - 8) * 2);
        }
        score += workScore;

        return Math.round(score);
    }

    /**
     * 获取健康评级
     */
    private getHealthRating(score: number): { emoji: string; text: string; color: string } {
        const config = getConfig();
        const isEnglish = config.language === 'en';

        if (score >= 90) {
            return {
                emoji: '🌟',
                text: isEnglish ? 'Excellent' : '优秀',
                color: '#10b981'
            };
        } else if (score >= 75) {
            return {
                emoji: '😊',
                text: isEnglish ? 'Good' : '良好',
                color: '#3b82f6'
            };
        } else if (score >= 60) {
            return {
                emoji: '😐',
                text: isEnglish ? 'Fair' : '一般',
                color: '#f59e0b'
            };
        } else {
            return {
                emoji: '😟',
                text: isEnglish ? 'Needs Improvement' : '需改进',
                color: '#ef4444'
            };
        }
    }

    /**
     * 生成健康建议
     */
    private generateSuggestions(sitCount: number, drinkCount: number, workHours: number): string[] {
        const config = getConfig();
        const isEnglish = config.language === 'en';
        const suggestions: string[] = [];

        const idealSitCount = Math.max(1, Math.floor(workHours));
        const idealDrinkCount = Math.max(1, Math.floor(workHours * 1.5));

        if (sitCount < idealSitCount) {
            suggestions.push(
                isEnglish
                    ? '💡 Try to stand up and stretch every hour'
                    : '💡 建议每小时起身活动一次'
            );
        }

        if (drinkCount < idealDrinkCount) {
            suggestions.push(
                isEnglish
                    ? '💧 Remember to drink water regularly'
                    : '💧 记得定时补充水分'
            );
        }

        if (workHours > 8) {
            suggestions.push(
                isEnglish
                    ? '⏰ Consider taking more breaks, you worked over 8 hours today'
                    : '⏰ 今日工作时长超过8小时，建议增加休息'
            );
        }

        if (workHours < 4 && workHours > 0) {
            suggestions.push(
                isEnglish
                    ? '📊 Short work session today, keep up the healthy habits!'
                    : '📊 今日工作时间较短，继续保持健康习惯！'
            );
        }

        if (suggestions.length === 0) {
            suggestions.push(
                isEnglish
                    ? '✨ Great job! Keep maintaining these healthy habits!'
                    : '✨ 做得很好！继续保持这些健康习惯！'
            );
        }

        return suggestions;
    }

    /**
     * 显示每日健康报告
     * 显示昨天的健康数据
     */
    async showDailyReport(): Promise<void> {
        const config = getConfig();
        
        // 检查是否启用每日报告
        if (!config.enableDailyReport) {
            return;
        }

        const historyService = getHistoryService();
        const yesterdayStats = historyService.getYesterdayStats();

        if (!yesterdayStats) {
            return; // 昨天没有数据，不显示报告
        }

        // 检查昨天是否有实际的健康数据
        if (yesterdayStats.sitCount === 0 && yesterdayStats.drinkCount === 0) {
            return; // 昨天没有健康活动记录，不显示报告
        }

        const workHours = yesterdayStats.workTimeMinutes / 60;
        const score = this.calculateHealthScore(yesterdayStats.sitCount, yesterdayStats.drinkCount, workHours);
        const rating = this.getHealthRating(score);
        const suggestions = this.generateSuggestions(yesterdayStats.sitCount, yesterdayStats.drinkCount, workHours);

        const isEnglish = config.language === 'en';
        const yesterdayDate = this.getYesterdayDate();

        const panel = vscode.window.createWebviewPanel(
            'dailyHealthReport',
            isEnglish ? 'Daily Health Report' : '每日健康报告',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: false,
            }
        );

        panel.webview.html = this.generateReportHTML(
            yesterdayStats.sitCount,
            yesterdayStats.drinkCount,
            workHours,
            score,
            rating,
            suggestions,
            isEnglish,
            yesterdayDate
        );

        // 标记报告已显示
        await this.markReportShown();

        // 处理消息
        panel.webview.onDidReceiveMessage(
            async message => {
                if (message.command === 'viewDashboard') {
                    panel.dispose();
                    vscode.commands.executeCommand('movedYet.showDashboard');
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    /**
     * 生成报告HTML（支持深色模式）
     */
    private generateReportHTML(
        sitCount: number,
        drinkCount: number,
        workHours: number,
        score: number,
        rating: { emoji: string; text: string; color: string },
        suggestions: string[],
        isEnglish: boolean,
        reportDate: string
    ): string {
        // 格式化日期显示
        const dateObj = new Date(reportDate + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString(isEnglish ? 'en-US' : 'zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        return `
<!DOCTYPE html>
<html lang="${isEnglish ? 'en' : 'zh-CN'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isEnglish ? 'Daily Health Report' : '每日健康报告'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ${
                isEnglish
                    ? '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
                    : '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
            };
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 15px;
            border: 1px solid var(--vscode-panel-border);
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            color: var(--vscode-editor-foreground);
        }

        .date {
            font-size: 1.1em;
            color: var(--vscode-descriptionForeground);
        }

        .score-section {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px;
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 15px;
            border: 1px solid var(--vscode-panel-border);
        }

        .score-circle {
            width: 200px;
            height: 200px;
            margin: 0 auto 20px;
            border-radius: 50%;
            background: conic-gradient(
                ${rating.color} ${score * 3.6}deg,
                var(--vscode-input-background) ${score * 3.6}deg
            );
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .score-inner {
            width: 160px;
            height: 160px;
            border-radius: 50%;
            background: var(--vscode-editor-background);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .score-value {
            font-size: 3em;
            font-weight: bold;
            color: ${rating.color};
        }

        .score-label {
            font-size: 1em;
            color: var(--vscode-descriptionForeground);
        }

        .rating {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .rating-text {
            font-size: 1.5em;
            font-weight: bold;
            color: ${rating.color};
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .stat-icon {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
        }

        .suggestions-section {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
        }

        .suggestions-section h2 {
            font-size: 1.5em;
            margin-bottom: 20px;
            color: var(--vscode-editor-foreground);
        }

        .suggestion {
            background: var(--vscode-input-background);
            border-left: 4px solid var(--vscode-textLink-foreground);
            padding: 15px 20px;
            margin-bottom: 15px;
            border-radius: 5px;
            font-size: 1.1em;
        }

        .actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s ease;
        }

        button:hover {
            background: var(--vscode-button-hoverBackground);
            transform: translateY(-2px);
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 ${isEnglish ? 'Daily Health Report' : '每日健康报告'}</h1>
            <div class="date">${formattedDate}</div>
        </div>

        <div class="score-section">
            <div class="score-circle">
                <div class="score-inner">
                    <div class="score-value">${score}</div>
                    <div class="score-label">${isEnglish ? 'Score' : '分'}</div>
                </div>
            </div>
            <div class="rating">${rating.emoji}</div>
            <div class="rating-text">${rating.text}</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🪑</div>
                <div class="stat-value">${sitCount}</div>
                <div class="stat-label">${isEnglish ? 'Times Stood Up' : '起身次数'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💧</div>
                <div class="stat-value">${drinkCount}</div>
                <div class="stat-label">${isEnglish ? 'Times Drank Water' : '喝水次数'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value">${workHours.toFixed(1)}</div>
                <div class="stat-label">${isEnglish ? 'Work Hours' : '工作时长（小时）'}</div>
            </div>
        </div>

        <div class="suggestions-section">
            <h2>${isEnglish ? '💡 Health Suggestions' : '💡 健康建议'}</h2>
            ${suggestions.map(s => `<div class="suggestion">${s}</div>`).join('')}
        </div>

        <div class="actions">
            <button onclick="viewDashboard()">${isEnglish ? 'View Dashboard' : '查看仪表盘'}</button>
        </div>

        <div class="footer">
            ${isEnglish ? 'Keep up the healthy habits! 💪' : '继续保持健康习惯！💪'}
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function viewDashboard() {
            vscode.postMessage({ command: 'viewDashboard' });
        }
    </script>
</body>
</html>`;
    }
}

let dailyReportServiceInstance: DailyReportService | null = null;

export function initDailyReportService(context: vscode.ExtensionContext): void {
    dailyReportServiceInstance = new DailyReportService(context);
}

export function getDailyReportService(): DailyReportService {
    if (!dailyReportServiceInstance) {
        throw new Error('DailyReportService not initialized');
    }
    return dailyReportServiceInstance;
}
