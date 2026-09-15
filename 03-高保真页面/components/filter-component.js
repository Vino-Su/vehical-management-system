/**
 * FilterBar 筛选区组件(渐进筛选:展开更多/收起,抽取自 智能网联汽车安全监测平台)
 *
 * 特性:
 *   - 纯原生 JS,零依赖,样式自动注入
 *   - 页面放置筛选区后自动绑定"展开更多/收起"按钮,无需写 onclick
 *   - 兼容手动调用:toggleFilterMore(button) / toggleProgressiveFilter(button)
 *   - 设计色值自动读取项目 CSS 变量
 *
 * HTML 结构(与智能网联项目类名一致,可直接迁移):
 *   <div class="filter-bar" data-progressive-filter>
 *     <div class="filter-row filter-primary">
 *       <div class="filter-item"><label>关键字</label><input class="ant-input" style="width:160px"></div>
 *       <div class="filter-actions">
 *         <button class="btn btn-primary">查询</button><button class="btn btn-default">重置</button>
 *       </div>
 *       <button type="button" class="filter-more-toggle" aria-expanded="false">
 *         <span class="filter-more-text">展开更多</span>
 *         <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
 *       </button>
 *     </div>
 *     <div class="filter-row filter-extra">
 *       <!-- 更多筛选项:默认收起,展开后显示 -->
 *       <div class="filter-item"><label>扩展条件</label><input class="ant-input" style="width:160px"></div>
 *     </div>
 *   </div>
 */
