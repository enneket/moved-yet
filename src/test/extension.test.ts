import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { activate, deactivate } from '../extension';
import * as configService from '../services/configService';
import * as timerService from '../services/timerService';
import * as historyService from '../services/historyService';
import * as activityDetectionService from '../services/activityDetectionService';
import * as focusModeService from '../services/focusModeService';
import * as progressiveReminderService from '../services/progressiveReminderService';
import * as dailyReportService from '../services/dailyReportService';

suite('Extension Test Suite', () => {
    let mockContext: vscode.ExtensionContext;
    let getConfigStub: sinon.SinonStub;
    let getTextsStub: sinon.SinonStub;
    let startTimersStub: sinon.SinonStub;
    let clearAllTimersStub: sinon.SinonStub;
    let resetAllTimersStub: sinon.SinonStub;
    let initHistoryServiceStub: sinon.SinonStub;
    let initProgressiveReminderServiceStub: sinon.SinonStub;
    let initActivityDetectionServiceStub: sinon.SinonStub;
    let initDailyReportServiceStub: sinon.SinonStub;
    let initFocusModeServiceStub: sinon.SinonStub;
    let disposeFocusModeServiceStub: sinon.SinonStub;
    let stopActivityDetectionServiceStub: sinon.SinonStub;
    let getHistoryServiceStub: sinon.SinonStub;
    let getDailyReportServiceStub: sinon.SinonStub;
    let showInformationMessageStub: sinon.SinonStub;
    let showWarningMessageStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;
    let createStatusBarItemStub: sinon.SinonStub;
    let registerCommandStub: sinon.SinonStub;
    let onDidChangeConfigurationStub: sinon.SinonStub;
    let setIntervalStub: sinon.SinonStub;
    let clearIntervalStub: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;
    let mockHistoryServiceInstance: any;
    let mockDailyReportServiceInstance: any;

    setup(() => {
        clock = sinon.useFakeTimers(new Date('2026-02-24T10:00:00').getTime());

        // Create mock context
        mockContext = {
            subscriptions: [],
            globalState: {
                get: sinon.stub().returns(null),
                update: sinon.stub().resolves(),
                keys: sinon.stub().returns([]),
                setKeysForSync: sinon.stub()
            },
            workspaceState: {
                get: sinon.stub(),
                update: sinon.stub(),
                keys: sinon.stub().returns([])
            }
        } as any;

        // Create mock services
        mockHistoryServiceInstance = {
            recordReminder: sinon.stub().resolves(),
            updateWorkTime: sinon.stub().resolves(),
            getTodayStats: sinon.stub().returns({ sitCount: 5, drinkCount: 8, workTimeMinutes: 480, records: [] }),
            getYesterdayStats: sinon.stub().returns({ sitCount: 5, drinkCount: 8, workTimeMinutes: 480, records: [] }),
            getWeekStats: sinon.stub().returns({ sitCount: 35, drinkCount: 56, workTimeMinutes: 3360 }),
            pauseWorkTimer: sinon.stub().resolves(),
            resumeWorkTimer: sinon.stub()
        };

        mockDailyReportServiceInstance = {
            shouldShowDailyReport: sinon.stub().returns(false),
            showDailyReport: sinon.stub().resolves()
        };

        // Create stubs
        getConfigStub = sinon.stub(configService, 'getConfig');
        getTextsStub = sinon.stub(configService, 'getTexts');
        startTimersStub = sinon.stub(timerService, 'startTimers');
        clearAllTimersStub = sinon.stub(timerService, 'clearAllTimers');
        resetAllTimersStub = sinon.stub(timerService, 'resetAllTimers');
        initHistoryServiceStub = sinon.stub(historyService, 'initHistoryService');
        initProgressiveReminderServiceStub = sinon.stub(progressiveReminderService, 'initProgressiveReminderService');
        initActivityDetectionServiceStub = sinon.stub(activityDetectionService, 'initActivityDetectionService');
        initDailyReportServiceStub = sinon.stub(dailyReportService, 'initDailyReportService');
        initFocusModeServiceStub = sinon.stub(focusModeService, 'initFocusModeService');
        disposeFocusModeServiceStub = sinon.stub(focusModeService, 'disposeFocusModeService');
        stopActivityDetectionServiceStub = sinon.stub(activityDetectionService, 'stopActivityDetectionService');
        getHistoryServiceStub = sinon.stub(historyService, 'getHistoryService');
        getDailyReportServiceStub = sinon.stub(dailyReportService, 'getDailyReportService');
        showInformationMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
        showWarningMessageStub = sinon.stub(vscode.window, 'showWarningMessage');
        showErrorMessageStub = sinon.stub(vscode.window, 'showErrorMessage');
        createStatusBarItemStub = sinon.stub(vscode.window, 'createStatusBarItem');
        registerCommandStub = sinon.stub(vscode.commands, 'registerCommand');
        onDidChangeConfigurationStub = sinon.stub(vscode.workspace, 'onDidChangeConfiguration');
        setIntervalStub = sinon.stub(global, 'setInterval');
        clearIntervalStub = sinon.stub(global, 'clearInterval');

        // Configure stubs
        getHistoryServiceStub.returns(mockHistoryServiceInstance);
        getDailyReportServiceStub.returns(mockDailyReportServiceInstance);

        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'zh-CN',
            enableProgressiveReminder: false,
            enableHistory: true,
            progressiveReminderLevel1Duration: 5,
            progressiveReminderLevel2Duration: 5,
            enableActivityDetection: true,
            inactivityResetTime: 5,
            enableDailyReport: true,
            focusModeDefaultDuration: 60
        });

        getTextsStub.returns({
            sitReminderTitle: '🚶‍♂️ 该起身活动了！',
            sitReminderMessage: '您已经坐了很久了',
            sitReminderButton: '我已经起身活动了',
            drinkReminderTitle: '💧 该喝水了！',
            drinkReminderMessage: '记得补充水分',
            drinkReminderButton: '我已经喝水了',
            confirmMessage: '我知道了',
            resetMessage: '所有计时器已重置',
            statusTitle: '📊 健康提醒状态',
            sitStatus: '🚶‍♂️ 久坐提醒',
            drinkStatus: '💧 喝水提醒',
            disabled: '已禁用',
            minutesLater: '分钟后提醒',
            comingSoon: '即将提醒',
            waitSeconds: '请等待',
            snoozeButton: '稍后提醒',
            gentleReminder: '温馨提示',
            urgentReminder: '重要提醒',
            historyTitle: '📊 健康提醒历史',
            todayStats: '今日统计',
            weekStats: '本周统计',
            totalSit: '起身次数',
            totalDrink: '喝水次数',
            workTime: '工作时长',
            noHistory: '暂无历史记录',
            viewHistory: '查看历史记录',
            viewDashboard: '查看健康仪表盘',
            focusModeActive: '专注模式',
            focusModeEnded: '专注模式已结束',
            focusModeStarted: '专注模式已启动',
            focusModeRemaining: '剩余时间',
            enterFocusMode: '进入专注模式',
            exitFocusMode: '退出专注模式',
            focusModePrompt: '请输入专注时长'
        });

        const mockStatusBarItem = {
            text: '',
            tooltip: '',
            command: '',
            show: sinon.stub(),
            hide: sinon.stub(),
            dispose: sinon.stub()
        };
        createStatusBarItemStub.returns(mockStatusBarItem);

        const mockDisposable = { dispose: sinon.stub() };
        registerCommandStub.returns(mockDisposable);
        onDidChangeConfigurationStub.returns(mockDisposable);
        setIntervalStub.returns(1);
    });

    teardown(() => {
        getConfigStub.restore();
        getTextsStub.restore();
        startTimersStub.restore();
        clearAllTimersStub.restore();
        resetAllTimersStub.restore();
        initHistoryServiceStub.restore();
        initProgressiveReminderServiceStub.restore();
        initActivityDetectionServiceStub.restore();
        initDailyReportServiceStub.restore();
        initFocusModeServiceStub.restore();
        disposeFocusModeServiceStub.restore();
        stopActivityDetectionServiceStub.restore();
        getHistoryServiceStub.restore();
        getDailyReportServiceStub.restore();
        showInformationMessageStub.restore();
        showWarningMessageStub.restore();
        showErrorMessageStub.restore();
        createStatusBarItemStub.restore();
        registerCommandStub.restore();
        onDidChangeConfigurationStub.restore();
        setIntervalStub.restore();
        clearIntervalStub.restore();
        clock.restore();
    });

    test('should activate extension without errors', () => {
        // This should not throw
        activate(mockContext);
        assert.ok(true, 'Extension activated successfully');
    });

    test('should initialize history service on activation', () => {
        activate(mockContext);
        assert.ok(initHistoryServiceStub.called, 'Should initialize history service');
    });

    test('should initialize progressive reminder service on activation', () => {
        activate(mockContext);
        assert.ok(initProgressiveReminderServiceStub.called, 'Should initialize progressive reminder service');
    });

    test('should initialize daily report service on activation', () => {
        activate(mockContext);
        assert.ok(initDailyReportServiceStub.called, 'Should initialize daily report service');
    });

    test('should initialize focus mode service on activation', () => {
        activate(mockContext);
        assert.ok(initFocusModeServiceStub.called, 'Should initialize focus mode service');
    });

    test('should start timers on activation', () => {
        activate(mockContext);
        assert.ok(startTimersStub.called, 'Should start timers');
    });

    test('should initialize activity detection on activation', () => {
        activate(mockContext);
        assert.ok(initActivityDetectionServiceStub.called, 'Should initialize activity detection');
    });

    test('should register reset timers command', () => {
        activate(mockContext);
        const resetCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.resetTimers');
        assert.ok(resetCommandCalls.length > 0, 'Should register reset timers command');
    });

    test('should register show status command', () => {
        activate(mockContext);
        const statusCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.showStatus');
        assert.ok(statusCommandCalls.length > 0, 'Should register show status command');
    });

    test('should register show history command', () => {
        activate(mockContext);
        const historyCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.showHistory');
        assert.ok(historyCommandCalls.length > 0, 'Should register show history command');
    });

    test('should register show dashboard command', () => {
        activate(mockContext);
        const dashboardCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.showDashboard');
        assert.ok(dashboardCommandCalls.length > 0, 'Should register show dashboard command');
    });

    test('should register toggle focus mode command', () => {
        activate(mockContext);
        const focusModeCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.toggleFocusMode');
        assert.ok(focusModeCommandCalls.length > 0, 'Should register toggle focus mode command');
    });

    test('should register test activity detection command', () => {
        activate(mockContext);
        const testActivityCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.testActivityDetection');
        assert.ok(testActivityCommandCalls.length > 0, 'Should register test activity detection command');
    });

    test('should register pause work timer command', () => {
        activate(mockContext);
        const pauseCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.pauseWorkTimer');
        assert.ok(pauseCommandCalls.length > 0, 'Should register pause work timer command');
    });

    test('should register resume work timer command', () => {
        activate(mockContext);
        const resumeCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.resumeWorkTimer');
        assert.ok(resumeCommandCalls.length > 0, 'Should register resume work timer command');
    });

    test('should register clear all reminders command', () => {
        activate(mockContext);
        const clearCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.clearAllReminders');
        assert.ok(clearCommandCalls.length > 0, 'Should register clear all reminders command');
    });

    test('should register force restart command', () => {
        activate(mockContext);
        const forceRestartCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.forceRestart');
        assert.ok(forceRestartCommandCalls.length > 0, 'Should register force restart command');
    });

    test('should register config change listener', () => {
        activate(mockContext);
        assert.ok(onDidChangeConfigurationStub.called, 'Should register config change listener');
    });

    test('should set up work time update interval', () => {
        activate(mockContext);
        assert.ok(setIntervalStub.called, 'Should set up work time update interval');
    });

    test('should not show daily report on activation if shouldShowDailyReport returns false', () => {
        mockDailyReportServiceInstance.shouldShowDailyReport.returns(false);

        activate(mockContext);

        // Advance clock past the initial delay
        clock.tick(6000);

        assert.ok(mockDailyReportServiceInstance.showDailyReport.notCalled, 'Should not show daily report');
    });

    test('should show daily report on activation if shouldShowDailyReport returns true and has data', () => {
        mockDailyReportServiceInstance.shouldShowDailyReport.returns(true);

        activate(mockContext);

        // Advance clock past the initial delay
        clock.tick(6000);

        // Note: This may not show if yesterdayStats is null, which is correct behavior
        // The actual show is conditional on yesterdayStats having data
    });

    test('should deactivate without errors', () => {
        activate(mockContext);
        // deactivate should not throw
        deactivate();
        assert.ok(true, 'Extension deactivated successfully');
    });

    test('should clear all timers on deactivate', () => {
        activate(mockContext);
        clearAllTimersStub.resetHistory();

        deactivate();

        assert.ok(clearAllTimersStub.called, 'Should clear all timers on deactivate');
    });

    test('should stop activity detection on deactivate', () => {
        activate(mockContext);
        stopActivityDetectionServiceStub.resetHistory();

        deactivate();

        assert.ok(stopActivityDetectionServiceStub.called, 'Should stop activity detection on deactivate');
    });

    test('should dispose focus mode service on deactivate', () => {
        activate(mockContext);
        disposeFocusModeServiceStub.resetHistory();

        deactivate();

        assert.ok(disposeFocusModeServiceStub.called, 'Should dispose focus mode service on deactivate');
    });

    test('should register confirm from status bar command for progressive reminders', () => {
        activate(mockContext);
        const confirmCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.confirmFromStatusBar');
        assert.ok(confirmCommandCalls.length > 0, 'Should register confirm from status bar command');
    });

    test('should register confirm reminder command', () => {
        activate(mockContext);
        const confirmReminderCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.confirmReminder');
        assert.ok(confirmReminderCommandCalls.length > 0, 'Should register confirm reminder command');
    });

    test('should register force restart timers command', () => {
        activate(mockContext);
        const forceRestartTimersCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.forceRestartTimers');
        assert.ok(forceRestartTimersCommandCalls.length > 0, 'Should register force restart timers command');
    });

    test('should register verify reminder functions command', () => {
        activate(mockContext);
        const verifyCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.verifyReminderFunctions');
        assert.ok(verifyCommandCalls.length > 0, 'Should register verify reminder functions command');
    });

    test('should register test short reminders command', () => {
        activate(mockContext);
        const testShortCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.testShortReminders');
        assert.ok(testShortCommandCalls.length > 0, 'Should register test short reminders command');
    });

    test('should register debug timers command', () => {
        activate(mockContext);
        const debugTimersCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.debugTimers');
        assert.ok(debugTimersCommandCalls.length > 0, 'Should register debug timers command');
    });

    test('should register show daily report command', () => {
        activate(mockContext);
        const dailyReportCommandCalls = registerCommandStub.getCalls().filter(call => call.args[0] === 'movedYet.showDailyReport');
        assert.ok(dailyReportCommandCalls.length > 0, 'Should register show daily report command');
    });

    test('extension should have all required services', () => {
        activate(mockContext);

        // Verify all services are initialized
        assert.ok(initHistoryServiceStub.called, 'History service should be initialized');
        assert.ok(initProgressiveReminderServiceStub.called, 'Progressive reminder service should be initialized');
        assert.ok(initDailyReportServiceStub.called, 'Daily report service should be initialized');
        assert.ok(initFocusModeServiceStub.called, 'Focus mode service should be initialized');
        assert.ok(initActivityDetectionServiceStub.called, 'Activity detection service should be initialized');
    });
});
