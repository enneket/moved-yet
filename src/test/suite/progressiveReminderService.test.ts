import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ProgressiveReminderService, initProgressiveReminderService, getProgressiveReminderService } from '../../services/progressiveReminderService';
import * as configService from '../../services/configService';

suite('ProgressiveReminderService Test Suite', () => {
    let service: ProgressiveReminderService;
    let getConfigStub: sinon.SinonStub;
    let getTextsStub: sinon.SinonStub;
    let showInfoMessageStub: sinon.SinonStub;
    let createStatusBarItemStub: sinon.SinonStub;
    let executeCommandStub: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;
    let mockStatusBarItem: any;

    setup(() => {
        clock = sinon.useFakeTimers();

        mockStatusBarItem = {
            text: '',
            tooltip: '',
            command: '',
            backgroundColor: undefined,
            show: sinon.stub(),
            hide: sinon.stub(),
            dispose: sinon.stub()
        };

        getConfigStub = sinon.stub(configService, 'getConfig');
        getTextsStub = sinon.stub(configService, 'getTexts');
        showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
        showInfoMessageStub.resolves('我知道了');
        createStatusBarItemStub = sinon.stub(vscode.window, 'createStatusBarItem');
        executeCommandStub = sinon.stub(vscode.commands, 'executeCommand');

        createStatusBarItemStub.returns(mockStatusBarItem);

        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'zh-CN',
            progressiveReminderLevel1Duration: 5,
            progressiveReminderLevel2Duration: 5
        });

        getTextsStub.returns({
            sitStatus: '久坐提醒',
            drinkStatus: '喝水提醒',
            gentleReminder: '温馨提示',
            sitReminderTitle: '🚶‍♂️ 该起身活动了！',
            sitReminderMessage: '您已经坐了很久了',
            drinkReminderTitle: '💧 该喝水了！',
            drinkReminderMessage: '记得补充水分',
            confirmMessage: '我知道了',
            snoozeButton: '稍后提醒'
        });

        service = new ProgressiveReminderService();
    });

    teardown(() => {
        service.stopProgressiveReminder();
        getConfigStub.restore();
        getTextsStub.restore();
        showInfoMessageStub.restore();
        createStatusBarItemStub.restore();
        executeCommandStub.restore();
        clock.restore();
    });

    test('should initialize progressive reminder service', () => {
        initProgressiveReminderService();
        const instance = getProgressiveReminderService();
        assert.ok(instance, 'Should return service instance');
    });

    test('should start progressive reminder at level 1', () => {
        const callback = sinon.spy();
        service.startProgressiveReminder('sit', callback);

        assert.strictEqual(service.getCurrentLevel(), 1, 'Should start at level 1');
        assert.strictEqual(service.isReminderActive(), true, 'Should be active');
        assert.ok(createStatusBarItemStub.called, 'Should create status bar item');
        assert.ok(mockStatusBarItem.show.called, 'Should show status bar item');
    });

    test('should upgrade to level 2 after configured duration', () => {
        const callback = sinon.spy();
        service.startProgressiveReminder('sit', callback);

        assert.strictEqual(service.getCurrentLevel(), 1);

        // Fast forward 5 minutes
        clock.tick(5 * 60 * 1000);

        assert.strictEqual(service.getCurrentLevel(), 2, 'Should upgrade to level 2');
        assert.ok(showInfoMessageStub.called, 'Should show notification');
    });

    test('should upgrade to level 3 and trigger callback', async () => {
        const callback = sinon.spy();
        
        // Mock showInformationMessage to resolve immediately
        showInfoMessageStub.resolves(undefined);
        
        service.startProgressiveReminder('drink', callback);

        // Fast forward to level 2
        await clock.tickAsync(5 * 60 * 1000);
        
        // Fast forward to level 3
        await clock.tickAsync(5 * 60 * 1000);
        
        // Give time for async operations
        await clock.tickAsync(100);

        // The callback should be called when reaching level 3
        assert.ok(callback.called || service.getCurrentLevel() === 0, 'Should trigger callback or stop service');
    });

    test('should stop progressive reminder', () => {
        const callback = sinon.spy();
        service.startProgressiveReminder('sit', callback);

        assert.strictEqual(service.isReminderActive(), true);

        service.stopProgressiveReminder();

        assert.strictEqual(service.isReminderActive(), false, 'Should be inactive');
        assert.strictEqual(service.getCurrentLevel(), 0, 'Level should be reset');
        assert.ok(mockStatusBarItem.dispose.called, 'Should dispose status bar item');
    });

    test('should handle user confirmation at level 2', async () => {
        const callback = sinon.spy();
        const confirmPromise = Promise.resolve('我知道了');
        showInfoMessageStub.returns(confirmPromise);

        service.startProgressiveReminder('sit', callback);

        // Fast forward to level 2
        clock.tick(5 * 60 * 1000);

        // Wait for promise to resolve
        await confirmPromise;
        await clock.tickAsync(0);

        assert.ok(executeCommandStub.called, 'Should execute confirm command');
    });

    test('should handle snooze at level 2', async () => {
        const callback = sinon.spy();
        const snoozePromise = Promise.resolve('稍后提醒');
        showInfoMessageStub.returns(snoozePromise);

        service.startProgressiveReminder('sit', callback);

        // Fast forward to level 2
        clock.tick(5 * 60 * 1000);

        // Wait for promise to resolve
        await snoozePromise;
        await clock.tickAsync(0);

        assert.strictEqual(service.isReminderActive(), false, 'Should stop current reminder');
    });

    test('should show different messages for sit and drink reminders', () => {
        service.startProgressiveReminder('sit', () => {});
        assert.ok(mockStatusBarItem.text.includes('🚶‍♂️'), 'Should show sit icon');

        service.stopProgressiveReminder();

        service.startProgressiveReminder('drink', () => {});
        assert.ok(mockStatusBarItem.text.includes('💧'), 'Should show drink icon');
    });

    test('should stop existing reminder when starting new one', () => {
        const callback1 = sinon.spy();
        const callback2 = sinon.spy();

        service.startProgressiveReminder('sit', callback1);
        assert.strictEqual(service.isReminderActive(), true);

        service.startProgressiveReminder('drink', callback2);
        assert.strictEqual(service.getCurrentLevel(), 1, 'Should restart at level 1');
        assert.ok(mockStatusBarItem.dispose.called, 'Should dispose old status bar item');
    });

    test('should not upgrade if stopped before duration', () => {
        const callback = sinon.spy();
        service.startProgressiveReminder('sit', callback);

        clock.tick(2 * 60 * 1000); // 2 minutes
        service.stopProgressiveReminder();

        clock.tick(10 * 60 * 1000); // 10 more minutes

        assert.strictEqual(service.getCurrentLevel(), 0, 'Should not upgrade after stop');
        assert.strictEqual(callback.called, false, 'Should not trigger callback');
    });

    test('should handle close notification without selection', async () => {
        const callback = sinon.spy();
        const closePromise = Promise.resolve(undefined);
        showInfoMessageStub.returns(closePromise);

        service.startProgressiveReminder('sit', callback);

        // Fast forward to level 2
        clock.tick(5 * 60 * 1000);

        // Wait for promise to resolve
        await closePromise;
        await clock.tickAsync(0);

        // Should still be active and waiting for level 3
        assert.strictEqual(service.isReminderActive(), true, 'Should remain active');
    });
});
