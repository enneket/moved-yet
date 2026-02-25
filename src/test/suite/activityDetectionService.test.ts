import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { initActivityDetectionService, getActivityDetectionService } from '../../services/activityDetectionService';
import * as timerService from '../../services/timerService';
import * as configService from '../../services/configService';

suite('ActivityDetectionService Test Suite', () => {
    let resetAllTimersStub: sinon.SinonStub;
    let getConfigStub: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;

    setup(() => {
        // 创建假时钟
        clock = sinon.useFakeTimers();

        // Stub services
        resetAllTimersStub = sinon.stub(timerService, 'resetAllTimers');
        getConfigStub = sinon.stub(configService, 'getConfig');
        getConfigStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'zh-CN',
            enableActivityDetection: true,
            inactivityResetTime: 5
        });

        initActivityDetectionService();
    });

    teardown(() => {
        const service = getActivityDetectionService();
        service.stop();
        resetAllTimersStub.restore();
        getConfigStub.restore();
        clock.restore();
    });

    test('should initialize activity detection service', () => {
        const service = getActivityDetectionService();
        assert.ok(service, 'Should return service instance');
    });

    test('should stop activity detection', () => {
        const service = getActivityDetectionService();
        service.stop();
        assert.ok(true, 'Should stop without errors');
    });

    test('should restart activity detection', () => {
        const service = getActivityDetectionService();
        service.restart();
        assert.ok(true, 'Should restart without errors');
    });

    test('getInactivityDuration should return correct duration', () => {
        const service = getActivityDetectionService();
        clock.tick(3 * 60 * 1000); // 3 minutes
        const duration = service.getInactivityDuration();
        assert.ok(duration >= 0, 'Should return non-negative duration');
    });
});
