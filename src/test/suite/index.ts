import * as path from 'path';
import { glob } from 'glob';
// 使用正确的 Mocha 导入方式
const Mocha = require('mocha');

export function run(): Promise<void> {
    // 创建 mocha 测试
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '..');

    return new Promise((c, e) => {
        glob('**/**.test.js', { cwd: testsRoot })
            .then(files => {
                // 添加文件到测试套件
                files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

                try {
                    // 运行测试
                    mocha.run(failures => {
                        if (failures > 0) {
                            e(new Error(`${failures} tests failed.`));
                        } else {
                            c();
                        }
                    });
                } catch (err) {
                    e(err);
                }
            })
            .catch(err => {
                e(err);
            });
    });
}
