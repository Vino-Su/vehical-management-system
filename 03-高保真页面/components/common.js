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
    if (opts.sidebarId) this.renderSidebar(opts.sidebarId, opts.activeMenuId);
    if (opts.headerId) this.renderHeader(opts.headerId, opts.breadcrumbs, opts.headerOptions);
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

  // ===== 头部渲染 =====
  renderHeader(containerId, breadcrumbs, options) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<div class="header-left">';
    if (breadcrumbs && breadcrumbs.length) {
      breadcrumbs.forEach((bc, i) => {
        if (i > 0) html += '<span class="breadcrumb-sep">/</span>';
        if (bc.href) {
          html += `<a class="breadcrumb-item" href="${bc.href}">${bc.label}</a>`;
        } else {
          html += `<span class="breadcrumb-item current">${bc.label}</span>`;
        }
      });
    }
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

  // ===== 分页渲染 =====
  _pageCallbacks: {},
  _pageCallbackId: 0,
  renderPagination(opts) {
    const { total, currentPage, pageSize, containerId, infoId, onPageChange } = opts;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const container = document.getElementById(containerId);
    const infoEl = infoId ? document.getElementById(infoId) : null;

    if (infoEl) infoEl.textContent = total;
    if (!container) return;

    // 注册回调
    const cbId = 'pg_' + (++this._pageCallbackId);
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
