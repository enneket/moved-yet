import * as assert from 'assert';
import { languages } from '../../utils/languages';

suite('Languages Test Suite', () => {
    test('should have Chinese language texts', () => {
        const zhCN = languages['zh-CN'];
        assert.ok(zhCN, 'Should have zh-CN language');
        assert.strictEqual(zhCN.sitReminderTitle, '🚶‍♂️ 该起身活动了！');
        assert.strictEqual(zhCN.drinkReminderTitle, '💧 该喝水了！');
    });

    test('should have English language texts', () => {
        const en = languages.en;
        assert.ok(en, 'Should have en language');
        assert.strictEqual(en.sitReminderTitle, '🚶‍♂️ Time to Stand Up!');
        assert.strictEqual(en.drinkReminderTitle, '💧 Time to Drink Water!');
    });

    test('should have all required Chinese text keys', () => {
        const zhCN = languages['zh-CN'];
        const requiredKeys = [
            'sitReminderTitle',
            'sitReminderMessage',
            'sitReminderButton',
            'drinkReminderTitle',
            'drinkReminderMessage',
            'drinkReminderButton',
            'confirmMessage',
            'resetMessage',
            'statusTitle',
            'sitStatus',
            'drinkStatus',
            'disabled',
            'minutesLater',
            'comingSoon',
            'waitSeconds',
            'snoozeButton',
            'gentleReminder',
            'urgentReminder',
            'historyTitle',
            'todayStats',
            'weekStats',
            'totalSit',
            'totalDrink',
            'workTime',
            'noHistory',
            'viewHistory',
            'viewDashboard',
            'focusModeActive',
            'focusModeEnded',
            'focusModeStarted',
            'focusModeRemaining',
            'enterFocusMode',
            'exitFocusMode',
            'focusModePrompt'
        ];

        for (const key of requiredKeys) {
            assert.ok(zhCN[key], `Should have Chinese text for key: ${key}`);
            assert.strictEqual(typeof zhCN[key], 'string', `${key} should be a string`);
            assert.ok(zhCN[key].length > 0, `${key} should not be empty`);
        }
    });

    test('should have all required English text keys', () => {
        const en = languages.en;
        const requiredKeys = [
            'sitReminderTitle',
            'sitReminderMessage',
            'sitReminderButton',
            'drinkReminderTitle',
            'drinkReminderMessage',
            'drinkReminderButton',
            'confirmMessage',
            'resetMessage',
            'statusTitle',
            'sitStatus',
            'drinkStatus',
            'disabled',
            'minutesLater',
            'comingSoon',
            'waitSeconds',
            'snoozeButton',
            'gentleReminder',
            'urgentReminder',
            'historyTitle',
            'todayStats',
            'weekStats',
            'totalSit',
            'totalDrink',
            'workTime',
            'noHistory',
            'viewHistory',
            'viewDashboard',
            'focusModeActive',
            'focusModeEnded',
            'focusModeStarted',
            'focusModeRemaining',
            'enterFocusMode',
            'exitFocusMode',
            'focusModePrompt'
        ];

        for (const key of requiredKeys) {
            assert.ok(en[key], `Should have English text for key: ${key}`);
            assert.strictEqual(typeof en[key], 'string', `${key} should be a string`);
            assert.ok(en[key].length > 0, `${key} should not be empty`);
        }
    });

    test('should have same keys in both languages', () => {
        const zhKeys = Object.keys(languages['zh-CN']).sort();
        const enKeys = Object.keys(languages.en).sort();

        assert.deepStrictEqual(zhKeys, enKeys, 'Both languages should have the same keys');
    });

    test('should have emoji icons in titles', () => {
        const zhCN = languages['zh-CN'];
        const en = languages.en;

        assert.ok(zhCN.sitReminderTitle.includes('🚶‍♂️'), 'Chinese sit title should have emoji');
        assert.ok(zhCN.drinkReminderTitle.includes('💧'), 'Chinese drink title should have emoji');
        assert.ok(en.sitReminderTitle.includes('🚶‍♂️'), 'English sit title should have emoji');
        assert.ok(en.drinkReminderTitle.includes('💧'), 'English drink title should have emoji');
    });

    test('should have consistent emoji usage across languages', () => {
        const zhCN = languages['zh-CN'];
        const en = languages.en;

        // Extract emojis from titles
        const zhSitEmoji = zhCN.sitReminderTitle.match(/[\u{1F000}-\u{1F9FF}]/u);
        const enSitEmoji = en.sitReminderTitle.match(/[\u{1F000}-\u{1F9FF}]/u);
        const zhDrinkEmoji = zhCN.drinkReminderTitle.match(/💧/);
        const enDrinkEmoji = en.drinkReminderTitle.match(/💧/);

        assert.ok(zhSitEmoji, 'Chinese sit title should have emoji');
        assert.ok(enSitEmoji, 'English sit title should have emoji');
        assert.ok(zhDrinkEmoji, 'Chinese drink title should have water emoji');
        assert.ok(enDrinkEmoji, 'English drink title should have water emoji');
    });

    test('should have non-empty messages', () => {
        const zhCN = languages['zh-CN'];
        const en = languages.en;

        assert.ok(zhCN.sitReminderMessage.length > 10, 'Chinese sit message should be substantial');
        assert.ok(zhCN.drinkReminderMessage.length > 10, 'Chinese drink message should be substantial');
        assert.ok(en.sitReminderMessage.length > 10, 'English sit message should be substantial');
        assert.ok(en.drinkReminderMessage.length > 10, 'English drink message should be substantial');
    });

    test('should have focus mode texts', () => {
        const zhCN = languages['zh-CN'];
        const en = languages.en;

        assert.ok(zhCN.focusModeActive, 'Should have Chinese focus mode active text');
        assert.ok(zhCN.enterFocusMode, 'Should have Chinese enter focus mode text');
        assert.ok(en.focusModeActive, 'Should have English focus mode active text');
        assert.ok(en.enterFocusMode, 'Should have English enter focus mode text');
    });

    test('should have history and dashboard texts', () => {
        const zhCN = languages['zh-CN'];
        const en = languages.en;

        assert.ok(zhCN.historyTitle, 'Should have Chinese history title');
        assert.ok(zhCN.viewDashboard, 'Should have Chinese view dashboard text');
        assert.ok(en.historyTitle, 'Should have English history title');
        assert.ok(en.viewDashboard, 'Should have English view dashboard text');
    });
});
