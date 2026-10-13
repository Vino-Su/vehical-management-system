(function (global) {
    const STORAGE_KEY = 'vehicle-model-prototype-data-v1';
    // 变更日志独立存储：车型级(scope=model)与版本级(scope=version)分域记录，详情页按域读取
    const LOG_KEY = 'vehicle-model-change-log-v1';

    // ===== 车辆引用关系（原型 mock，PRD 3.6.2 / 4.3）=====
    // 口径：实时引用，且引用锚定在「车型版本」维度（车辆建档必选车型名称 + 车型版本，车型本身不会被直接引用）。
    // 数据以「车辆资产列表」实际 mock 为唯一事实来源（03-高保真页面/vehicle-asset/vehicle-asset-list.html），
    // 保证「删除阻断弹窗展示的台数」与「跳转后资产列表按车型名称 + 车型版本筛选出的行数」一致。
    // 正式期由车辆模块提供接口替换本表；接口失败时按「不可删除」保守处理。
    const VEHICLE_REFERENCES = [
        { model_name: '麒麟清扫车', version: 'V1.0', count: 2 },
        { model_name: '爱瑞特纯电动高压冲洗车', version: 'V1.0', count: 2 },
        { model_name: '中联清洗车', version: 'V1.0', count: 2 },
        { model_name: '三力洒水车', version: 'V1.0', count: 2 },
        { model_name: '泰坦智能驾驶洒水车', version: 'V1.0', count: 1 },
        { model_name: '麒麟无人化扫地车', version: 'V1.0', count: 1 },
        { model_name: '长城多用途货车', version: 'V1.0', count: 1 },
        { model_name: '独角兽', version: 'V1.0', count: 1 }
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value || []));
    }

    function read() {
        try {
            const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (e) {
            return [];
        }
    }

    function write(models) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clone(models)));
        return models;
    }

    function readLogs() {
        try {
            const value = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
            return Array.isArray(value) ? value : [];
        } catch (e) {
            return [];
        }
    }

    function writeLogs(logs) {
        localStorage.setItem(LOG_KEY, JSON.stringify(clone(logs)));
        return logs;
    }

    // 比较口径统一：null/undefined → 空串，其余转字符串并去首尾空格（数值 8500 与 '8500' 视为未变更）
    function normalizeValue(value) {
        return value === null || value === undefined ? '' : String(value).trim();
    }

    function nowText() {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    function mergeSeed(seed) {
        const stored = read();
        if (!stored.length) return write(seed || []);
        const byId = new Map(stored.map(model => [Number(model.id), model]));
        (seed || []).forEach(model => {
            const id = Number(model.id);
            if (!byId.has(id)) byId.set(id, clone(model));
        });
        return write(Array.from(byId.values()));
    }

    const api = {
        init(seed) { return clone(mergeSeed(seed)); },
        all() { return clone(read()); },
        getModel(id) { return read().find(model => Number(model.id) === Number(id)) || null; },
        createModel(model) {
            const models = read();
            models.push(clone(model));
            write(models);
            return model;
        },
        updateModel(model) {
            const models = read();
            const index = models.findIndex(item => Number(item.id) === Number(model.id));
            if (index >= 0) models[index] = clone(model);
            else models.push(clone(model));
            write(models);
            return model;
        },
        deleteModel(id) { write(read().filter(model => Number(model.id) !== Number(id))); },
        addVersion(modelId, version) {
            const models = read();
            const model = models.find(item => Number(item.id) === Number(modelId));
            if (!model) return false;
            model.versions = model.versions || [];
            model.versions.push(clone(version));
            write(models);
            return true;
        },
        deleteVersion(modelId, versionId) {
            const models = read();
            const model = models.find(item => Number(item.id) === Number(modelId));
            if (!model) return false;
            model.versions = (model.versions || []).filter(version => Number(version.id) !== Number(versionId));
            write(models);
            return true;
        },
        nextId() {
            const ids = read().flatMap(model => [Number(model.id), ...(model.versions || []).map(version => Number(version.id))]);
            return Math.max(0, ...ids) + 1;
        },
        // 版本引用校验（PRD 3.6.2）：查该车型版本被多少台车辆引用，无匹配返回 0
        // 入参：车型名称（中）+ 车型版本号；引用锚定在版本维度，故车型删除不调用本方法
        referencedVehicleCount(modelName, version) {
            const name = String(modelName || '').trim();
            const ver = String(version || '').trim();
            if (!name || !ver) return 0;
            const hit = VEHICLE_REFERENCES.find(item => item.model_name === name && item.version === ver);
            return hit ? Number(hit.count) || 0 : 0;
        },
        // 日志查询：按待/已过滤条件取记录，默认操作时间倒序；同一批次按写入顺序存储、倒序展示
        logs(filter) {
            const opts = filter || {};
            return readLogs()
                .filter(log => {
                    if (opts.modelId !== undefined && Number(log.modelId) !== Number(opts.modelId)) return false;
                    if (opts.scope && log.scope !== opts.scope) return false;
                    if (opts.targetId !== undefined && Number(log.targetId) !== Number(opts.targetId)) return false;
                    return true;
                })
                .sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')) || (Number(b.id) - Number(a.id)));
        },
        // 一次保存的字段级 diff 写入：仅记录值发生变化的字段，一字段一条，共享 batchId 与操作时间
        // opts: { scope, modelId, targetId, targetName, before, after, labels, skip, operator, source, time }
        // 返回写入条数（0 表示无实际变更）
        appendChanges(opts) {
            const options = opts || {};
            const before = options.before || {};
            const after = options.after || {};
            const labels = options.labels || {};
            const skip = options.skip || [];
            const time = options.time || nowText();
            const operator = options.operator || '当前用户';
            const source = options.source || 'Web端';
            const all = readLogs();
            let seq = all.reduce((max, log) => Math.max(max, Number(log.id) || 0), 0);
            const batchId = 'BATCH-' + time.replace(/[^0-9]/g, '') + '-' + (seq + 1);
            const entries = [];
            Object.keys(after).forEach(key => {
                if (skip.indexOf(key) >= 0) return;
                const beforeValue = normalizeValue(before[key]);
                const afterValue = normalizeValue(after[key]);
                if (beforeValue === afterValue) return;
                entries.push({
                    id: ++seq,
                    batchId,
                    scope: options.scope,
                    modelId: options.modelId,
                    targetId: options.targetId,
                    targetName: options.targetName || '',
                    type: '修改',
                    field: labels[key] || key,
                    before: beforeValue,
                    after: afterValue,
                    operator,
                    time,
                    source
                });
            });
            if (!entries.length) return 0;
            writeLogs(all.concat(entries));
            return entries.length;
        },
        // 原型复位：清空全部变更日志（仅调试使用）
        clearLogs() {
            writeLogs([]);
            return true;
        }
    };

    global.ModelStore = api;
})(window);
