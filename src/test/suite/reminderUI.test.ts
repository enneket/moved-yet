import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { showSitReminder, showDrinkReminder } from '../../ui/reminderUI';
import * as configService from '../../services/configService';
import * as timerService from '../../services/timerService';
import * as historyService from '../../services/historyService';
import { languages } from '../../utils/languages';

suite('ReminderUI Test Suite', () => {
    let getTextsStub: sinon.SinonStub;
    let getConfigStub: sinon.SinonStub;
    let getHistoryServiceStub: sinon.SinonStub;
    let resetSitTimerStub: sinon.SinonStub;
    let resetDrinkTimerStub: sinon.SinonStub;
    let createWebviewPanelStub: sinon.SinonStub;
    let showInformationMessageStub: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;
    let mockHistoryService: any;
    let messageHandler: any;

    setup(() => {
        clock = sinon.useFakeTimers();

        mockHistoryService = {
            recordReminder: sinon.stub().resolves()
        };

        getTextsStub = sinon.stub(configService, 'getTexts');
        getConfigStub = sinon.stub(configService, 'getConfig');
        getHistoryServiceStub = sinon.stub(historyService, 'getHistoryService');
        resetSitTimerStub = sinon.stub(timerService, 'resetSitTimer');
        resetDrinkTimerStub = sinon.stub(timerService, 'resetDrinkTimer');
        showInformationMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
        createWebviewPanelStub = sinon.stub(vscode.window, 'createWebviewPanel');

        getHistoryServiceStub.returns(mockHistoryService);

        getTextsStub.returns({
            sitReminderTitle: '🚶‍♂️ 该起身活动了！',
            sitReminderMessage: '您已经坐了很久了，起来走走吧！',
            sitReminderButton: '我已经起身活动了',
            drinkReminderTitle: '💧 该喝水了！',
            drinkReminderMessage: '记得补充水分哦！',
            drinkReminderButton: '我已经喝水了',
            confirmMessage: '我知道了',
            countdown: '倒计时'
        });

        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'zh-CN',
            reminderCountdown: 1,
            enableHistory: true
        });

        let onDidReceiveMessageCallback: any;
        const mockWebviewPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: sinon.stub().callsFake((callback) => {
                    onDidReceiveMessageCallback = callback;
                    return { dispose: sinon.stub() };
                }),
                postMessage: sinon.stub()
            },
            onDidDispose: sinon.stub().returns({ dispose: sinon.stub() }),
            dispose: sinon.stub(),
            reveal: sinon.stub()
        };

        createWebviewPanelStub.returns(mockWebviewPanel);

        // Store the message handler for tests
        messageHandler = onDidReceiveMessageCallback;
    });

    teardown(() => {
        getTextsStub.restore();
        getConfigStub.restore();
        getHistoryServiceStub.restore();
        resetSitTimerStub.restore();
        resetDrinkTimerStub.restore();
        createWebviewPanelStub.restore();
        showInformationMessageStub.restore();
        clock.restore();
    });

    test('should create webview panel for sit reminder', async () => {
        await showSitReminder();
        assert.ok(createWebviewPanelStub.called, 'Should create webview panel');
    });

    test('should create webview panel for drink reminder', async () => {
        await showDrinkReminder();
        assert.ok(createWebviewPanelStub.called, 'Should create webview panel');
    });

    test('should use configured texts', async () => {
        await showSitReminder();
        assert.ok(getTextsStub.called, 'Should get texts from config');
    });

    test('should use English texts when configured', async () => {
        getTextsStub.returns({
            sitReminderTitle: '🚶‍♂️ Time to Stand Up!',
            sitReminderMessage: 'You have been sitting for a while',
            sitReminderButton: 'I have stood up',
            drinkReminderTitle: '💧 Time to Drink Water!',
            drinkReminderMessage: 'Remember to stay hydrated',
            drinkReminderButton: 'I have drunk water',
            confirmMessage: 'Got it',
            countdown: 'Countdown'
        });

        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'en',
            reminderCountdown: 1,
            enableHistory: true
        });

        await showSitReminder();
        assert.ok(createWebviewPanelStub.called, 'Should create panel with English texts');
    });

    test('should generate HTML with correct structure', async () => {
        await showSitReminder();
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('DOCTYPE html'), 'Should include DOCTYPE');
        assert.ok(mockPanel.webview.html.includes('健康提醒'), 'Should include title');
        assert.ok(mockPanel.webview.html.includes('我已经起身活动了'), 'Should include button text');
    });

    test('should include VS Code editor colors in HTML', async () => {
        await showSitReminder();
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('vscode-editor-background'), 'Should use VS Code colors');
    });

    test('should reveal panel after creation', async () => {
        await showSitReminder();
        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.reveal.called, 'Should reveal the panel');
    });

    test('should send confirm message from webview and reset timer', async () => {
        await showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        const onDidReceiveMessageCallback = mockPanel.webview.onDidReceiveMessage.getCall(0).args[0];

        // Simulate webview sending confirm message
        await onDidReceiveMessageCallback({ command: 'confirm' });

        assert.ok(resetSitTimerStub.called, 'Should reset sit timer after confirm');
        assert.ok(mockHistoryService.recordReminder.calledWith('sit', true), 'Should record sit reminder');
        assert.ok(showInformationMessageStub.called, 'Should show confirmation message');
    });

    test('should record drink reminder history on confirm', async () => {
        await showDrinkReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        const onDidReceiveMessageCallback = mockPanel.webview.onDidReceiveMessage.getCall(0).args[0];

        // Simulate webview sending confirm message
        await onDidReceiveMessageCallback({ command: 'confirm' });

        assert.ok(resetDrinkTimerStub.called, 'Should reset drink timer after confirm');
        assert.ok(mockHistoryService.recordReminder.calledWith('drink', true), 'Should record drink reminder');
    });

    test('should not record history when history is disabled', async () => {
        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'zh-CN',
            reminderCountdown: 1,
            enableHistory: false
        });

        await showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        const onDidReceiveMessageCallback = mockPanel.webview.onDidReceiveMessage.getCall(0).args[0];

        // Simulate webview sending confirm message
        await onDidReceiveMessageCallback({ command: 'confirm' });

        assert.ok(resetSitTimerStub.called, 'Should reset sit timer');
        assert.ok(mockHistoryService.recordReminder.notCalled, 'Should not record when history disabled');
    });

    test('should show Chinese confirmation message when language is zh-CN', async () => {
        await showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        const onDidReceiveMessageCallback = mockPanel.webview.onDidReceiveMessage.getCall(0).args[0];

        await onDidReceiveMessageCallback({ command: 'confirm' });

        assert.ok(showInformationMessageStub.called, 'Should show message');
        const message = showInformationMessageStub.getCall(0).args[0];
        assert.strictEqual(message, '我知道了', 'Should show Chinese confirm message');
    });

    test('should show English confirmation message when language is en', () => {
        getTextsStub.returns({
            sitReminderTitle: '🚶‍♂️ Time to Stand Up!',
            sitReminderMessage: 'You have been sitting for a while',
            sitReminderButton: 'I have stood up',
            drinkReminderTitle: '💧 Time to Drink Water!',
            drinkReminderMessage: 'Remember to stay hydrated',
            drinkReminderButton: 'I have drunk water',
            confirmMessage: 'Got it',
            countdown: 'Countdown'
        });

        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'en',
            reminderCountdown: 1,
            enableHistory: true
        });

        showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        const onDidReceiveMessageCallback = mockPanel.webview.onDidReceiveMessage.getCall(0).args[0];

        onDidReceiveMessageCallback({ command: 'confirm' });

        assert.ok(showInformationMessageStub.called, 'Should show message');
        const message = showInformationMessageStub.getCall(0).args[0];
        assert.strictEqual(message, 'Got it', 'Should show English confirm message');
    });

    test('should handle unknown message commands gracefully', async () => {
        await showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        const onDidReceiveMessageCallback = mockPanel.webview.onDidReceiveMessage.getCall(0).args[0];

        // Should not throw on unknown command
        await onDidReceiveMessageCallback({ command: 'unknown' });

        assert.ok(resetSitTimerStub.notCalled, 'Should not reset timer on unknown command');
    });

    test('should dispose panel on confirm', async () => {
        await showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        const onDidReceiveMessageCallback = mockPanel.webview.onDidReceiveMessage.getCall(0).args[0];

        await onDidReceiveMessageCallback({ command: 'confirm' });

        assert.ok(mockPanel.dispose.called, 'Should dispose panel after confirm');
    });

    test('should handle panel dispose event', async () => {
        await showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        const onDidDisposeCallback = mockPanel.onDidDispose.getCall(0).args[0];

        // Should not throw when panel is disposed
        onDidDisposeCallback();
    });

    test('should include button with correct text for sit reminder', async () => {
        await showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('我已经起身活动了'), 'Should include correct button text');
    });

    test('should include button with correct text for drink reminder', async () => {
        await showDrinkReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('我已经喝水了'), 'Should include correct button text');
    });

    test('should include animation styles', async () => {
        await showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('animation'), 'Should include animation');
    });

    test('should include responsive design styles', async () => {
        await showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('backdrop-filter'), 'Should include backdrop-filter');
    });

    test('should set correct lang attribute for Chinese', async () => {
        await showSitReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('lang="zh-CN"'), 'Should use zh-CN lang attribute');
    });

    test('should set correct lang attribute for English', async () => {
        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'en',
            reminderCountdown: 1,
            enableHistory: true
        });

        await showDrinkReminder();

        const mockPanel = createWebviewPanelStub.returnValues[0];
        assert.ok(mockPanel.webview.html.includes('lang="en"'), 'Should use en lang attribute');
    });
});
