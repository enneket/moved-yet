import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { DailyReportService, initDailyReportService, getDailyReportService } from '../../services/dailyReportService';
import * as historyService from '../../services/historyService';
import * as configService from '../../services/configService';

suite('DailyReportService Test Suite', () => {
    let service: DailyReportService;
    let mockContext: vscode.ExtensionContext;
    let globalStateGetStub: sinon.SinonStub;
    let globalStateUpdateStub: sinon.SinonStub;
    let getHistoryServiceStub: sinon.SinonStub;
    let getConfigStub: sinon.SinonStub;
    let createWebviewPanelStub: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;

    setup(() => {
        // Set time to 10:00 AM
        const testDate = new Date('2026-02-24T10:00:00');
        clock = sinon.useFakeTimers(testDate.getTime());

        globalStateGetStub = sinon.stub();
        globalStateUpdateStub = sinon.stub().resolves();

        mockContext = {
            subscriptions: [],
            globalState: {
                get: globalStateGetStub,
                update: globalStateUpdateStub,
                keys: sinon.stub().returns([]),
                setKeysForSync: sinon.stub()
            },
            workspaceState: {
                get: sinon.stub(),
                update: sinon.stub(),
                keys: sinon.stub().returns([])
            }
        } as any;

        const mockHistoryService = {
            getYesterdayStats: sinon.stub().returns({
                sitCount: 5,
                drinkCount: 8,
                workTimeMinutes: 480
            })
        };

        getHistoryServiceStub = sinon.stub(historyService, 'getHistoryService');
        getHistoryServiceStub.returns(mockHistoryService);

        getConfigStub = sinon.stub(configService, 'getConfig');
        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'zh-CN',
            enableDailyReport: true
        });

        const mockWebviewPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: sinon.stub()
            },
            dispose: sinon.stub()
        };

        createWebviewPanelStub = sinon.stub(vscode.window, 'createWebviewPanel');
        createWebviewPanelStub.returns(mockWebviewPanel);

        globalStateGetStub.returns(null);
        service = new DailyReportService(mockContext);
    });

    teardown(() => {
        getHistoryServiceStub.restore();
        getConfigStub.restore();
        createWebviewPanelStub.restore();
        clock.restore();
    });

    test('should initialize daily report service', () => {
        initDailyReportService(mockContext);
        const instance = getDailyReportService();
        assert.ok(instance, 'Should return service instance');
    });

    test('should show report after 9 AM on first run', () => {
        const shouldShow = service.shouldShowDailyReport();
        assert.strictEqual(shouldShow, true, 'Should show report after 9 AM');
    });

    test('should not show report before 9 AM', () => {
        // Set time to 8:00 AM
        clock.restore();
        const earlyDate = new Date('2026-02-24T08:00:00');
        clock = sinon.useFakeTimers(earlyDate.getTime());

        service = new DailyReportService(mockContext);
        const shouldShow = service.shouldShowDailyReport();
        assert.strictEqual(shouldShow, false, 'Should not show report before 9 AM');
    });

    test('should not show report twice on same day', () => {
        const today = new Date().toISOString().split('T')[0];
        globalStateGetStub.returns(today);

        service = new DailyReportService(mockContext);
        const shouldShow = service.shouldShowDailyReport();
        assert.strictEqual(shouldShow, false, 'Should not show report twice');
    });

    test('should show daily report with correct data', async () => {
        await service.showDailyReport();

        assert.ok(createWebviewPanelStub.called, 'Should create webview panel');
        assert.ok(globalStateUpdateStub.called, 'Should mark report as shown');
    });

    test('should not show report if disabled in config', async () => {
        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'zh-CN',
            enableDailyReport: false
        });

        await service.showDailyReport();

        assert.strictEqual(createWebviewPanelStub.called, false, 'Should not create webview panel');
    });

    test('should not show report if no yesterday data', async () => {
        const mockHistoryService = {
            getYesterdayStats: sinon.stub().returns(null)
        };
        getHistoryServiceStub.returns(mockHistoryService);

        await service.showDailyReport();

        assert.strictEqual(createWebviewPanelStub.called, false, 'Should not show report without data');
    });

    test('should not show report if no health activities yesterday', async () => {
        const mockHistoryService = {
            getYesterdayStats: sinon.stub().returns({
                sitCount: 0,
                drinkCount: 0,
                workTimeMinutes: 0
            })
        };
        getHistoryServiceStub.returns(mockHistoryService);

        await service.showDailyReport();

        assert.strictEqual(createWebviewPanelStub.called, false, 'Should not show report without activities');
    });

    test('should generate report in English when configured', async () => {
        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'en',
            enableDailyReport: true
        });

        await service.showDailyReport();

        const panelCall = createWebviewPanelStub.getCall(0);
        assert.ok(panelCall, 'Should create panel');
        assert.strictEqual(panelCall.args[1], 'Daily Health Report', 'Should use English title');
    });

    test('should calculate health score correctly', async () => {
        // Test with good stats
        const mockHistoryService = {
            getYesterdayStats: sinon.stub().returns({
                sitCount: 8,
                drinkCount: 12,
                workTimeMinutes: 480 // 8 hours
            })
        };
        getHistoryServiceStub.returns(mockHistoryService);

        await service.showDailyReport();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        const html = mockPanel.webview.html;
        
        // Should contain score and rating
        assert.ok(html.includes('score'), 'HTML should contain score');
    });

    test('should generate appropriate suggestions', async () => {
        // Test with low sit count
        const mockHistoryService = {
            getYesterdayStats: sinon.stub().returns({
                sitCount: 2,
                drinkCount: 3,
                workTimeMinutes: 480
            })
        };
        getHistoryServiceStub.returns(mockHistoryService);

        await service.showDailyReport();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        const html = mockPanel.webview.html;
        
        assert.ok(html.length > 0, 'Should generate HTML report');
    });

    test('should handle long work hours', async () => {
        const mockHistoryService = {
            getYesterdayStats: sinon.stub().returns({
                sitCount: 10,
                drinkCount: 15,
                workTimeMinutes: 600 // 10 hours
            })
        };
        getHistoryServiceStub.returns(mockHistoryService);

        await service.showDailyReport();

        assert.ok(createWebviewPanelStub.called, 'Should create report for long work hours');
    });

    test('should handle short work hours', async () => {
        const mockHistoryService = {
            getYesterdayStats: sinon.stub().returns({
                sitCount: 2,
                drinkCount: 3,
                workTimeMinutes: 120 // 2 hours
            })
        };
        getHistoryServiceStub.returns(mockHistoryService);

        await service.showDailyReport();

        assert.ok(createWebviewPanelStub.called, 'Should create report for short work hours');
    });
});
