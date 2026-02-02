import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as extension from '../../extension';
import * as timerService from '../../services/timerService';
import * as statusService from '../../services/statusService';
import * as configService from '../../services/configService';

suite('Extension Test Suite', () => {
    let resetAllTimersStub: sinon.SinonStub;
    let showCurrentStatusStub: sinon.SinonStub;
    let clearAllTimersStub: sinon.SinonStub;
    let startTimersStub: sinon.SinonStub;
    let getTextsStub: sinon.SinonStub;
    let showInfoMessageStub: sinon.SinonStub;
    let registerCommandStub: sinon.SinonStub;
    let onDidChangeConfigurationStub: sinon.SinonStub;
    let mockContext: any;
    let activityDetectionModule: any;

    setup(() => {
        // Mock activityDetectionService 模块
        activityDetectionModule = {
            getActivityDetectionService: () => ({
                restart: sinon.stub(),
                getInactivityDuration: () => 0
            })
        };
        
        // 存根服务
        resetAllTimersStub = sinon.stub(timerService, 'resetAllTimers');
        showCurrentStatusStub = sinon.stub(statusService, 'showCurrentStatus');
        clearAllTimersStub = sinon.stub(timerService, 'clearAllTimers');
        startTimersStub = sinon.stub(timerService, 'startTimers');

        // 存根配置服务
        getTextsStub = sinon.stub(configService, 'getTexts');
        getTextsStub.returns({
            resetMessage: '所有计时器已重置',
            confirmMessage: '提醒已确认，计时器已重置'
        });

        // 存根 VS Code API
        showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
        registerCommandStub = sinon.stub(vscode.commands, 'registerCommand');
        
        // 返回一个 disposable 对象
        const disposable = { dispose: sinon.stub() };
        registerCommandStub.returns(disposable);

        // 存根 VS Code 配置变更 - 返回一个 disposable 对象
        onDidChangeConfigurationStub = sinon.stub(vscode.workspace, 'onDidChangeConfiguration');
        onDidChangeConfigurationStub.returns(disposable);

        // 创建模拟扩展上下文
        mockContext = {
            subscriptions: [],
            asAbsolutePath: (path: string) => path
        };
    });

    teardown(() => {
        // 恢复所有存根
        resetAllTimersStub.restore();
        showCurrentStatusStub.restore();
        clearAllTimersStub.restore();
        startTimersStub.restore();
        getTextsStub.restore();
        showInfoMessageStub.restore();
        registerCommandStub.restore();
        onDidChangeConfigurationStub.restore();
    });

    test('activate should register commands and start timers', () => {
        // Stub 活动检测和历史服务的初始化
        const initHistoryServiceStub = sinon.stub();
        const initProgressiveReminderServiceStub = sinon.stub();
        const initActivityDetectionServiceStub = sinon.stub();
        
        // 临时替换这些函数
        const originalModule = require.cache[require.resolve('../../services/historyService')];
        const originalProgressiveModule = require.cache[require.resolve('../../services/progressiveReminderService')];
        const originalActivityModule = require.cache[require.resolve('../../services/activityDetectionService')];
        
        try {
            // 使用 proxyquire 或直接 stub 模块导出
            extension.activate(mockContext);

            // 验证命令注册（实际注册了多个命令）
            assert.ok(registerCommandStub.called, 'Commands should be registered');
            
            // 验证关键命令已注册
            const registeredCommands = registerCommandStub.getCalls().map(call => call.args[0]);
            assert.ok(registeredCommands.includes('movedYet.resetTimers'), 'Reset timers command should be registered');
            assert.ok(registeredCommands.includes('movedYet.showStatus'), 'Show status command should be registered');

            // 验证计时器启动
            assert.ok(startTimersStub.called, 'Timers should be started');

            // 验证配置变更监听
            assert.ok(onDidChangeConfigurationStub.called, 'Configuration change listener should be registered');
        } finally {
            // 恢复原始模块
            if (originalModule) {require.cache[require.resolve('../../services/historyService')] = originalModule;}
            if (originalProgressiveModule) {require.cache[require.resolve('../../services/progressiveReminderService')] = originalProgressiveModule;}
            if (originalActivityModule) {require.cache[require.resolve('../../services/activityDetectionService')] = originalActivityModule;}
        }
    });

    test('resetTimers command should reset timers and show message', () => {
        // 激活扩展
        extension.activate(mockContext);
        
        // 找到 resetTimers 命令的回调
        const resetTimersCall = registerCommandStub.getCalls().find(call => call.args[0] === 'movedYet.resetTimers');
        assert.ok(resetTimersCall, 'Reset timers command should be registered');
        
        const resetTimersCallback = resetTimersCall.args[1];

        // 执行回调
        resetTimersCallback();

        // 验证计时器重置和消息显示
        assert.strictEqual(resetAllTimersStub.calledOnce, true, 'Timers should be reset once');
        assert.strictEqual(showInfoMessageStub.calledOnce, true, 'Information message should be shown once');
        assert.strictEqual(showInfoMessageStub.firstCall.args[0], '所有计时器已重置', 'Correct reset message should be shown');
    });

    test('showStatus command should show status', () => {
        // 激活扩展
        extension.activate(mockContext);
        
        // 找到 showStatus 命令的回调
        const showStatusCall = registerCommandStub.getCalls().find(call => call.args[0] === 'movedYet.showStatus');
        assert.ok(showStatusCall, 'Show status command should be registered');
        
        const showStatusCallback = showStatusCall.args[1];

        // 执行回调
        showStatusCallback();

        // 验证状态显示
        assert.strictEqual(showCurrentStatusStub.calledOnce, true, 'Status should be shown once');
    });

    test('configuration change listener should be registered', () => {
        // 激活扩展
        extension.activate(mockContext);

        // 验证配置监听器已注册
        assert.ok(onDidChangeConfigurationStub.called, 'Configuration listener should be registered');
        
        // 验证返回的 disposable 被添加到 subscriptions
        assert.ok(mockContext.subscriptions.length > 0, 'Disposables should be added to context');
    });

    test('deactivate should clear all timers', () => {
        extension.deactivate();

        // 验证计时器清除
        assert.strictEqual(clearAllTimersStub.calledOnce, true, 'All timers should be cleared on deactivation');
    });
});
