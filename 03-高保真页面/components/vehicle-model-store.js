(function (global) {
    const STORAGE_KEY = 'vehicle-model-prototype-data-v1';
    // 变更日志独立存储：车型级(scope=model)与版本级(scope=version)分域记录，详情页按域读取
    const LOG_KEY = 'vehicle-model-change-log-v1';

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
