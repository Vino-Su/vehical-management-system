/**
 * 主从列表组件(公共组件,适用于高保真原型演示)
 *
 * 特性:
 *   - 纯原生 JS,零依赖,样式见 components/master-list.css
 *   - 统一管理分组、折叠(默认仅展开首个分组)、组内分批加载、选中态与空态
 *   - 卡片内容由页面通过 renderCard 注入,不与业务字段耦合
 *   - 事件用委托绑定在容器上,重渲染不需要重新绑定
 *
 * 用法:
 *   const master = MasterList.init({
 *     container: '#groupList',            // 分组列表容器(必填)
 *     totalEl: '#panelTotal',             // 标题栏总数节点(可选)
 *     countEl: '#groupCount',             // 分组工具栏分组数节点(可选)
 *     items: () => filteredVehicles,      // 数据源:数组或返回数组的函数
 *     getId: v => v.id,                   // 稳定标识,默认取 item.id
 *     groupModes: [                       // 分组维度,首个为默认
 *       { key: 'project', label: '按项目', of: v => v.project },
 *       { key: 'model',   label: '按车型', of: v => v.model }
 *     ],
 *     defaultMode: 'project',
 *     sortItems: (a, b) => a.vin.localeCompare(b.vin),
 *     sortGroups: (a, b) => 0,            // 可选,默认:活跃分组置顶 + 无分组置底 + 中文排序
 *     isActive: v => v.id === selectedId, // 卡片选中态
 *     activeGroupKey: () => '鸠江项目',    // 活跃分组,用于排序与默认展开
 *     renderCard: v => ({
 *       primary: v.plate,                 // 主标识(必填)
 *       primaryClass: 'num',              // 主标识附加类,如等宽数字
 *       dot: 'is-success',                // 状态圆点修饰类,不传则不渲染
 *       dotTitle: '终端在线',
 *       meta: `${v.vin} · ${v.model}`,    // 次要信息,不传则不渲染
 *       metaClass: 'num'
 *     }),
 *     batchSize: 4,                       // >0 启用组内分批加载
 *     loadMoreText: n => `显示更多 ${n} 张`,
 *     scopeRow: {                          // 可选:分组可作为筛选维度时补一行「全部」
 *       text: '全部设备',
 *       count: () => list.length,          // 可选,数字或函数(每次渲染求值)
 *       isActive: () => scope.kind === 'all',
 *       onSelect: () => selectAll()
 *     },
 *     groupSelectable: true,               // 分组头:true=折叠/选中分离,false=整头折叠
 *     empty: { title: '暂无匹配车辆', desc: '请调整筛选条件后重试' },
 *     onSelect: v => {}, onGroupSelect: k => {}, onModeChange: k => {}
 *   });
 *
 *   master.reset();          // 查询/重置数据后:重置折叠状态并重渲染
 *   master.render();         // 仅重渲染(保持折叠状态,用于选中变化)
 *   master.setMode('model'); // 切换分组维度
 */
