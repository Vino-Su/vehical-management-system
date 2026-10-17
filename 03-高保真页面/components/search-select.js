/**
 * 可搜索选择器组件(公共组件,适用于高保真原型演示)
 *
 * 特性:
 *   - 纯原生 JS,零依赖,样式见 components/search-select.css
 *   - 输入即搜:多字段模糊匹配,命中片段高亮
 *   - 键盘操作:↑↓ 移动、Enter 选中、Esc 关闭
 *   - 候选可按业务维度分组;支持禁用项(如已被其他设备占用的 SIM 卡)与空态
 *   - 支持清空(业务语义为解除绑定)
 *   - 下拉面板挂载到 body 并固定定位,避免被弹窗滚动容器裁切
 *
 * 用法:
 *   const sel = SearchSelect.init({
 *     container: '#ss-vehicle',            // 容器(必填),控件 DOM 由组件生成
 *     placeholder: '输入车牌 / 车架号 / 项目搜索',
 *     allowClear: true,                    // 显示清空按钮
 *     items: () => vehicles,               // 候选集:数组或返回数组的函数
 *     getValue: v => v.vin,                // 值,默认取 item.value 或 item.id
 *     getLabel: v => `${v.plate} · ${v.vin}`,  // 选中后输入框显示文本
 *     matchText: v => [v.plate, v.vin, v.project], // 参与匹配的字段(数组或字符串)
 *     groupOf: v => v.project,             // 可选:候选分组维度
 *     sortItems: (a, b) => 0,              // 可选:组内排序
 *     renderOption: v => ({                // 单选候选的展示数据
 *       primary: v.plate,                  // 主标识(必填)
 *       primaryClass: 'num',               // 主标识附加类,如等宽数字
 *       meta: `${v.vin} · ${v.project}`,   // 次要信息,字符串或数组
 *       metaClass: 'num',
 *       disabled: false,                   // 禁用项不可选中
 *       disabledReason: '已被 TBX-2026-001 占用' // 禁用原因,展示在候选右侧
 *     }),
 *     empty: { title: '无匹配对象', desc: '请调整关键字后重试' },
 *     onChange: (value, item) => {}        // 选中/清空后回调(item 为 null 表示清空)
 *   });
 *
 *   sel.getValue();          // 当前值
 *   sel.getItem();           // 当前选中项
 *   sel.setValue(vin);       // 程序化赋值(不触发 onChange)
 *   sel.setItems(list);      // 候选集变化后刷新(不触发 onChange)
 *   sel.clear();             // 清空(触发 onChange)
 */
