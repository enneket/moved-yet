import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as focusModeService from '../../services/focusModeService';
import * as timerService from '../../services/timerService';
import * as configService from '../../services/configService';

suite('FocusModeService Test Suite', () => {
    let clearAllTimersStub: sinon.SinonStub;
    let startTimersStub: sinon.SinonStub;
    let getConfigStub: sinon.SinonStub;
    let getTextsStub: sinon.SinonStub;
    let showInfoMessageStub: sinon.SinonStub;
    let showInputBoxStub: sinon.SinonStub;
    let createStatusBarItemStub: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;
    let mockContext: vscode.ExtensionContext;
    let mockStatusBarItem: any;

    setup(() => {
        clock = sinon.useFakeTimers();

        mockContext = {
            subscriptions: [],
            globalState: {
                get: sinon.stub(),
                update: sinon.stub(),
                keys: sinon.stub().returns([]),
                setKeysForSync: sinon.stub()
            }
        } as any;

        mockStatusBarItem = {
            text: '',
            tooltip: '',
            command: '',
            show: sinon.stub(),
            hide: sinon.stub(),
            dispose: sinon.stub()
        };

        clearAllTimersStub = sinon.stub(timerService, 'clearAllTimers');
        startTimersStub = sinon.stub(timerService, 'startTimers');
        getConfigStub = sinon.stub(configService, 'getConfig');
        getTextsStub = sinon.stub(configService, 'getTexts');
        showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
        showInputBoxStub = sinon.stub(vscode.window, 'showInputBox');
        createStatusBarItemStub = sinon.stub(vscode.window, 'createStatusBarItem');

        createStatusBarItemStub.returns(mockStatusBarItem);

        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'zh-CN',
            focusModeDefaultDuration: 60
        });

        getTextsStub.returns({
            focusModeStarted: '专注模式已启动',
            focusModeEnded: '专注模式已结束',
            focusModeActive: '专注中',
            focusModeRemaining: '剩余时间',
            enterFocusMode: '进入专注模式',
            focusModePrompt: '请输入专注时长（分钟）',
            minutesLater: '分钟后'
        });
    });

    teardown(() => {
        focusModeService.disposeFocusModeService();
        clearAllTimersStub.restore();
        startTimersStub.restore();
        getConfigStub.restore();
        getTextsStub.restore();
        showInfoMessageStub.restore();
        showInputBoxStub.restore();
        createStatusBarItemStub.restore();
        clock.restore();
    });

    test('should initialize focus mode service', () => {
        focusModeService.initFocusModeService(mockContext);
        assert.ok(createStatusBarItemStub.called, 'Should create status bar item');
        assert.ok(mockStatusBarItem.show.called, 'Should show status bar item');
    });

    test('should start focus mode', () => {
        focusModeService.initFocusModeService(mockContext);
        focusModeService.startFocusMode(30);

        const state = focusModeService.getFocusModeState();
        assert.strictEqual(state.isActive, true, 'Focus mode should be active');
        assert.strictEqual(state.duration, 30, 'Duration should be 30 minutes');
        assert.ok(clearAllTimersStub.called, 'Should clear all timers');
        assert.ok(showInfoMessageStub.called, 'Should show info message');
    });

    test('should not start focus mode if already active', () => {
        focusModeService.initFocusModeService(mockContext);
        focusModeService.startFocusMode(30);
        clearAllTimersStub.resetHistory();

        focusModeService.startFocusMode(60);
        assert.strictEqual(clearAllTimersStub.called, false, 'Should not clear timers again');
    });

    test('should end focus mode', () => {
        focusModeService.initFocusModeService(mockContext);
        focusModeService.startFocusMode(30);
        focusModeService.endFocusMode();

        const state = focusModeService.getFocusModeState();
        assert.strictEqual(state.isActive, false, 'Focus mode should be inactive');
        assert.ok(startTimersStub.called, 'Should restart timers');
    });

    test('should not end focus mode if not active', () => {
        focusModeService.initFocusModeService(mockContext);
        focusModeService.endFocusMode();

        assert.strictEqual(startTimersStub.called, false, 'Should not restart timers');
    });

    test('should automatically end focus mode after duration', () => {
        focusModeService.initFocusModeService(mockContext);
        focusModeService.startFocusMode(30);

        clock.tick(30 * 60 * 1000);

        const state = focusModeService.getFocusModeState();
        assert.strictEqual(state.isActive, false, 'Focus mode should end automatically');
        assert.ok(startTimersStub.called, 'Should restart timers');
    });

    test('should toggle focus mode on', async () => {
        focusModeService.initFocusModeService(mockContext);
        showInputBoxStub.resolves('45');

        await focusModeService.toggleFocusMode();

        const state = focusModeService.getFocusModeState();
        assert.strictEqual(state.isActive, true, 'Focus mode should be active');
        assert.strictEqual(state.duration, 45, 'Duration should be 45 minutes');
    });

    test('should toggle focus mode off', async () => {
        focusModeService.initFocusModeService(mockContext);
        focusModeService.startFocusMode(30);

        await focusModeService.toggleFocusMode();

        const state = focusModeService.getFocusModeState();
        assert.strictEqual(state.isActive, false, 'Focus mode should be inactive');
    });

    test('should cancel toggle if input is cancelled', async () => {
        focusModeService.initFocusModeService(mockContext);
        showInputBoxStub.resolves(undefined);

        await focusModeService.toggleFocusMode();

        const state = focusModeService.getFocusModeState();
        assert.strictEqual(state.isActive, false, 'Focus mode should remain inactive');
    });

    test('should check if focus mode is active', () => {
        focusModeService.initFocusModeService(mockContext);
        assert.strictEqual(focusModeService.isFocusModeActive(), false);

        focusModeService.startFocusMode(30);
        assert.strictEqual(focusModeService.isFocusModeActive(), true);

        focusModeService.endFocusMode();
        assert.strictEqual(focusModeService.isFocusModeActive(), false);
    });

    test('should get remaining minutes', () => {
        focusModeService.initFocusModeService(mockContext);
        focusModeService.startFocusMode(30);

        assert.strictEqual(focusModeService.getRemainingMinutes(), 30);

        clock.tick(10 * 60 * 1000);
        assert.strictEqual(focusModeService.getRemainingMinutes(), 20);

        clock.tick(20 * 60 * 1000);
        assert.strictEqual(focusModeService.getRemainingMinutes(), 0);
    });

    test('should return 0 remaining minutes when not active', () => {
        focusModeService.initFocusModeService(mockContext);
        assert.strictEqual(focusModeService.getRemainingMinutes(), 0);
    });

    test('should update status bar during focus mode', () => {
        focusModeService.initFocusModeService(mockContext);
        focusModeService.startFocusMode(30);

        assert.ok(mockStatusBarItem.text.includes('专注中'), 'Status bar should show focus mode');
        assert.ok(mockStatusBarItem.text.includes('30'), 'Status bar should show remaining time');
    });

    test('should dispose focus mode service', () => {
        focusModeService.initFocusModeService(mockContext);
        focusModeService.startFocusMode(30);
        focusModeService.disposeFocusModeService();

        assert.ok(mockStatusBarItem.dispose.called, 'Should dispose status bar item');
    });
});