(function (global) {
  'use strict';

  // ========== 设计令牌 ==========
  function cssVar(name, fallback) {
    var val = '';
    try { val = getComputedStyle(document.documentElement).getPropertyValue(name); } catch (e) {}
    return (val && val.trim()) ? val.trim() : fallback;
  }
  var TOKENS = {
    primary: cssVar('--primary', '#1677ff'),
    primaryHover: cssVar('--primary-hover', '#4096ff'),
    textMain: cssVar('--text-main', '#000000d9'),
    textSecondary: cssVar('--text-secondary', '#00000073'),
    border: cssVar('--border', '#f0f0f0'),
    bgBody: cssVar('--bg-body', '#f0f2f5')
  };

  // ========== 输入控件样式(幂等:多个组件共用,只注入一次) ==========
  function injectControlStyles() {
    if (document.getElementById('cc-control-styles')) return;
    var style = document.createElement('style');
    style.id = 'cc-control-styles';
    style.textContent = [
      '.ant-input{height:32px;padding:0 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;color:' + TOKENS.textMain + ';background:#fff;outline:none;font-family:inherit}',
      '.ant-input:focus{border-color:' + TOKENS.primary + ';box-shadow:0 0 0 2px rgba(22,119,255,.1)}',
      '.ant-input::placeholder{color:#00000040}',
      'select.ant-input{cursor:pointer;padding-right:8px}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ========== 样式自动注入(仅首次) ==========
  var CSS_INJECTED = false;
  function injectFilterStyles() {
    injectControlStyles();
    if (CSS_INJECTED) return;
    CSS_INJECTED = true;
    var style = document.createElement('style');
    style.id = 'cc-filter-styles';
    style.textContent = [
      '.filter-bar{background:#fff;padding:16px 24px;border-radius:8px;margin-bottom:16px}',
      '.filter-bar .filter-row{display:flex;flex-wrap:wrap;gap:20px 24px;align-items:center}',
      '.filter-bar[data-progressive-filter] .filter-row.filter-primary{flex-wrap:nowrap;min-width:0;gap:16px}',
      '.filter-bar[data-progressive-filter] .filter-row.filter-primary .filter-item{flex-shrink:0}',
      '.filter-bar .filter-row.filter-extra{display:none;width:100%;margin-top:16px;flex-wrap:wrap}',
      '.filter-bar .filter-row.filter-extra.is-expanded{display:flex}',
      // 标签与控件间距 12px(UI_design_WEB 规范:表单标签与控件间距 12px)
      '.filter-bar .filter-item{display:inline-flex;flex-direction:row;align-items:center;gap:12px}',
      '.filter-bar .filter-item label{font-size:14px;color:' + TOKENS.textMain + ';white-space:nowrap}',
      '.filter-bar .filter-actions{display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0}',
      '.filter-more-toggle{height:32px;display:inline-flex;align-items:center;gap:4px;padding:0;border:none;background:transparent;color:' + TOKENS.primary + ';font-size:14px;white-space:nowrap;cursor:pointer;flex-shrink:0;margin-left:8px}',
      '.filter-more-toggle:hover{color:' + TOKENS.primaryHover + '}',
      '.filter-more-toggle svg{transition:transform .2s}',
      '.filter-more-toggle.is-expanded svg{transform:rotate(180deg)}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ========== 展开/收起切换 ==========
  function toggleFilterMore(button) {
    injectFilterStyles();
    var filterBar = button && button.closest ? button.closest('.filter-bar') : null;
    if (!filterBar) return;

    var extra = filterBar.querySelector('.filter-extra');
    var label = button.querySelector('.filter-more-text');
    if (!extra || !label) return;

    var expanded = !extra.classList.contains('is-expanded');
    extra.classList.toggle('is-expanded', expanded);
    button.classList.toggle('is-expanded', expanded);
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    label.textContent = expanded ? '收起' : '展开更多';
  }

  // 兼容历史页面的 .search-bar / .form-row 结构：页面只要存在超过一行的
  // 查询项，组件会自动把多余条件收起，并复用同一套展开按钮样式。
  function bindLegacyBars() {
    var bars = document.querySelectorAll('.search-bar, .transfer-search, .bom-search, .panel-search');
    for (var i = 0; i < bars.length; i++) {
      var bar = bars[i];
      if (bar.querySelector('.filter-more-toggle, .toggle-expand, .filter-toggle')) continue;
      var items = bar.querySelectorAll('.search-row > .search-item, .search-row > .ledger-search-item, .transfer-search > .form-row, .bom-search > .form-row, .panel-search > .si');
      var formItems = [];
      for (var j = 0; j < items.length; j++) {
        if (items[j].querySelector('input, select, textarea')) formItems.push(items[j]);
      }
      var visibleCount = parseInt(bar.getAttribute('data-visible-count'), 10) || 4;
      if (formItems.length <= visibleCount) continue;

      for (var k = visibleCount; k < formItems.length; k++) {
        formItems[k].classList.add('cc-filter-extra');
        formItems[k].style.display = 'none';
      }

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-more-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = '<span class="filter-more-text">展开更多</span><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6-6z"/></svg>';
      button.addEventListener('click', function () {
        var expanded = this.getAttribute('aria-expanded') === 'true';
        var owner = this.closest('.search-bar, .transfer-search, .bom-search, .panel-search');
        var extras = owner ? owner.querySelectorAll('.cc-filter-extra') : [];
        for (var n = 0; n < extras.length; n++) extras[n].style.display = expanded ? 'none' : '';
        this.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        this.classList.toggle('is-expanded', !expanded);
        this.querySelector('.filter-more-text').textContent = expanded ? '展开更多' : '收起';
      });
      var action = bar.querySelector('.filter-actions, .search-actions, .ledger-search-item:last-child') || formItems[formItems.length - 1] || bar;
      action.appendChild(button);
    }
  }

  // ========== 自动绑定(无 onclick 的按钮自动挂事件) ==========
  function bindAll() {
    injectFilterStyles();
    var buttons = document.querySelectorAll('.filter-bar[data-progressive-filter] .filter-more-toggle');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      if (btn.dataset.ccBound) continue;
      btn.dataset.ccBound = '1';
      // 已有 onclick 属性(旧写法)时跳过,避免重复触发
      if (btn.hasAttribute('onclick')) continue;
      btn.addEventListener('click', function () { toggleFilterMore(this); });
    }
    bindLegacyBars();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }
  // 费用台账等页面会在初始化时异步注入额外查询项，监听一次 DOM 变化即可
  // 让折叠按钮跟随动态条件出现，同时通过现有去重判断避免重复绑定。
  if (window.MutationObserver) {
    var observer = new MutationObserver(function () { bindLegacyBars(); });
    var observe = function () { if (document.body) observer.observe(document.body, { childList: true, subtree: true }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe);
    else observe();
  }

  global.toggleFilterMore = toggleFilterMore;
  global.toggleProgressiveFilter = toggleFilterMore; // 兼容旧函数名
})(window);
