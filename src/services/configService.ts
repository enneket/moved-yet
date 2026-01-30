import * as vscode from 'vscode';
import { Config } from '../models/types';
import { languages } from '../utils/languages';
import { LanguageTexts } from '../models/types';

export function getConfig(): Config {
    const config = vscode.workspace.getConfiguration('movedYet');
    return {
        sitInterval: config.get<number>('sitReminderInterval', 60),
        drinkInterval: config.get<number>('drinkReminderInterval', 45),
        enableSit: config.get<boolean>('enableSitReminder', true),
        enableDrink: config.get<boolean>('enableDrinkReminder', true),
        language: config.get<string>('language', 'zh-CN'),
        enableProgressiveReminder: config.get<boolean>('enableProgressiveReminder', false),
        enableHistory: config.get<boolean>('enableHistory', true),
        progressiveReminderLevel1Duration: config.get<number>('progressiveReminderLevel1Duration', 5),
        progressiveReminderLevel2Duration: config.get<number>('progressiveReminderLevel2Duration', 5),
    };
}

export function getTexts(): LanguageTexts {
    const config = getConfig();
    return languages[config.language] || languages['zh-CN'];
}
