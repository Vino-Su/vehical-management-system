/**
 * 车辆管理系统 - 公共组件库
 * 包含：侧边栏、头部、面包屑、分页、Toast提示等
 */
const Common = {
  // ===== 侧边栏菜单配置（严格按01-需求文档/页面框架.md） =====
  menuConfig: [
    { group: '车辆管理', items: [
      { label: '车辆建档', id: 'vehicle-register', href: 'vehicle-register/vehicle-register-list.html' },
      { label: '车辆资产管理', id: 'asset-manage', href: 'vehicle-asset/vehicle-asset-list.html' },
      { label: '车辆资产盘点', id: 'asset-inventory', href: '' },
      { label: '车辆资产信息维护', id: 'asset-maintain', href: '' },
    ]},
    { group: '车辆调拨管理', items: [
      { label: '可用车辆库', id: 'transfer-available', href: '' },
      { label: '调拨申请', id: 'transfer-apply', href: '' },
      { label: '调拨审批', id: 'transfer-approve', href: '' },
    ]},
    { group: '车辆运行管理', items: [] },
    { group: '车辆退出管理', items: [] },
    { group: '系统管理', items: [
      { label: '车型管理', id: 'vehicle-model', href: 'system-management/vehicle-model-list.html' },
      { label: '预警规则配置', id: 'alert-config', href: '' },
      { label: '维保策略管理', id: 'maintenance-strategy', href: '' },
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
      html += `<div class="menu-group">`;
      html += `<div class="menu-group-title">${group.group}</div>`;
      html += `<div class="menu-group-items">`;
      if (group.items.length === 0) {
        html += `<div class="menu-item disabled">暂未开放</div>`;
      } else {
        group.items.forEach(item => {
          const cls = item.id === activeMenuId ? 'menu-item active' : 'menu-item';
          const href = item.href ? (this._basePath + item.href) : 'javascript:;';
          html += `<a class="${cls}" href="${href}" data-id="${item.id}">${item.label}</a>`;
        });
      }
      html += '</div></div>';
    });

    html += '</nav>';
    container.innerHTML = html;
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