(function (global) {
  'use strict';

  var PANEL_MAX_HEIGHT = 260;
  var seq = 0;

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

  // 命中片段高亮:大小写不敏感,保留原文大小写
  function highlight(text, keyword) {
    var source = String(text === undefined || text === null ? '' : text);
    if (!keyword) return escapeHtml(source);
    var lower = source.toLowerCase();
    var key = keyword.toLowerCase();
    var html = '';
    var index = 0;
    while (index <= source.length) {
      var hit = lower.indexOf(key, index);
      if (hit < 0) {
        html += escapeHtml(source.slice(index));
        break;
      }
      html += escapeHtml(source.slice(index, hit)) + '<mark>' + escapeHtml(source.slice(hit, hit + key.length)) + '</mark>';
      index = hit + key.length;
    }
    return html;
  }

  function create(options) {
    var opts = options || {};
    var container = resolve(opts.container);
    if (!container) throw new Error('SearchSelect: 未找到容器 ' + opts.container);

    var allowClear = opts.allowClear !== false;
    var getId = opts.getValue || function (item) { return item.value !== undefined ? item.value : item.id; };
    var getLabel = opts.getLabel || function (item) { return String(getId(item)); };
    var renderOption = opts.renderOption || function () { return {}; };
    var instanceId = 'ss-' + (seq += 1);

    var selectedItem = null;
    var keyword = '';
    var open = false;
    var activeIndex = -1;
    var visible = [];   // 当前渲染的可选项 [{ item, value, disabled }]

    container.classList.add('search-select');
    container.innerHTML =
      '<div class="search-select-control">'
      + '<input class="search-select-input" type="text" autocomplete="off" role="combobox"'
      + ' aria-autocomplete="list" aria-expanded="false" aria-controls="' + instanceId + '-panel"'
      + ' placeholder="' + escapeHtml(opts.placeholder || '请输入关键字搜索') + '">'
      + '<button class="search-select-clear" type="button" tabindex="-1" aria-label="清空">×</button>'
      + '<span class="search-select-arrow" aria-hidden="true">⌄</span>'
      + '</div>';

    var control = container.querySelector('.search-select-control');
    var input = container.querySelector('.search-select-input');
    var clearBtn = container.querySelector('.search-select-clear');

    // 面板挂到 body,固定定位,避免被弹窗的滚动容器裁切
    var panel = document.createElement('div');
    panel.className = 'search-select-panel';
    panel.id = instanceId + '-panel';
    panel.setAttribute('role', 'listbox');
    document.body.appendChild(panel);

    function items() {
      var list = typeof opts.items === 'function' ? opts.items() : opts.items;
      return (list || []).slice();
    }

    function valueOf(item) { return getId(item); }
    function labelOf(item) { return getLabel(item); }

    function matchTextField(item) {
      var text = opts.matchText ? opts.matchText(item) : labelOf(item);
      return (Array.isArray(text) ? text : [text]).join(' ').toLowerCase();
    }

    function matched() {
      var key = keyword.trim().toLowerCase();
      var list = key ? items().filter(function (item) {
        return matchTextField(item).indexOf(key) >= 0;
      }) : items();
      if (opts.sortItems) list.sort(opts.sortItems);
      return list;
    }

    function optionData(item) {
      return renderOption(item) || {};
    }

    function metaHtml(meta, metaClass) {
      if (!meta) return '';
      var lines = Array.isArray(meta) ? meta : [{ text: meta, className: metaClass }];
      return lines.map(function (line) {
        if (!line || !line.text) return '';
        var cls = 'ss-option-meta';
        if (line.className) cls += ' ' + line.className;
        return '<span class="' + cls + '">' + escapeHtml(line.text) + '</span>';
      }).join('');
    }

    function optionHtml(entry, index) {
      var data = optionData(entry.item);
      var primaryClass = data.primaryClass ? ' ' + data.primaryClass : '';
      var cls = 'ss-option'
        + (entry.disabled ? ' is-disabled' : '')
        + (index === activeIndex ? ' is-active' : '');
      var selected = !!selectedItem && entry.value === valueOf(selectedItem);
      return '<div class="' + cls + '" role="option" id="' + instanceId + '-opt-' + index + '"'
        + ' data-option-index="' + index + '"'
        + ' aria-selected="' + selected + '"'
        + ' aria-disabled="' + !!entry.disabled + '">'
        + '<span class="ss-option-main">'
        + '<span class="ss-option-primary' + primaryClass + '">' + highlight(data.primary !== undefined ? data.primary : entry.value, keyword) + '</span>'
        + metaHtml(data.meta, data.metaClass)
        + '</span>'
        + (data.disabledReason ? '<span class="ss-option-note">' + escapeHtml(data.disabledReason) + '</span>' : '')
        + '</div>';
    }

    function renderPanel() {
      var list = matched();
      var groups = {};
      var order = [];
      visible = [];

      list.forEach(function (item) {
        var data = optionData(item);
        var entry = { item: item, value: valueOf(item), disabled: !!data.disabled || !!item.disabled };
        visible.push(entry);
        var group = opts.groupOf ? (opts.groupOf(item) || '') : '';
        if (!groups[group]) { groups[group] = []; order.push(group); }
        groups[group].push(entry);
      });

      if (!visible.length) {
        var empty = opts.empty || {};
        panel.innerHTML = '<div class="ss-empty"><strong>' + escapeHtml(empty.title || '无匹配对象') + '</strong>'
          + (empty.desc ? '<span>' + escapeHtml(empty.desc) + '</span>' : '') + '</div>';
        activeIndex = -1;
        return;
      }

      var cursor = 0;
      panel.innerHTML = order.map(function (group) {
        var head = group ? '<div class="ss-group">' + escapeHtml(group) + '</div>' : '';
        return head + groups[group].map(function (entry) {
          var html = optionHtml(entry, cursor);
          cursor += 1;
          return html;
        }).join('');
      }).join('');

      // 若当前高亮项不可选,自动落到首个可选项,便于直接回车选中
      if (activeIndex < 0 || (visible[activeIndex] && visible[activeIndex].disabled)) {
        activeIndex = firstEnabledIndex();
      }
      syncActiveClass();
    }

    function firstEnabledIndex() {
      for (var i = 0; i < visible.length; i += 1) {
        if (!visible[i].disabled) return i;
      }
      return -1;
    }

    function syncActiveClass() {
      var nodes = panel.querySelectorAll('.ss-option');
      for (var i = 0; i < nodes.length; i += 1) {
        nodes[i].classList.toggle('is-active', Number(nodes[i].getAttribute('data-option-index')) === activeIndex);
      }
      var active = panel.querySelector('.ss-option.is-active');
      if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
    }

    function positionPanel() {
      if (!open) return;
      var rect = control.getBoundingClientRect();
      panel.style.left = rect.left + 'px';
      panel.style.width = rect.width + 'px';
      var height = Math.min(panel.scrollHeight || 0, PANEL_MAX_HEIGHT);
      var below = window.innerHeight - rect.bottom - 8;
      var top = below >= Math.min(height, 140) ? rect.bottom + 4 : Math.max(8, rect.top - 4 - height);
      panel.style.top = top + 'px';
      panel.style.maxHeight = Math.min(PANEL_MAX_HEIGHT, window.innerHeight - 16) + 'px';
    }

    function openPanel() {
      if (open) return;
      open = true;
      keyword = '';
      // 打开时清空输入框以便直接输入关键字,原选中值在关闭时回填
      input.value = '';
      activeIndex = -1;
      renderPanel();
      panel.classList.add('active');
      container.classList.add('is-open');
      input.setAttribute('aria-expanded', 'true');
      positionPanel();
    }

    function closePanel() {
      if (!open) return;
      open = false;
      panel.classList.remove('active');
      container.classList.remove('is-open');
      input.setAttribute('aria-expanded', 'false');
      input.value = selectedItem ? labelOf(selectedItem) : '';
    }

    function syncClearState() {
      container.classList.toggle('has-value', !!selectedItem && allowClear);
    }

    function commit(item, notify) {
      selectedItem = item || null;
      input.value = selectedItem ? labelOf(selectedItem) : '';
      syncClearState();
      if (notify && opts.onChange) opts.onChange(selectedItem ? valueOf(selectedItem) : null, selectedItem);
    }

    function selectEntry(entry) {
      if (!entry || entry.disabled) return;
      commit(entry.item, true);
      closePanel();
      input.blur();
    }

    function selectByIndex(index) {
      if (index < 0 || index >= visible.length) return;
      selectEntry(visible[index]);
    }

    function moveActive(step) {
      if (!visible.length) return;
      var index = activeIndex;
      for (var guard = 0; guard < visible.length; guard += 1) {
        index += step;
        if (index < 0) index = visible.length - 1;
        if (index >= visible.length) index = 0;
        if (!visible[index].disabled) { activeIndex = index; break; }
      }
      syncActiveClass();
    }

    // ===== 事件 =====
    input.addEventListener('focus', openPanel);

    input.addEventListener('input', function () {
      if (!open) openPanel();
      keyword = input.value;
      activeIndex = -1;
      renderPanel();
      positionPanel();
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') { event.preventDefault(); if (!open) openPanel(); else if (activeIndex < 0) activeIndex = firstEnabledIndex(); else moveActive(1); syncActiveClass(); return; }
      if (event.key === 'ArrowUp') { event.preventDefault(); if (!open) openPanel(); else moveActive(-1); return; }
      if (event.key === 'Enter') { event.preventDefault(); if (open) selectByIndex(activeIndex); return; }
      if (event.key === 'Escape') { if (open) { event.preventDefault(); closePanel(); } return; }
      if (event.key === 'Backspace' && !input.value && selectedItem) { commit(null, true); return; }
    });

    clearBtn.addEventListener('mousedown', function (event) {
      event.preventDefault();
      commit(null, true);
      closePanel();
      input.focus();
    });

    // 用 mousedown 处理候选点击,避免 input 失焦导致面板提前关闭
    panel.addEventListener('mousedown', function (event) {
      var node = event.target && event.target.closest ? event.target.closest('[data-option-index]') : null;
      if (!node) return;
      event.preventDefault();
      selectByIndex(Number(node.getAttribute('data-option-index')));
    });

    document.addEventListener('mousedown', function (event) {
      if (!open) return;
      if (container.contains(event.target) || panel.contains(event.target)) return;
      closePanel();
    });

    window.addEventListener('resize', positionPanel);
    // 捕获阶段监听,便于感知弹窗内部滚动容器的滚动
    window.addEventListener('scroll', function () { if (open) positionPanel(); }, true);

    syncClearState();

    return {
      getValue: function () { return selectedItem ? valueOf(selectedItem) : null; },
      getItem: function () { return selectedItem; },
      setValue: function (value, item) {
        var target = item;
        if (!target && value !== undefined && value !== null) {
          var list = items();
          for (var i = 0; i < list.length; i += 1) {
            if (String(valueOf(list[i])) === String(value)) { target = list[i]; break; }
          }
        }
        commit(target || null, false);
      },
      setItems: function () {
        renderPanel();
        syncClearState();
      },
      clear: function () { commit(null, true); },
      close: closePanel
    };
  }

  global.SearchSelect = { init: create };
})(window);