(function (global) {
  'use strict';

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/[&<>"']/g, function (char) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
      });
  }

  function resolve(target) {
    if (!target) return null;
    return typeof target === 'string' ? document.querySelector(target) : target;
  }

  function encodeKey(key) { return encodeURIComponent(String(key)); }
  function decodeKey(key) { return decodeURIComponent(String(key)); }

  function create(options) {
    var opts = options || {};
    var container = resolve(opts.container);
    if (!container) throw new Error('MasterList: 未找到容器 ' + opts.container);

    var totalEl = resolve(opts.totalEl);
    var countEl = resolve(opts.countEl);
    var modes = opts.groupModes || [];
    var mode = opts.defaultMode || (modes[0] && modes[0].key) || '';
    var getId = opts.getId || function (item) { return item.id; };
    var renderCard = opts.renderCard || function () { return {}; };
    var noGroup = opts.noGroupText || '无分组';

    var collapsed = new Set();
    var visibleCounts = {};
    var index = {};          // 标识 -> 数据项,供事件回传
    var initialized = false;

    function modeDef(key) {
      for (var i = 0; i < modes.length; i += 1) {
        if (modes[i].key === key) return modes[i];
      }
      return modes[0] || null;
    }

    function groupTextOf(item) {
      var def = modeDef(mode);
      if (!def) return noGroup;
      var value = def.of ? def.of(item) : item[def.key];
      return value || noGroup;
    }

    function groupLabelOf(key) {
      var def = modeDef(mode);
      if (def && def.labelOf) return def.labelOf(key);
      return key;
    }

    function getItems() {
      var list = typeof opts.items === 'function' ? opts.items() : opts.items;
      return (list || []).slice();
    }

    function ordered(list) {
      var copy = list.slice();
      if (opts.sortItems) copy.sort(opts.sortItems);
      return copy;
    }

    function isItemActive(item) {
      return opts.isActive ? !!opts.isActive(item) : false;
    }

    function isGroupActive(key) {
      return opts.isGroupActive ? !!opts.isGroupActive(key) : false;
    }

    function activeKey() {
      return opts.activeGroupKey ? opts.activeGroupKey() : null;
    }

    // 活跃分组始终置顶；其余分组用 sortGroups 或默认规则(无分组置底 + 中文排序)
    function orderKeys(keys) {
      var active = activeKey();
      var rest = keys.filter(function (key) { return key !== active; });
      var compare = opts.sortGroups || function (a, b) {
        if (a === noGroup) return 1;
        if (b === noGroup) return -1;
        return a.localeCompare(b, 'zh-CN');
      };
      rest.sort(compare);
      return active !== null && keys.indexOf(active) >= 0 ? [active].concat(rest) : rest;
    }

    // meta 支持字符串、或 [{ text, className, muted }] 数组（多行次要信息）
    function metaHtml(meta, metaClass) {
      if (!meta) return '';
      var lines = Array.isArray(meta) ? meta : [{ text: meta, className: metaClass }];
      return lines.map(function (line) {
        if (!line || !line.text) return '';
        var cls = 'card-meta';
        if (line.className) cls += ' ' + line.className;
        if (line.muted) cls += ' is-muted';
        return '<span class="' + cls + '">' + escapeHtml(line.text) + '</span>';
      }).join('');
    }

    function cardHtml(item) {
      var data = renderCard(item, isItemActive(item)) || {};
      var primaryClass = data.primaryClass ? ' ' + data.primaryClass : '';
      var dot = data.dot
        ? '<span class="card-dot ' + data.dot + '"' + (data.dotTitle ? ' title="' + escapeHtml(data.dotTitle) + '"' : '') + '></span>'
        : '';
      return '<button class="master-card' + (isItemActive(item) ? ' active' : '') + '" type="button" data-item-id="' + escapeHtml(getId(item)) + '">'
        + '<span class="card-top"><span class="card-primary' + primaryClass + '">' + escapeHtml(data.primary) + '</span>' + dot + '</span>'
        + metaHtml(data.meta, data.metaClass)
        + '</button>';
    }

    function groupHtml(key, items) {
      var isCollapsed = collapsed.has(key);
      var batchSize = opts.batchSize || 0;
      var limit = batchSize ? Math.min(visibleCounts[key] || batchSize, items.length) : items.length;
      var cards = items.slice(0, limit).map(cardHtml).join('');
      var remain = items.length - limit;
      var more = remain > 0
        ? '<button class="load-more" type="button" data-load-more="' + encodeKey(key) + '">'
          + escapeHtml(opts.loadMoreText ? opts.loadMoreText(remain) : '显示更多 ' + remain + ' 项')
          + '</button>'
        : '';
      var label = groupLabelOf(key);
      var count = '<span class="group-count">' + items.length + '</span>';
      var head;

      if (opts.groupSelectable) {
        head = '<div class="group-head group-head--split' + (isGroupActive(key) ? ' active' : '') + '">'
          + '<button class="group-arrow-btn" type="button" aria-expanded="' + (!isCollapsed) + '"'
          + ' aria-label="' + (isCollapsed ? '展开' : '折叠') + ' ' + escapeHtml(label) + '"'
          + ' data-toggle-group="' + encodeKey(key) + '"><span class="group-arrow">▼</span></button>'
          + '<button class="group-select" type="button" title="' + escapeHtml(label) + '"'
          + ' data-select-group="' + encodeKey(key) + '"><span class="group-name">' + escapeHtml(label) + '</span>' + count + '</button>'
          + '</div>';
      } else {
        head = '<button class="group-head" type="button" aria-expanded="' + (!isCollapsed) + '"'
          + ' data-toggle-group="' + encodeKey(key) + '">'
          + '<span class="group-arrow">▼</span>'
          + '<span class="group-name" title="' + escapeHtml(label) + '">' + escapeHtml(label) + '</span>'
          + count
          + '</button>';
      }

      return '<section class="group-block' + (isCollapsed ? ' collapsed' : '') + '">'
        + head
        + '<div class="group-items">' + cards + more + '</div>'
        + '</section>';
    }

    function scopeRowHtml() {
      var scope = opts.scopeRow;
      if (!scope) return '';
      var active = scope.isActive ? !!scope.isActive() : false;
      var count = typeof scope.count === 'function' ? scope.count() : scope.count;
      return '<div class="scope-block"><button class="scope-row' + (active ? ' active' : '') + '" type="button" data-scope-row="1">'
        + '<span class="group-name">' + escapeHtml(scope.text) + '</span>'
        + (count === undefined || count === null ? '' : '<span class="group-count">' + count + '</span>')
        + '</button></div>';
    }

    function emptyHtml() {
      var empty = opts.empty || {};
      return '<div class="empty-state"><strong>' + escapeHtml(empty.title || '暂无数据') + '</strong>'
        + escapeHtml(empty.desc || '') + '</div>';
    }

    function render(resetCollapse) {
      var items = getItems();

      if (totalEl) {
        totalEl.textContent = opts.totalText ? opts.totalText(items.length) : '共 ' + items.length + ' 项';
      }

      index = {};
      items.forEach(function (item) { index[String(getId(item))] = item; });

      if (!items.length) {
        initialized = false;
        visibleCounts = {};
        if (countEl) countEl.textContent = opts.groupCountText ? opts.groupCountText(0) : '0 个分组';
        container.innerHTML = emptyHtml();
        return;
      }

      var grouped = {};
      ordered(items).forEach(function (item) {
        var key = groupTextOf(item);
        (grouped[key] || (grouped[key] = [])).push(item);
      });
      var keys = orderKeys(Object.keys(grouped));

      if (countEl) countEl.textContent = opts.groupCountText ? opts.groupCountText(keys.length) : keys.length + ' 个分组';

      if (resetCollapse || !initialized) {
        collapsed = new Set(keys.slice(1));   // 默认仅展开首个分组
        visibleCounts = {};
        initialized = true;
      }

      container.innerHTML = scopeRowHtml() + keys.map(function (key) {
        return groupHtml(key, grouped[key]);
      }).join('');
    }

    container.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || !target.closest) return;

      var toggle = target.closest('[data-toggle-group]');
      if (toggle) {
        var toggleKey = decodeKey(toggle.getAttribute('data-toggle-group'));
        if (collapsed.has(toggleKey)) collapsed.delete(toggleKey);
        else collapsed.add(toggleKey);
        render();
        return;
      }

      var groupBtn = target.closest('[data-select-group]');
      if (groupBtn) {
        var groupKey = decodeKey(groupBtn.getAttribute('data-select-group'));
        collapsed.delete(groupKey);
        if (opts.onGroupSelect) opts.onGroupSelect(groupKey);
        else render();
        return;
      }

      var more = target.closest('[data-load-more]');
      if (more) {
        var moreKey = decodeKey(more.getAttribute('data-load-more'));
        visibleCounts[moreKey] = (visibleCounts[moreKey] || opts.batchSize || 4) + (opts.batchSize || 4);
        render();
        return;
      }

      if (target.closest('[data-scope-row]')) {
        if (opts.scopeRow && opts.scopeRow.onSelect) opts.scopeRow.onSelect();
        return;
      }

      var card = target.closest('[data-item-id]');
      if (card) {
        var id = card.getAttribute('data-item-id');
        if (opts.onSelect && index[id]) opts.onSelect(index[id]);
      }
    });

    return {
      render: function () { render(false); },
      reset: function () { render(true); },
      setMode: function (key) {
        if (mode === key) return;
        mode = key;
        if (opts.onModeChange) opts.onModeChange(key);
        render(true);
      },
      getMode: function () { return mode; },
      getGroupText: groupTextOf
    };
  }

  global.MasterList = { init: create };
})(window);
