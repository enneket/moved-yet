import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { showHealthDashboard } from '../../ui/dashboardUI';
import * as historyService from '../../services/historyService';
import * as configService from '../../services/configService';
import { languages } from '../../utils/languages';

suite('DashboardUI Test Suite', () => {
    let createWebviewPanelStub: sinon.SinonStub;
    let getHistoryServiceStub: sinon.SinonStub;
    let getConfigStub: sinon.SinonStub;
    let getTextsStub: sinon.SinonStub;
    let showWarningMessageStub: sinon.SinonStub;
    let showInfoMessageStub: sinon.SinonStub;
    let mockHistoryService: any;
    let mockContext: vscode.ExtensionContext;

    setup(() => {
        createWebviewPanelStub = sinon.stub(vscode.window, 'createWebviewPanel');
        showWarningMessageStub = sinon.stub(vscode.window, 'showWarningMessage');
        showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage');

        mockHistoryService = {
            getHistory: sinon.stub().returns({
                dailyStats: {},
                totalSitReminders: 0,
                totalDrinkReminders: 0,
                totalWorkTime: 0
            }),
            getTodayStats: sinon.stub().returns({
                date: '2026-02-24',
                sitCount: 5,
                drinkCount: 8,
                workTimeMinutes: 480,
                records: []
            }),
            getWeekStats: sinon.stub().returns({
                sitCount: 35,
                drinkCount: 56,
                workTimeMinutes: 3360
            }),
            getRecentStats: sinon.stub().returns([
                { date: '2026-02-24', sitCount: 5, drinkCount: 8, workTimeMinutes: 480, records: [] },
                { date: '2026-02-23', sitCount: 6, drinkCount: 7, workTimeMinutes: 420, records: [] },
                { date: '2026-02-22', sitCount: 4, drinkCount: 6, workTimeMinutes: 360, records: [] }
            ]),
            clearHistory: sinon.stub().resolves()
        };

        getHistoryServiceStub = sinon.stub(historyService, 'getHistoryService');
        getHistoryServiceStub.returns(mockHistoryService);

        getConfigStub = sinon.stub(configService, 'getConfig');
        getConfigStub.returns({
            language: 'zh-CN',
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true
        });

        getTextsStub = sinon.stub(configService, 'getTexts');
        getTextsStub.returns(languages['zh-CN']);

        const mockWebviewPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: sinon.stub().returns({ dispose: sinon.stub() })
            },
            onDidDispose: sinon.stub().returns({ dispose: sinon.stub() }),
            dispose: sinon.stub(),
            reveal: sinon.stub()
        };

        createWebviewPanelStub.returns(mockWebviewPanel);

        mockContext = {
            subscriptions: [],
            globalState: {
                get: sinon.stub(),
                update: sinon.stub()
            }
        } as any;
    });

    teardown(() => {
        createWebviewPanelStub.restore();
        getHistoryServiceStub.restore();
        getConfigStub.restore();
        getTextsStub.restore();
        showWarningMessageStub.restore();
        showInfoMessageStub.restore();
    });

    test('should create webview panel for dashboard', () => {
        showHealthDashboard(mockContext);
        assert.ok(createWebviewPanelStub.called, 'Should create webview panel');
        const call = createWebviewPanelStub.getCall(0);
        assert.strictEqual(call.args[0], 'healthDashboard', 'Should use correct panel type');
        assert.strictEqual(call.args[1], '健康仪表盘', 'Should use Chinese title');
    });

    test('should generate dashboard HTML with stats', () => {
        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.length > 0, 'Should generate HTML');
        assert.ok(mockPanel.webview.html.includes('今日统计'), 'Should include today stats label');
    });

    test('should show Chinese dashboard when language is zh-CN', () => {
        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('今日统计'), 'Should include Chinese label');
        assert.ok(mockPanel.webview.html.includes('起身次数'), 'Should include Chinese sit label');
    });

    test('should show English dashboard when language is en', () => {
        getConfigStub.restore();
        getConfigStub = sinon.stub(configService, 'getConfig');
        getConfigStub.returns({
            language: 'en',
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true
        });

        getTextsStub.restore();
        getTextsStub = sinon.stub(configService, 'getTexts');
        getTextsStub.returns(languages.en);

        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('Today Stats'), 'Should include English label');
        assert.ok(mockPanel.webview.html.includes('Stand Up Count'), 'Should include English sit label');
    });

    test('should display today stats correctly', () => {
        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('5'), 'Should include sit count');
        assert.ok(mockPanel.webview.html.includes('8'), 'Should include drink count');
    });

    test('should display week stats correctly', () => {
        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('35'), 'Should include week sit count');
        assert.ok(mockPanel.webview.html.includes('56'), 'Should include week drink count');
    });

    test('should show no data message when history is empty', () => {
        mockHistoryService.getRecentStats.returns([
            { date: '2026-02-24', sitCount: 0, drinkCount: 0, workTimeMinutes: 0, records: [] }
        ]);

        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('暂无历史记录'), 'Should show no data message');
    });

    test('should include refresh button in dashboard', () => {
        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('刷新'), 'Should include refresh button');
    });

    test('should include clear history button in dashboard', () => {
        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('清除历史'), 'Should include clear history button');
    });

    test('should handle refresh command from webview', () => {
        let messageHandler: Function | undefined;

        const mockPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: sinon.stub().callsFake((handler) => {
                    messageHandler = handler;
                    return { dispose: sinon.stub() };
                })
            },
            onDidDispose: sinon.stub().returns({ dispose: sinon.stub() }),
            dispose: sinon.stub(),
            reveal: sinon.stub()
        };

        createWebviewPanelStub.returns(mockPanel);

        showHealthDashboard(mockContext);

        assert.ok(messageHandler, 'Should set up message handler');
        messageHandler!({ command: 'refresh' });

        // Verify HTML was regenerated
        assert.ok(mockPanel.webview.html.length > 0, 'Should regenerate HTML on refresh');
    });

    test('should handle clearHistory command with confirmation', async () => {
        let messageHandler: Function | undefined;

        const mockPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: sinon.stub().callsFake((handler) => {
                    messageHandler = handler;
                    return { dispose: sinon.stub() };
                })
            },
            onDidDispose: sinon.stub().returns({ dispose: sinon.stub() }),
            dispose: sinon.stub(),
            reveal: sinon.stub()
        };

        createWebviewPanelStub.returns(mockPanel);

        showHealthDashboard(mockContext);

        showWarningMessageStub.resolves('确定');

        messageHandler!({ command: 'clearHistory' });

        await new Promise(resolve => setTimeout(resolve, 0));

        assert.ok(showWarningMessageStub.called, 'Should show warning message');
        assert.ok(mockHistoryService.clearHistory.called, 'Should call clearHistory');
    });

    test('should cancel clearHistory when user clicks cancel', async () => {
        let messageHandler: Function | undefined;

        const mockPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: sinon.stub().callsFake((handler) => {
                    messageHandler = handler;
                    return { dispose: sinon.stub() };
                })
            },
            onDidDispose: sinon.stub().returns({ dispose: sinon.stub() }),
            dispose: sinon.stub(),
            reveal: sinon.stub()
        };

        createWebviewPanelStub.returns(mockPanel);

        showHealthDashboard(mockContext);

        showWarningMessageStub.resolves('取消');

        messageHandler!({ command: 'clearHistory' });

        await new Promise(resolve => setTimeout(resolve, 0));

        assert.ok(showWarningMessageStub.called, 'Should show warning message');
        assert.ok(mockHistoryService.clearHistory.notCalled, 'Should not call clearHistory when cancelled');
    });

    test('should handle null todayStats', () => {
        mockHistoryService.getTodayStats.returns(null);

        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('0'), 'Should show 0 for null stats');
    });

    test('should calculate work hours correctly', () => {
        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        // 480 minutes = 8 hours
        assert.ok(mockPanel.webview.html.includes('8'), 'Should show 8 hours');
    });

    test('should include chart.js CDN in dashboard', () => {
        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('chart.js'), 'Should include Chart.js');
    });

    test('should use vscode editor colors for styling', () => {
        showHealthDashboard(mockContext);
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('var(--vscode-editor-background)'), 'Should use VS Code colors');
    });
});
