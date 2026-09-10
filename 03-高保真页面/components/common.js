/**
 * 车辆管理系统 - 公共组件库
 * 包含：侧边栏、头部、面包屑、分页、Toast提示等
 */
const Common = {
  // ===== 侧边栏菜单配置（严格按01-需求文档/页面框架.md） =====
  // disabled: true 表示未开发页面，做淡化处理
  menuConfig: [
    { group: '车辆管理', items: [
      { label: '车辆建档', id: 'vehicle-register', href: 'vehicle-register/vehicle-register-list.html' },
      { label: '车辆资产管理', id: 'asset-manage', href: 'vehicle-asset/vehicle-asset-list.html' },
      { label: '标签管理', id: 'tag-manage', href: 'vehicle-tag/tag-manage-list.html' },
      { label: '车辆资产盘点', id: 'asset-inventory', href: '', disabled: true },
      { label: '车辆资产信息维护', id: 'asset-maintain', href: '', disabled: true },
      { label: '车型管理', id: 'vehicle-model', href: 'vehicle-model/vehicle-model-list.html' },
    ]},
    { group: '车辆调度管理', items: [
      { label: '可用车辆库', id: 'transfer-available', href: 'vehicle-dispatch/dispatch-vehicle-list.html' },
      { label: '调度记录管理', id: 'transfer-apply', href: 'vehicle-dispatch/dispatch-record-list.html' },
    ]},
    { group: '维保管理', items: [
      { label: '维修申请工单', id: 'repair-apply', href: '', disabled: true },
      { label: '维修结算单', id: 'repair-settle', href: '', disabled: true },
      { label: '保养任务清单', id: 'maintain-task', href: '', disabled: true },
      { label: '保养结算单', id: 'maintain-settle', href: '', disabled: true },
    ]},
    { group: '合规管理', items: [
      { label: '保险管理', id: 'insurance', href: '', disabled: true },
      { label: '年检管理', id: 'annual-inspect', href: '', disabled: true },
      { label: '证照管理', id: 'license', href: '', disabled: true },
      { label: '到期预警', id: 'expire-warn', href: '', disabled: true },
    ]},
    { group: '风险管理', items: [
      { label: '违章记录', id: 'violation-record', href: '', disabled: true },
      { label: '违章费用', id: 'violation-fee', href: '', disabled: true },
      { label: '事故记录', id: 'accident-record', href: '', disabled: true },
      { label: '事故理赔', id: 'accident-claim', href: '', disabled: true },
    ]},
    { group: '费用管理', items: [
      { label: '加油费明细台账', id: 'fuel-fee', href: '', disabled: true },
      { label: '水费明细台账', id: 'water-fee', href: '', disabled: true },
      { label: '电费明细台账', id: 'electric-fee', href: '', disabled: true },
      { label: '通行费明细台账', id: 'toll-fee', href: '', disabled: true },
      { label: '停车费明细台账', id: 'parking-fee', href: '', disabled: true },
      { label: '运输费明细台账', id: 'transport-fee', href: '', disabled: true },
    ]},
    { group: '车辆退出管理', items: [
      { label: '退出申请', id: 'exit-apply', href: '', disabled: true },
      { label: '退出审批', id: 'exit-approve', href: '', disabled: true },
      { label: '车辆处置', id: 'exit-dispose', href: '', disabled: true },
      { label: '车辆归档', id: 'exit-archive', href: '', disabled: true },
    ]},
    { group: '系统管理', items: [
      { label: '预警规则配置', id: 'alert-config', href: '', disabled: true },
      { label: '维保策略管理', id: 'maintenance-strategy', href: '', disabled: true },
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
    if (opts.sidebarId) this.renderSidebar(opts.sidebarId, opts.activeMenuId);
    // 顶部导航左侧仅展示当前模块名（H3 20px），不展示面包屑（规范二.5 强制）
    if (opts.headerId) {
      this.renderHeader(
        opts.headerId,
        opts.moduleName || this.getModuleName(opts.activeMenuId),
        opts.headerOptions
      );
    }
    this.bindGlobalEvents();
  },

  // ===== 由 activeMenuId 反查所属一级模块名 =====
  getModuleName(activeMenuId) {
    const group = this.menuConfig.find(g => g.items.some(i => i.id === activeMenuId));
    return group ? group.group : '';
  },

  // ===== 侧边栏渲染 =====
  renderSidebar(containerId, activeMenuId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<div class="sidebar-logo">车辆管理系统</div>';
    html += '<nav class="sidebar-nav">';

    this.menuConfig.forEach(group => {
      // 判断当前组是否包含激活菜单项，若包含则默认展开
      const hasActive = group.items.some(item => item.id === activeMenuId);
      const openCls = hasActive ? ' open' : '';
      html += `<div class="menu-group${openCls}">`;
      html += `<div class="menu-group-title" onclick="Common.toggleMenuGroup(this)">${group.group}<span class="group-arrow">▼</span></div>`;
      html += `<div class="menu-group-items">`;
      if (group.items.length === 0) {
        html += `<div class="menu-item disabled">暂未开放</div>`;
      } else {
        group.items.forEach(item => {
          const isDisabled = item.disabled;
          const cls = [
            'menu-item',
            item.id === activeMenuId ? 'active' : '',
            isDisabled ? 'disabled' : '',
          ].filter(Boolean).join(' ');
          const href = !isDisabled && item.href ? (this._basePath + item.href) : 'javascript:;';
          const suffix = isDisabled ? '<span class="menu-item-badge">未开放</span>' : '';
          html += `<a class="${cls}" href="${href}" data-id="${item.id}"${isDisabled ? ' onclick="return false;"' : ''}>${item.label}${suffix}</a>`;
        });
      }
      html += '</div></div>';
    });

    html += '</nav>';
    container.innerHTML = html;
  },

  // ===== 菜单组展开/收起 =====
  toggleMenuGroup(titleEl) {
    const group = titleEl.parentElement;
    group.classList.toggle('open');
  },

  // ===== 头部渲染（规范二.5：禁止面包屑，左侧仅当前模块名 H3 20px）=====
  renderHeader(containerId, moduleName, options) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<div class="header-left">';
    if (moduleName) html += `<span class="header-module-name">${moduleName}</span>`;
    html += '</div>';

    html += '<div class="header-right">';
    if (options && options.showProject !== false) {
      html += '<div class="project-select"><select><option>全部项目</option></select></div>';
    }
    html += '<div class="user-info"><span class="user-avatar">管</span><span class="user-name">管理员</span></div>';
    html += '</div>';

    container.innerHTML = html;
    container.className = 'page-header-bar';
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
