/**
 * 车辆管理系统 - 公共组件库
 * 包含：侧边栏、头部、面包屑、分页、Toast提示等
 */
const Common = {
  // ===== 导航配置（严格按 01-需求文档/页面框架.md 的三级结构） =====
  // 顶部为一级模块，侧栏展示该模块的二级和三级菜单；disabled 表示页面尚未实现。
  menuConfig: [
    { id: 'vehicle', label: '车辆管理', symbol: '车', groups: [
      { label: '车辆管理', symbol: '车', items: [
        { label: '车辆建档', id: 'vehicle-register', href: 'vehicle-register/vehicle-register-list.html' },
        { label: '车辆资产管理', id: 'asset-manage', href: 'vehicle-asset/vehicle-asset-list.html' },
        { label: '标签管理', id: 'tag-manage', href: 'vehicle-tag/tag-manage-list.html' },
        { label: '车型管理', id: 'vehicle-model', href: 'vehicle-model/vehicle-model-list.html' },
      ]},
      { label: '资产管理', symbol: '资', items: [
        { label: '车辆资产盘点', id: 'asset-inventory', disabled: true },
        { label: '车辆资产信息维护', id: 'asset-maintain', disabled: true },
      ]},
      { label: 'SIM 卡管理', symbol: '卡', items: [
        { label: 'SIM卡台账', id: 'sim-ledger', href: 'sim-card/sim-card-list.html' },
        { label: 'SIM卡流量明细', id: 'sim-traffic-detail', href: 'sim-card/sim-card-traffic-detail.html' },
      ]},
    ]},
    { id: 'operation', label: '运行监管', symbol: '运', groups: [
      { label: '车辆调度', symbol: '调', items: [
        { label: '可用车辆库', id: 'transfer-available', href: 'vehicle-dispatch/dispatch-vehicle-list.html' },
        { label: '调度记录管理', id: 'transfer-apply', href: 'vehicle-dispatch/dispatch-record-list.html' },
      ]},
      { label: '实时监管', symbol: '监', items: [
        { label: '车辆监管一张图', id: 'vehicle-monitor', disabled: true },
        { label: '车辆运行数据', id: 'vehicle-runtime', disabled: true },
      ]},
      { label: '异常事件', symbol: '异', items: [
        { label: '车辆故障信息', id: 'vehicle-fault', disabled: true },
        { label: '车辆异常告警', id: 'vehicle-alert', disabled: true },
      ]},
    ]},
    { id: 'maintenance', label: '维保管理', symbol: '维', groups: [
      { label: '维修管理', symbol: '修', items: [
        { label: '维修申请工单', id: 'repair-apply', disabled: true },
        { label: '维修结算单', id: 'repair-settle', disabled: true },
      ]},
      { label: '保养管理', symbol: '保', items: [
        { label: '保养任务清单', id: 'maintain-task', disabled: true },
        { label: '保养结算单', id: 'maintain-settle', disabled: true },
      ]},
    ]},
    { id: 'compliance', label: '合规与风险', symbol: '合', groups: [
      { label: '合规管理', symbol: '规', items: [
        { label: '保险管理', id: 'insurance', disabled: true },
        { label: '年检管理', id: 'annual-inspect', disabled: true },
        { label: '证照管理', id: 'license', disabled: true },
        { label: '到期预警', id: 'expire-warn', disabled: true },
      ]},
      { label: '风险管理', symbol: '险', items: [
        { label: '违章记录', id: 'violation-record', disabled: true },
        { label: '违章费用', id: 'violation-fee', disabled: true },
        { label: '事故记录', id: 'accident-record', disabled: true },
        { label: '事故理赔', id: 'accident-claim', disabled: true },
      ]},
    ]},
    { id: 'expense', label: '费用管理', symbol: '费', groups: [
      { label: '能耗费用', symbol: '能', items: [
        { label: '加油费明细台账', id: 'fuel-fee', href: 'expense/fuel-fee-ledger.html' },
        { label: '加水费用明细台账', id: 'water-fee', href: 'expense/water-fee-ledger.html' },
        { label: '充电费用明细台账', id: 'charge-fee', href: 'expense/charge-fee-ledger.html' },
      ]},
      { label: '维修保养费用', symbol: '修', items: [
        { label: '维修费用明细台账', id: 'repair-fee', disabled: true },
        { label: '保养费用明细台账', id: 'maintain-fee', disabled: true },
        { label: '耗材费用明细台账', id: 'material-fee', disabled: true },
      ]},
      { label: '合规与风险费用', symbol: '险', items: [
        { label: '证照办理费用明细台账', id: 'license-fee', disabled: true },
        { label: '保险费用明细台账', id: 'insurance-fee', disabled: true },
        { label: '税费明细台账', id: 'tax-fee', disabled: true },
        { label: '违章费用明细台账', id: 'violation-fee-ledger', disabled: true },
        { label: '自费理赔费用明细台账', id: 'claim-fee', disabled: true },
      ]},
      { label: '流量费用', symbol: '流', items: [
        { label: '流量套餐管理', id: 'data-plan', disabled: true },
        { label: '流量费用明细', id: 'data-fee', disabled: true },
      ]},
      { label: 'AI推理服务费用', symbol: 'AI', items: [
        { label: '模型套餐管理', id: 'model-plan', disabled: true },
        { label: '模型费用明细', id: 'model-fee', disabled: true },
      ]},
      { label: '其他费用', symbol: '其', items: [
        { label: '通行费明细台账', id: 'toll-fee', disabled: true },
        { label: '停车费明细台账', id: 'parking-fee', disabled: true },
        { label: '运输费明细台账', id: 'transport-fee', disabled: true },
      ]},
      { label: '费用分析', symbol: '析', items: [
        { label: '加油费用分析', id: 'fuel-analysis', disabled: true },
        { label: '加水费用分析', id: 'water-analysis', disabled: true },
        { label: '充电费用分析', id: 'charge-analysis', disabled: true },
        { label: '单车成本分析', id: 'vehicle-cost-analysis', disabled: true },
      ]},
    ]},
    { id: 'exit', label: '退出管理', symbol: '退', groups: [
      { label: '退出管理', symbol: '退', items: [
        { label: '退出申请', id: 'exit-apply', disabled: true },
        { label: '退出审批', id: 'exit-approve', disabled: true },
        { label: '车辆处置', id: 'exit-dispose', disabled: true },
        { label: '车辆归档', id: 'exit-archive', disabled: true },
      ]},
    ]},
    { id: 'analysis', label: '数据分析', symbol: '数', groups: [
      { label: '车辆报表', symbol: '报', items: [
        { label: '行驶时长', id: 'driving-duration', disabled: true },
        { label: '里程统计', id: 'mileage-statistics', disabled: true },
        { label: '油耗分析', id: 'fuel-consumption', disabled: true },
        { label: '电耗分析', id: 'energy-consumption', disabled: true },
      ]},
      { label: '车辆健康报告', symbol: '健', items: [{ label: '车辆健康报告', id: 'vehicle-health', disabled: true }] },
      { label: '自动驾驶行为分析', symbol: '驾', items: [{ label: '自动驾驶行为分析', id: 'autonomous-analysis', disabled: true }] },
      { label: '单车成本分析', symbol: '成', items: [{ label: '单车成本分析', id: 'single-vehicle-cost', disabled: true }] },
    ]},
    { id: 'system', label: '系统管理', symbol: '系', groups: [
      { label: '规则配置', symbol: '规', items: [
        { label: '预警规则配置', id: 'alert-config', disabled: true },
        { label: '维保策略管理', id: 'maintenance-strategy', disabled: true },
      ]},
      { label: '权限管理', symbol: '权', items: [{ label: '权限管理', id: 'permission-manage', disabled: true }] },
    ]},
  ],

  /**
   * 初始化整体布局（侧边栏+头部）
   * @param {Object} opts
   *   - sidebarId: 侧边栏容器ID
   *   - activeMenuId: 当前激活菜单项ID
   *   - headerId: 头部容器ID（null则不渲染头部）
   *   - breadcrumbs: 面包屑数组 [{label, href?}]
   *   - headerOptions: 头部附加选项 {showProject}
   */
  initLayout(opts) {
    this._basePath = opts.basePath || '';
    this._activeMenuId = opts.activeMenuId;
    this._headerOptions = opts.headerOptions || {};
    this._activeTopId = this.getTopModuleByActive(opts.activeMenuId)?.id || this.menuConfig[0].id;
    if (opts.sidebarId) this.renderSidebar(opts.sidebarId, opts.activeMenuId, this._activeTopId);
    if (opts.headerId) {
      this.renderHeader(opts.headerId, this._headerOptions);
      this.mountAppShell(opts.headerId);
    }
    this.restoreSidebarState();
    this.bindGlobalEvents();
  },

  // ===== 由末级菜单反查所属一级模块 =====
  getTopModuleByActive(activeMenuId) {
    return this.menuConfig.find(module => module.groups.some(group => group.items.some(item => item.id === activeMenuId)));
  },

  getModuleName(activeMenuId) {
    const module = this.getTopModuleByActive(activeMenuId);
    return module ? module.label : '';
  },

  // ===== 获取一级模块内首个可访问的三级页面 =====
  getFirstAvailableMenuItem(moduleId) {
    const module = this.menuConfig.find(item => item.id === moduleId);
    if (!module) return null;
    for (const group of module.groups) {
      const item = group.items.find(menuItem => !menuItem.disabled && menuItem.href);
      if (item) return item;
    }
    return null;
  },

  // ===== 侧边栏渲染：二级分组 + 三级功能 =====
  renderSidebar(containerId, activeMenuId, topModuleId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const module = this.menuConfig.find(item => item.id === topModuleId) || this.menuConfig[0];

    let html = '<div class="sidebar-brand"><span class="sidebar-brand-mark">车</span><span class="sidebar-brand-text">车辆管理系统</span></div>';
    html += '<nav class="sidebar-nav">';
    module.groups.forEach((group, index) => {
      const hasActive = group.items.some(item => item.id === activeMenuId);
      const openCls = hasActive || (!activeMenuId && index === 0) ? ' open' : '';
      html += `<div class="side-group${openCls}">`;
      html += `<button class="side-group-toggle" type="button" onclick="Common.toggleMenuGroup(this)" title="${group.label}"><span class="side-group-symbol">${group.symbol}</span><span class="side-group-label">${group.label}</span><span class="group-arrow">⌄</span></button>`;
      html += '<div class="side-group-items">';
      group.items.forEach(item => {
        const isDisabled = item.disabled;
        const cls = ['side-menu-item', item.id === activeMenuId ? 'active' : '', isDisabled ? 'disabled' : ''].filter(Boolean).join(' ');
        const href = !isDisabled && item.href ? (this._basePath + item.href) : 'javascript:;';
        const suffix = isDisabled ? '<span class="menu-item-badge">未开放</span>' : '';
        html += `<a class="${cls}" href="${href}" data-id="${item.id}"${isDisabled ? ' onclick="return false;"' : ''}>${item.label}${suffix}</a>`;
      });
      html += '</div></div>';
    });
    html += '</nav><div class="sidebar-footer"><button class="sidebar-collapse" type="button" onclick="Common.toggleSidebar()" aria-label="收起或展开侧边导航" title="收起或展开侧边导航"><span class="collapse-icon">‹</span><span class="collapse-label">收起侧栏</span></button></div>';
    container.innerHTML = html;
  },

  // ===== 菜单组展开/收起 =====
  toggleMenuGroup(titleEl) {
    const group = titleEl.parentElement;
    group.classList.toggle('open');
  },

  // ===== 顶部一级模块导航 =====
  renderHeader(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<a class="header-brand" href="' + this._basePath + 'index.html" aria-label="返回页面索引"><span class="header-brand-mark">车</span><span class="header-brand-name">车辆管理系统</span></a>';
    html += '<nav class="top-module-nav" aria-label="一级模块">';
    this.menuConfig.forEach(module => {
      const active = module.id === this._activeTopId ? ' active' : '';
      html += `<button class="top-module-item${active}" type="button" onclick="Common.selectTopModule('${module.id}')">${module.label}</button>`;
    });
    html += '</nav><div class="header-right">';
    if (!options || options.showProject !== false) {
      html += '<div class="project-select"><select><option>全部项目</option></select></div>';
    }
    html += '<button class="header-icon-button" type="button" aria-label="通知" title="通知">○</button>';
    html += '<div class="user-info"><span class="user-avatar">管</span><span class="user-name">管理员</span></div>';
    html += '</div>';

    container.innerHTML = html;
    container.className = 'global-header';
  },

  selectTopModule(moduleId) {
    if (moduleId === this._activeTopId) return;
    this._activeTopId = moduleId;
    const module = this.menuConfig.find(item => item.id === moduleId);
    const firstPage = this.getFirstAvailableMenuItem(moduleId);
    if (firstPage) {
      window.location.href = this._basePath + firstPage.href;
      return;
    }

    // 当前模块尚无可访问页面时，保留模块切换并明确反馈，避免继续展示旧模块的选中状态。
    this.renderSidebar('sidebar', null, moduleId);
    this.renderHeader('header', this._headerOptions);
    this.restoreSidebarState();
    if (module) this.showToast(`${module.label}暂无可访问页面`, 'info');
  },

  mountAppShell(headerId) {
    const header = document.getElementById(headerId);
    const layout = header && header.closest('.layout');
    if (!header || !layout || layout.parentElement.classList.contains('app-shell')) return;
    const shell = document.createElement('div');
    shell.className = 'app-shell';
    layout.parentNode.insertBefore(shell, layout);
    shell.appendChild(header);
    shell.appendChild(layout);
  },

  restoreSidebarState() {
    const shell = document.querySelector('.app-shell');
    if (!shell) return;
    try {
      if (window.localStorage.getItem('vehicle-system-sidebar-collapsed') === '1') shell.classList.add('sidebar-collapsed');
    } catch (e) {
      // 静态文件或受限浏览器禁止本地存储时，使用默认展开状态。
    }
  },

  toggleSidebar() {
    const shell = document.querySelector('.app-shell');
    if (!shell) return;
    const collapsed = shell.classList.toggle('sidebar-collapsed');
    try {
      window.localStorage.setItem('vehicle-system-sidebar-collapsed', collapsed ? '1' : '0');
    } catch (e) {
      // 本地存储不可用不影响本次会话中的折叠交互。
    }
  },

  // ===== 弹窗开关 & 全局交互（规范三.3：遮罩可关闭）=====
  _eventsBound: false,
  bindGlobalEvents() {
    if (this._eventsBound) return;
    this._eventsBound = true;

    document.addEventListener('click', e => {
      const overlay = e.target.closest && e.target.closest('.modal-overlay');
      if (overlay && e.target === overlay) this.closeModal(overlay);
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const opened = document.querySelectorAll('.modal-overlay.active');
      if (opened.length) this.closeModal(opened[opened.length - 1]);
    });
  },
  openModal(id) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) el.classList.add('active');
  },
  /**
   * 关闭弹窗
   * 关闭后会派发 `modal:close` 事件（bubbles），页面可通过
   *   document.getElementById('xxxModal').addEventListener('modal:close', cleanupFn)
   * 挂接清理逻辑（重置表单、清空已选集合等），
   * 保证「点遮罩关闭」与「点 × / 取消关闭」行为一致。
   */
  closeModal(id) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return;
    // 防重入：已关闭的弹窗不再重复派发关闭事件
    const wasActive = el.classList.contains('active');
    if (el.dataset && el.dataset.transient) {
      el.remove();
      if (wasActive) el.dispatchEvent(new CustomEvent('modal:close', { bubbles: true }));
      return;
    }
    if (!wasActive) return;
    el.classList.remove('active');
    el.dispatchEvent(new CustomEvent('modal:close', { bubbles: true }));
  },

  /**
   * 规范化确认弹窗（替代原生 confirm）
   * @param {Object} opts { title, content, okText, cancelText, danger, onOk }
   */
  confirm(opts) {
    const o = Object.assign({ title: '提示', content: '', okText: '确定', cancelText: '取消', danger: false }, opts);
    const old = document.getElementById('commonConfirmModal');
    if (old) old.remove();

    const wrap = document.createElement('div');
    wrap.id = 'commonConfirmModal';
    wrap.className = 'modal-overlay active';
    wrap.dataset.transient = '1';
    wrap.innerHTML =
      '<div class="modal-box" style="width:420px">' +
        '<div class="modal-header"><h3>' + o.title + '</h3>' +
          '<button class="modal-close" type="button" data-act="cancel">×</button></div>' +
        '<div class="modal-body" style="display:flex;gap:12px;align-items:flex-start">' +
          '<span style="font-size:22px;color:var(--warning);line-height:1.2">⚠</span>' +
          '<div style="font-size:14px;line-height:22px;color:var(--text-primary)">' + o.content + '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn" type="button" data-act="cancel">' + o.cancelText + '</button>' +
          '<button class="btn ' + (o.danger ? 'btn-danger' : 'btn-primary') + '" type="button" data-act="ok">' + o.okText + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    const close = () => wrap.remove();
    wrap.addEventListener('click', e => {
      const act = e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'ok') { close(); if (o.onOk) o.onOk(); }
      else if (act === 'cancel') { close(); }
    });
  },

  // ===== 分页渲染 =====
  // 规范二.3：表格下方显示数据总数、当前页码、每页显示数量、总页数
  _pageCallbacks: {},
  renderPagination(opts) {
    const { total, currentPage, pageSize, containerId, infoId, pageInfoId, onPageChange } = opts;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const container = document.getElementById(containerId);
    const infoEl = infoId ? document.getElementById(infoId) : null;

    if (infoEl) infoEl.textContent = total;

    // 当前页码 / 总页数
    const pageInfoEl = pageInfoId ? document.getElementById(pageInfoId) : null;
    if (pageInfoEl) pageInfoEl.textContent = `第 ${currentPage} / ${totalPages} 页`;

    if (!container) return;

    // 回调以容器 ID 为键覆盖注册，避免重复渲染时回调累积
    const cbId = containerId;
    this._pageCallbacks[cbId] = onPageChange;

    let html = '';
    html += `<button class="page-btn" ${currentPage<=1?'disabled':''} onclick="Common._pgGo('${cbId}',1)">«</button>`;
    html += `<button class="page-btn" ${currentPage<=1?'disabled':''} onclick="Common._pgGo('${cbId}',${currentPage-1})">‹</button>`;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) {
      html += `<button class="page-btn${i===currentPage?' active':''}" onclick="Common._pgGo('${cbId}',${i})">${i}</button>`;
    }
    html += `<button class="page-btn" ${currentPage>=totalPages?'disabled':''} onclick="Common._pgGo('${cbId}',${currentPage+1})">›</button>`;
    html += `<button class="page-btn" ${currentPage>=totalPages?'disabled':''} onclick="Common._pgGo('${cbId}',${totalPages})">»</button>`;

    container.innerHTML = html;
  },
  _pgGo(cbId, page) {
    const cb = this._pageCallbacks[cbId];
    if (cb) cb(page);
  },

  // ===== Toast 提示 =====
  showToast(msg, type = 'info') {
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-container toast-${type}`;
    const iconMap = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `<span class="toast-icon">${iconMap[type] || 'ℹ'}</span><span class="toast-msg">${msg}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  },
};
