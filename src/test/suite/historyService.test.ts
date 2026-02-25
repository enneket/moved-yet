import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { HistoryService } from '../../services/historyService';

suite('HistoryService Test Suite', () => {
    let service: HistoryService;
    let mockContext: vscode.ExtensionContext;
    let globalStateGetStub: sinon.SinonStub;
    let globalStateUpdateStub: sinon.SinonStub;

    setup(() => {
        globalStateGetStub = sinon.stub();
        globalStateUpdateStub = sinon.stub().callsFake(async (key, value) => {
            // Update the stub to return the new value
            globalStateGetStub.withArgs(key).returns(value);
            return Promise.resolve();
        });

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

        // Default: no existing history
        globalStateGetStub.returns(undefined);

        service = new HistoryService(mockContext);
    });

    teardown(() => {
        sinon.restore();
    });

    test('should initialize with empty history', () => {
        const history = service.getHistory();
        assert.ok(history.dailyStats, 'Should have dailyStats object');
        assert.strictEqual(Object.keys(history.dailyStats).length, 0, 'Should have no history entries');
    });

    test('should load existing history from global state', () => {
        const existingHistory = {
            dailyStats: {
                '2026-02-24': {
                    date: '2026-02-24',
                    sitCount: 5,
                    drinkCount: 8,
                    workTimeMinutes: 480,
                    records: []
                }
            },
            totalSitReminders: 5,
            totalDrinkReminders: 8,
            totalWorkTime: 480
        };
        globalStateGetStub.returns(existingHistory);

        service = new HistoryService(mockContext);
        const history = service.getHistory();

        assert.strictEqual(history.dailyStats['2026-02-24'].sitCount, 5);
        assert.strictEqual(history.dailyStats['2026-02-24'].drinkCount, 8);
        assert.strictEqual(history.dailyStats['2026-02-24'].workTimeMinutes, 480);
    });

    test('should record sit reminder', async () => {
        await service.recordReminder('sit', true);
        
        // Need to get fresh history after recording
        const history = service.getHistory();
        const today = new Date().toISOString().split('T')[0];

        assert.ok(history.dailyStats[today], 'Should have today stats');
        assert.strictEqual(history.dailyStats[today].sitCount, 1);
        assert.ok(globalStateUpdateStub.called, 'Should save to global state');
    });

    test('should record drink reminder', async () => {
        await service.recordReminder('drink', true);
        
        const history = service.getHistory();
        const today = new Date().toISOString().split('T')[0];

        assert.ok(history.dailyStats[today], 'Should have today stats');
        assert.strictEqual(history.dailyStats[today].drinkCount, 1);
        assert.ok(globalStateUpdateStub.called, 'Should save to global state');
    });

    test('should update work time', async () => {
        await service.updateWorkTime();
        assert.ok(globalStateUpdateStub.called, 'Should save to global state');
    });

    test('should handle multiple reminders on same day', async () => {
        await service.recordReminder('sit', true);
        await service.recordReminder('sit', true);
        await service.recordReminder('drink', true);
        
        const history = service.getHistory();
        const today = new Date().toISOString().split('T')[0];

        assert.ok(history.dailyStats[today], 'Should have today stats');
        assert.strictEqual(history.dailyStats[today].sitCount, 2);
        assert.strictEqual(history.dailyStats[today].drinkCount, 1);
    });

    test('should get yesterday stats', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        globalStateGetStub.returns({
            dailyStats: {
                [yesterdayStr]: {
                    date: yesterdayStr,
                    sitCount: 3,
                    drinkCount: 5,
                    workTimeMinutes: 360,
                    records: []
                }
            },
            totalSitReminders: 3,
            totalDrinkReminders: 5,
            totalWorkTime: 360
        });

        service = new HistoryService(mockContext);
        const stats = service.getYesterdayStats();

        assert.ok(stats, 'Should return stats');
        if (stats) {
            assert.strictEqual(stats.sitCount, 3);
            assert.strictEqual(stats.drinkCount, 5);
            assert.strictEqual(stats.workTimeMinutes, 360);
        }
    });

    test('should return null for yesterday if no data', () => {
        const stats = service.getYesterdayStats();
        assert.strictEqual(stats, null, 'Should return null when no data');
    });
});
