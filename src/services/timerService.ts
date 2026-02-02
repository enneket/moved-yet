import { TimerState } from '../models/types';
import { getConfig } from './configService';

/**
 * 提醒函数类型定义
 * 用于定义不带参数的回调函数
 */
type ReminderFunction = () => void;

/**
 * 提醒函数引用
 * 这种设计模式避免了循环依赖问题
 * 允许UI模块和服务模块之间相互调用而不产生导入循环
 */
let sitReminderFunction: ReminderFunction = () => {};
let drinkReminderFunction: ReminderFunction = () => {};

/**
 * 导出提醒函数引用（用于调试）
 */
export { sitReminderFunction, drinkReminderFunction };

/**
 * 设置久坐提醒函数
 * 由UI模块调用，注册显示久坐提醒的函数
 * 这是依赖注入的一种形式，使timerService可以触发UI操作而不直接依赖UI模块
 *
 * @param fn 提醒函数
 */
export function setSitReminderFunction(fn: ReminderFunction): void {
    sitReminderFunction = fn;
}

/**
 * 设置喝水提醒函数
 * 由UI模块调用，注册显示喝水提醒的函数
 *
 * @param fn 提醒函数
 */
export function setDrinkReminderFunction(fn: ReminderFunction): void {
    drinkReminderFunction = fn;
}

/**
 * 计时器状态
 * 存储当前活跃的计时器和开始时间
 * 用于跟踪计时器状态和计算剩余时间
 */
export let timerState: TimerState = {
    sitTimer: null,
    drinkTimer: null,
    sitStartTime: Date.now(),
    drinkStartTime: Date.now(),
    progressiveTimer: null,
    progressiveLevel: 0,
};

/**
 * 启动所有计时器
 * 根据配置启动久坐和喝水提醒计时器
 * 在插件激活时和配置变更时调用
 */
export function startTimers(): void {
    console.log('startTimers() 被调用');
    const config = getConfig();
    console.log('配置信息:', { enableSit: config.enableSit, sitInterval: config.sitInterval, enableDrink: config.enableDrink, drinkInterval: config.drinkInterval });
    
    startSitTimer(config.sitInterval, config.enableSit);
    startDrinkTimer(config.drinkInterval, config.enableDrink);
    
    console.log('计时器启动完成，当前状态:', { 
        sitTimer: timerState.sitTimer ? 'created' : 'null', 
        drinkTimer: timerState.drinkTimer ? 'created' : 'null' 
    });
}

/**
 * 启动久坐提醒计时器
 * 根据配置的时间间隔设置计时器
 * 计时器到期时会调用注册的提醒函数
 *
 * @param interval 时间间隔（分钟）
 * @param enabled 是否启用
 */
function startSitTimer(interval: number, enabled: boolean): void {
    console.log(`startSitTimer 被调用: interval=${interval}, enabled=${enabled}`);
    
    if (!enabled) {
        console.log('久坐提醒已禁用，跳过计时器创建');
        return;
    }

    timerState.sitTimer = setTimeout(() => {
        console.log('久坐提醒计时器触发');
        sitReminderFunction();
    }, interval * 60 * 1000);
    timerState.sitStartTime = Date.now();
    
    console.log(`久坐计时器已创建: ID=${timerState.sitTimer}, 将在${interval}分钟后触发`);
}

/**
 * 启动喝水提醒计时器
 * 根据配置的时间间隔设置计时器
 * 计时器到期时会调用注册的提醒函数
 *
 * @param interval 时间间隔（分钟）
 * @param enabled 是否启用
 */
function startDrinkTimer(interval: number, enabled: boolean): void {
    console.log(`startDrinkTimer 被调用: interval=${interval}, enabled=${enabled}`);
    
    if (!enabled) {
        console.log('喝水提醒已禁用，跳过计时器创建');
        return;
    }

    timerState.drinkTimer = setTimeout(() => {
        console.log('喝水提醒计时器触发');
        drinkReminderFunction();
    }, interval * 60 * 1000);
    timerState.drinkStartTime = Date.now();
    
    console.log(`喝水计时器已创建: ID=${timerState.drinkTimer}, 将在${interval}分钟后触发`);
}

/**
 * 重启所有计时器
 * 清除现有计时器并重新启动
 */
export function restartTimers(): void {
    clearAllTimers();
    startTimers();
}

/**
 * 清除所有计时器
 * 停止所有活跃的计时器
 * 在插件停用或重置计时器时调用
 */
export function clearAllTimers(): void {
    clearSitTimer();
    clearDrinkTimer();
}

/**
 * 清除久坐计时器
 * 停止久坐提醒计时器
 */
function clearSitTimer(): void {
    if (timerState.sitTimer) {
        clearTimeout(timerState.sitTimer);
        timerState.sitTimer = null;
    }
}

/**
 * 清除喝水计时器
 * 停止喝水提醒计时器
 */
function clearDrinkTimer(): void {
    if (timerState.drinkTimer) {
        clearTimeout(timerState.drinkTimer);
        timerState.drinkTimer = null;
    }
}

/**
 * 重置所有计时器
 * 清除并重新启动所有计时器
 * 在配置变更或用户手动重置时调用
 */
export function resetAllTimers(): void {
    clearAllTimers();
    startTimers();
}

/**
 * 重置久坐计时器
 * 当用户确认久坐提醒后调用
 * 清除现有计时器并根据最新配置重新启动
 */
export function resetSitTimer(): void {
    const config = getConfig();

    // 清除现有计时器
    clearSitTimer();

    // 重新启动计时器（使用最新配置）
    if (config.enableSit) {
        startSitTimer(config.sitInterval, true);
    }
}

/**
 * 重置喝水计时器
 * 当用户确认喝水提醒后调用
 * 清除现有计时器并根据最新配置重新启动
 */
export function resetDrinkTimer(): void {
    const config = getConfig();

    // 清除现有计时器
    clearDrinkTimer();

    // 重新启动计时器（使用最新配置）
    if (config.enableDrink) {
        startDrinkTimer(config.drinkInterval, true);
    }
}
