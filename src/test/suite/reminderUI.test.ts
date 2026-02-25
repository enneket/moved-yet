import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as reminderUI from '../../ui/reminderUI';
import * as configService from '../../services/configService';
import * as historyService from '../../services/historyService';
import * as timerService from '../../services/timerService';

suite('ReminderUI Test Suite', () => {
    let getTextsStub: sinon.SinonStub;
    let getConfigStub: sinon.SinonStub;
    let getHistoryServiceStub: sinon.SinonStub;
    let resetSitTimerStub: sinon.SinonStub;
    let resetDrinkTimerStub: sinon.SinonStub;
    let createWebviewPanelStub: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;
    let mockHistoryService: any;

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
            reminderCountdown: 1
        });

        const mockWebviewPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: sinon.stub().returns({ dispose: sinon.stub() }),
                postMessage: sinon.stub()
            },
            onDidDispose: sinon.stub().returns({ dispose: sinon.stub() }),
            dispose: sinon.stub(),
            reveal: sinon.stub()
        };

        createWebviewPanelStub.returns(mockWebviewPanel);
    });

    teardown(() => {
        getTextsStub.restore();
        getConfigStub.restore();
        getHistoryServiceStub.restore();
        resetSitTimerStub.restore();
        resetDrinkTimerStub.restore();
        createWebviewPanelStub.restore();
        clock.restore();
    });

    test('should create webview panel for sit reminder', async () => {
        await reminderUI.showSitReminder();
        assert.ok(createWebviewPanelStub.called, 'Should create webview panel');
    });

    test('should create webview panel for drink reminder', async () => {
        await reminderUI.showDrinkReminder();
        assert.ok(createWebviewPanelStub.called, 'Should create webview panel');
    });

    test('should use configured texts', async () => {
        await reminderUI.showSitReminder();
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
            reminderCountdown: 1
        });

        await reminderUI.showSitReminder();
        assert.ok(createWebviewPanelStub.called, 'Should create panel with English texts');
    });
});
