import * as vscode from 'vscode';
import { getHistoryService } from '../services/historyService';
import { getTexts, getConfig } from '../services/configService';

/**
 * 健康数据可视化仪表盘
 */
export function showHealthDashboard(context: vscode.ExtensionContext): void {
    const panel = vscode.window.createWebviewPanel(
        'healthDashboard',
        '健康仪表盘',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );

    panel.webview.html = generateDashboardHTML(panel.webview, context);

    // 处理来自 WebView 的消息
    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'refresh':
                    panel.webview.html = generateDashboardHTML(panel.webview, context);
                    break;
                case 'clearHistory':
                    vscode.window
                        .showWarningMessage('确定要清除所有历史记录吗？', '确定', '取消')
                        .then(async selection => {
                            if (selection === '确定') {
                                await getHistoryService().clearHistory();
                                panel.webview.html = generateDashboardHTML(panel.webview, context);
                                vscode.window.showInformationMessage('历史记录已清除');
                            }
                        });
                    break;
            }
        },
        undefined,
        context.subscriptions
    );
}

/**
 * 生成仪表盘 HTML
 */
function generateDashboardHTML(webview: vscode.Webview, context: vscode.ExtensionContext): string {
    const texts = getTexts();
    const config = getConfig();
    const historyService = getHistoryService();
    const history = historyService.getHistory();
    const todayStats = historyService.getTodayStats();
    const weekStats = historyService.getWeekStats();
    const recentStats = historyService.getRecentStats(7);

    const isEnglish = config.language === 'en';

    // 准备图表数据
    const chartLabels = recentStats.map(s => {
        const date = new Date(s.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const sitData = recentStats.map(s => s.sitCount);
    const drinkData = recentStats.map(s => s.drinkCount);
    const workTimeData = recentStats.map(s => Math.round(s.workTimeMinutes / 60 * 10) / 10);

    return `
<!DOCTYPE html>
<html lang="${isEnglish ? 'en' : 'zh-CN'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${texts.viewDashboard}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .stat-card h3 {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .stat-card .value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }

        .stat-card .label {
            font-size: 0.85em;
            color: #999;
        }

        .chart-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .chart-container h2 {
            margin-bottom: 20px;
            color: #333;
        }

        .actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }

        button {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        button.danger {
            background: linear-gradient(135deg, #f093fb, #f5576c);
        }

        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
        }

        canvas {
            max-height: 300px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 ${texts.viewDashboard}</h1>
            <p>${new Date().toLocaleDateString(isEnglish ? 'en-US' : 'zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>${texts.todayStats}</h3>
                <div class="value">${todayStats?.sitCount || 0}</div>
                <div class="label">${texts.totalSit}</div>
            </div>
            <div class="stat-card">
                <h3>${texts.todayStats}</h3>
                <div class="value">${todayStats?.drinkCount || 0}</div>
                <div class="label">${texts.totalDrink}</div>
            </div>
            <div class="stat-card">
                <h3>${texts.todayStats}</h3>
                <div class="value">${todayStats ? Math.round(todayStats.workTimeMinutes / 60 * 10) / 10 : 0}</div>
                <div class="label">${texts.workTime} (${isEnglish ? 'hours' : '小时'})</div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>${texts.weekStats}</h3>
                <div class="value">${weekStats.sitCount}</div>
                <div class="label">${texts.totalSit}</div>
            </div>
            <div class="stat-card">
                <h3>${texts.weekStats}</h3>
                <div class="value">${weekStats.drinkCount}</div>
                <div class="label">${texts.totalDrink}</div>
            </div>
            <div class="stat-card">
                <h3>${texts.weekStats}</h3>
                <div class="value">${Math.round(weekStats.workTimeMinutes / 60 * 10) / 10}</div>
                <div class="label">${texts.workTime} (${isEnglish ? 'hours' : '小时'})</div>
            </div>
        </div>

        ${
            recentStats.some(s => s.sitCount > 0 || s.drinkCount > 0)
                ? `
        <div class="chart-container">
            <h2>${isEnglish ? '7-Day Trend' : '近7天趋势'}</h2>
            <canvas id="trendChart"></canvas>
        </div>

        <div class="chart-container">
            <h2>${isEnglish ? 'Work Time Distribution' : '工作时长分布'}</h2>
            <canvas id="workTimeChart"></canvas>
        </div>
        `
                : `<div class="no-data">${texts.noHistory}</div>`
        }

        <div class="actions">
            <button onclick="refresh()">${isEnglish ? 'Refresh' : '刷新'}</button>
            <button class="danger" onclick="clearHistory()">${isEnglish ? 'Clear History' : '清除历史'}</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }

        function clearHistory() {
            vscode.postMessage({ command: 'clearHistory' });
        }

        // 趋势图表
        ${
            recentStats.some(s => s.sitCount > 0 || s.drinkCount > 0)
                ? `
        const trendCtx = document.getElementById('trendChart');
        if (trendCtx) {
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(chartLabels)},
                    datasets: [
                        {
                            label: '${texts.totalSit}',
                            data: ${JSON.stringify(sitData)},
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: '${texts.totalDrink}',
                            data: ${JSON.stringify(drinkData)},
                            borderColor: '#764ba2',
                            backgroundColor: 'rgba(118, 75, 162, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }

        // 工作时长图表
        const workTimeCtx = document.getElementById('workTimeChart');
        if (workTimeCtx) {
            new Chart(workTimeCtx, {
                type: 'bar',
                data: {
                    labels: ${JSON.stringify(chartLabels)},
                    datasets: [{
                        label: '${texts.workTime} (${isEnglish ? 'hours' : '小时'})',
                        data: ${JSON.stringify(workTimeData)},
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: '#667eea',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        `
                : ''
        }
    </script>
</body>
</html>`;
}
