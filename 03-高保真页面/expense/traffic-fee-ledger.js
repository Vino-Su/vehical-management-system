/**
 * 流量费用明细：以车辆为主体、按月度展示流量费用。
 * 口径：单卡费用 = 该卡当月用量 × 所属流量池单位成本；单车费用 = 各卡费用之和；单车单位为加权平均成本。
 */
(function () {
  'use strict';

  const MONTH_COUNT = 12;
  const currency = value => `¥${Number(value || 0).toFixed(2)}`;
  const number = (value, digits = 2) => Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const text = value => (value === undefined || value === null || value === '') ? '—' : String(value);
  const pad = value => String(value).padStart(2, '0');
  const formatMonth = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

  const columns = [
    ['month', '统计月份'], ['plate', '车牌号'], ['vin', 'VIN码'], ['project', '归属项目'],
    ['cardCount', '关联卡数'], ['usage', '当月用量 (GB)'], ['rate', '流量使用率'],
    ['unitCost', '单位成本 (元/GB)'], ['amount', '流量费用 (元)']
  ];

  // 车辆与关联 SIM 卡：车辆、牌照与卡号与「车辆流量明细」保持一致；cost 为该卡所属流量池的单位流量成本
  const vehicles = [
    { vin: 'LSVAU2A39EN000001', plate: '京ADG090', project: '鸠江项目', sims: [
      { imsi: '460011234567800', carrier: '中国联通', plan: '10G/月', quota: 10, terminal: 'T-BOX', device: 'TBOX-2025-001', cost: 0.68 },
      { imsi: '460041234567890', carrier: '中国移动', plan: '100G/月', quota: 100, terminal: 'ADU', device: 'ADU-2025-001', cost: 0.55 }
    ] },
    { vin: 'LSVAU2A39EN000002', plate: '京ADG091', project: '椒北街道', sims: [
      { imsi: '460011234567891', carrier: '中国移动', plan: '100G/月', quota: 100, terminal: 'ADU', device: 'ADU-2025-002', cost: 0.55 }
    ] },
    { vin: 'LSVAU2A39EN000003', plate: '浙JAR6538', project: '镜湖区项目', sims: [
      { imsi: '460031234567892', carrier: '中国联通', plan: '10G/月', quota: 10, terminal: 'T-BOX', device: 'TBOX-2025-003', cost: 0.68 }
    ] },
    { vin: 'LSVAU2A39EN000005', plate: '浙JDB1062', project: '镜湖区项目', sims: [
      { imsi: '460031234567898', carrier: '中国联通', plan: '10G/月', quota: 10, terminal: 'T-BOX', device: 'TBOX-2025-004', cost: 0.68 }
    ] },
    { vin: 'LSVAU2A39EN000006', plate: '沪AAB124', project: '嘉定研发', sims: [
      { imsi: '460041234567893', carrier: '中国移动', plan: '100G/月', quota: 100, terminal: 'ADU', device: 'ADU-2025-005', cost: 0.55 }
    ] },
    { vin: 'LSVAU2A39EN000007', plate: '京ADJ055', project: '鸠江项目', sims: [
      { imsi: '460011234567894', carrier: '中国移动', plan: '100G/月', quota: 100, terminal: 'ADU', device: 'ADU-2025-006', cost: 0.55 }
    ] },
    { vin: 'LSVAU2A39EN000008', plate: '京ADJ056', project: '椒北街道', sims: [
      { imsi: '460041234567899', carrier: '中国移动', plan: '100G/月', quota: 100, terminal: 'ADU', device: 'ADU-2025-007', cost: 0.55 }
    ] },
    { vin: 'LSVAU2A39EN000009', plate: '粤AEE077', project: '鸠江项目', sims: [
      { imsi: '460031234567895', carrier: '中国联通', plan: '10G/月', quota: 10, terminal: 'T-BOX', device: 'TBOX-2025-008', cost: 0.68 }
    ] },
    { vin: 'LSVAU2A39EN000010', plate: '粤AEE078', project: '嘉定研发', sims: [
      { imsi: '460011234567802', carrier: '中国移动', plan: '100G/月', quota: 100, terminal: 'ADU', device: 'ADU-2025-009', cost: 0.55 }
    ] },
    { vin: 'LSVAU2A39EN000012', plate: '京ADG092', project: '鸠江项目', sims: [
      { imsi: '460031234567801', carrier: '中国移动', plan: '100G/月', quota: 100, terminal: 'ADU', device: 'ADU-2025-010', cost: 0.55 }
    ] },
    { vin: 'LSVAU2A39EN000015', plate: '浙JDB1063', project: '镜湖区项目', sims: [
      { imsi: '460011234567905', carrier: '中国联通', plan: '10G/月', quota: 10, terminal: 'T-BOX', device: 'TBOX-2025-011', cost: 0.68 }
    ] },
    { vin: 'LSVAU2A39EN000018', plate: '皖BAX218', project: '经开东区项目', sims: [
      { imsi: '460031234567908', carrier: '中国移动', plan: '100G/月', quota: 100, terminal: 'ADU', device: 'ADU-2025-012', cost: 0.55 }
    ] },
    { vin: 'LSVAU2A39EN000021', plate: '皖BAX221', project: '经开东区项目', sims: [
      { imsi: '460041234567911', carrier: '中国联通', plan: '10G/月', quota: 10, terminal: 'T-BOX', device: 'TBOX-2025-013', cost: 0.68 }
    ] },
    { vin: 'LSVAU2A39EN000026', plate: '皖BAX226', project: '', sims: [
      { imsi: '460041234567916', carrier: '中国联通', plan: '10G/月', quota: 10, terminal: 'T-BOX', device: 'TBOX-2025-014', cost: 0.68 }
    ] }
  ];

  let allData = [], filteredData = [], currentPage = 1, pageSize = 10, pager = null;
  const selectedIds = new Set();

  // 近 12 个月逐车生成月度记录：T-BOX 卡用量 4.0~12.4GB，ADU 卡用量 12.0~44.9GB
  function buildRecords() {
    const end = new Date();
    const records = [];
    let id = 0;
    vehicles.forEach(vehicle => {
      for (let index = 0; index < MONTH_COUNT; index += 1) {
        const month = formatMonth(new Date(end.getFullYear(), end.getMonth() - index, 1));
        let usage = 0, quota = 0, fee = 0;
        const simRows = vehicle.sims.map((sim, simIndex) => {
          const seed = Number(sim.imsi.slice(-4)) % 37;
          const cardUsage = sim.terminal === 'ADU'
            ? ((seed * 19 + index * 37 + simIndex * 41) % 3300 + 1200) / 100
            : ((seed * 11 + index * 17 + simIndex * 29) % 85 + 40) / 10;
          const cardFee = cardUsage * sim.cost;
          usage += cardUsage; quota += sim.quota; fee += cardFee;
          return Object.assign({}, sim, { usage: cardUsage, fee: cardFee });
        });
        records.push({
          id: (id += 1), month, plate: vehicle.plate, vin: vehicle.vin, project: vehicle.project,
          simRows, cardCount: vehicle.sims.length, usage: Number(usage.toFixed(2)), quota,
          fee: Number(fee.toFixed(2)), unitCost: usage ? fee / usage : null, rate: quota ? usage / quota * 100 : null
        });
      }
    });
    return records.sort((a, b) => b.month.localeCompare(a.month) || a.vin.localeCompare(b.vin));
  }

  function init() {
    Common.initLayout({ basePath: '../', sidebarId: 'sidebar', activeMenuId: 'data-fee', headerId: 'header', headerOptions: { showProject: false } });
    fillProjects();
    setDefaultMonths();
    allData = buildRecords();
    filteredData = [...allData];
    bind();
    initPagination();
    render();
  }

  function fillProjects() {
    const options = Array.from(new Set(vehicles.map(vehicle => vehicle.project).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-CN'));
    document.getElementById('projectFilter').innerHTML = `<option value="">全部</option>${options.map(project => `<option>${project}</option>`).join('')}`;
  }

  function setDefaultMonths() {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - (MONTH_COUNT - 1), 1);
    document.getElementById('startMonth').value = formatMonth(start);
    document.getElementById('endMonth').value = formatMonth(end);
  }

  function bind() {
    document.getElementById('searchBtn').addEventListener('click', search);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('exportBtn').addEventListener('click', exportData);
  }

  function initPagination() {
    pager = new Pagination({
      container: 'paginationEl',
      pageSize,
      pageSizeOptions: [10, 20, 50],
      size: 'medium',
      onPageChange: (page, size) => { currentPage = page; pageSize = size; render(); }
    });
  }

  function render() {
    if (pager) {
      pager.setTotal(filteredData.length);
      currentPage = pager.getCurrentPage();
      pageSize = pager.getPageSize();
    }
    renderHeader();
    renderBody(filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize));
    renderSummary();
  }

  function pageRecords() {
    return filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }

  function renderHeader() {
    const html = ['<th class="col-center" style="width:48px"><input id="selectAll" type="checkbox" aria-label="全选" /></th>']
      .concat(columns.map(([, label]) => `<th class="col-center">${label}</th>`))
      .concat('<th class="col-center" style="width:80px">操作</th>').join('');
    document.getElementById('tableHead').innerHTML = `<tr>${html}</tr>`;
    const records = pageRecords();
    const selectAll = document.getElementById('selectAll');
    selectAll.checked = records.length > 0 && records.every(record => selectedIds.has(record.id));
    selectAll.addEventListener('change', event => {
      records.forEach(record => event.target.checked ? selectedIds.add(record.id) : selectedIds.delete(record.id));
      render();
    });
  }

  function renderBody(records) {
    const body = document.getElementById('tableBody');
    if (!records.length) {
      body.innerHTML = `<tr><td colspan="${columns.length + 2}" class="ledger-empty"><strong>暂无符合条件的记录</strong>请调整查询条件后重试</td></tr>`;
      return;
    }
    body.innerHTML = records.map(record => {
      const cells = columns.map(([key]) => `<td class="col-center ${['month', 'vin', 'usage', 'unitCost'].includes(key) ? 'num' : ''}">${cell(record, key)}</td>`).join('');
      return `<tr class="${selectedIds.has(record.id) ? 'selected' : ''}"><td class="col-center"><input type="checkbox" ${selectedIds.has(record.id) ? 'checked' : ''} aria-label="选择 ${record.plate} ${record.month} 流量费用" onchange="TrafficFeeLedger.toggle(${record.id},this.checked)" /></td>${cells}<td class="col-center"><div class="ledger-action-cell"><button class="btn-link" type="button" onclick="TrafficFeeLedger.detail(${record.id})">详情</button></div></td></tr>`;
    }).join('');
  }

  function cell(record, key) {
    if (key === 'month') return record.month;
    if (key === 'plate') return text(record.plate);
    if (key === 'vin') return record.vin;
    if (key === 'project') return record.project || '<span class="tag tag-default">未归属</span>';
    if (key === 'cardCount') return `${record.cardCount} 张`;
    if (key === 'usage') return number(record.usage);
    if (key === 'rate') return rateCell(record.rate);
    if (key === 'unitCost') return record.unitCost === null ? '—' : number(record.unitCost);
    if (key === 'amount') return `<span class="fee-amount">${currency(record.fee)}</span>`;
    return '—';
  }

  function rateCell(rate) {
    if (rate === null) return '—';
    const level = rate > 100 ? 'over' : rate >= 80 ? 'warn' : '';
    const fillClass = level ? `fee-meter-fill ${level}` : 'fee-meter-fill';
    const valueClass = level === 'over' ? 'fee-meter-value is-over' : 'fee-meter-value';
    return `<div class="fee-meter"><span class="${valueClass}">${rate.toFixed(1)}%</span><span class="fee-meter-track"><span class="${fillClass}" style="width:${Math.min(100, rate).toFixed(1)}%"></span></span></div>`;
  }

  function renderSummary() {
    const totalUsage = filteredData.reduce((sum, record) => sum + record.usage, 0);
    const totalFee = filteredData.reduce((sum, record) => sum + record.fee, 0);
    const vehicleCount = new Set(filteredData.map(record => record.vin)).size;
    document.getElementById('summary').innerHTML = `<div class="ledger-summary-item"><span class="ledger-summary-label">当前筛选</span><span class="ledger-summary-value num">${filteredData.length}</span><span class="ledger-summary-label">条</span></div><div class="ledger-summary-item"><span class="ledger-summary-label">车辆</span><span class="ledger-summary-value num">${vehicleCount}</span><span class="ledger-summary-label">辆</span></div><div class="ledger-summary-item"><span class="ledger-summary-label">用量合计</span><span class="ledger-summary-value num">${number(totalUsage, 1)}</span><span class="ledger-summary-label">GB</span></div><div class="ledger-summary-item primary"><span class="ledger-summary-label">费用合计</span><span class="ledger-summary-value num">${currency(totalFee)}</span></div><div class="ledger-selection" ${selectedIds.size ? '' : 'style="visibility:hidden"'}>已选择 <strong class="num">${selectedIds.size}</strong> 条</div>`;
  }

  function search() {
    const start = document.getElementById('startMonth').value;
    const end = document.getElementById('endMonth').value;
    if (start && end && start > end) { Common.showToast('开始月份不能晚于结束月份', 'error'); return; }
    const plate = document.getElementById('plateFilter').value.trim();
    const vin = document.getElementById('vinFilter').value.trim();
    const project = document.getElementById('projectFilter').value;
    filteredData = allData.filter(record =>
      (!start || record.month >= start) && (!end || record.month <= end) &&
      (!plate || record.plate.includes(plate)) && (!vin || record.vin.toLowerCase().includes(vin.toLowerCase())) &&
      (!project || record.project === project));
    selectedIds.clear();
    resetToFirstPage();
  }

  function reset() {
    document.getElementById('plateFilter').value = '';
    document.getElementById('vinFilter').value = '';
    document.getElementById('projectFilter').value = '';
    setDefaultMonths();
    filteredData = [...allData];
    selectedIds.clear();
    resetToFirstPage();
  }

  function resetToFirstPage() {
    if (pager) { pager.reset(); } else { currentPage = 1; render(); }
  }

  function detail(id) {
    const record = allData.find(item => item.id === id);
    if (!record) return;
    document.getElementById('detailTitle').textContent = `流量费用详情 · ${record.plate || record.vin} · ${record.month}`;
    const rows = [
      ['统计月份', record.month], ['车牌号', text(record.plate)], ['VIN码', record.vin],
      ['归属项目', record.project || '未归属'], ['关联卡数', `${record.cardCount} 张`],
      ['当月用量', `${number(record.usage)} GB`], ['流量使用率', record.rate === null ? '—' : `${record.rate.toFixed(1)}%`],
      ['单位成本（加权平均）', record.unitCost === null ? '—' : `${number(record.unitCost)} 元/GB`], ['流量费用合计', currency(record.fee)]
    ].map(([label, value]) => `<div class="ledger-detail-row"><div class="ledger-detail-label">${label}</div><div class="ledger-detail-value num">${value}</div></div>`).join('');
    const simRows = record.simRows.map(sim => `<tr><td class="col-center num">${sim.imsi}</td><td class="col-center">${sim.carrier}</td><td class="col-center">${sim.plan}</td><td class="col-center">${sim.terminal}</td><td class="col-center num">${sim.device}</td><td class="col-center num">${number(sim.usage)}</td><td class="col-center num">${number(sim.cost)}</td><td class="col-center num fee-amount">${currency(sim.fee)}</td></tr>`).join('');
    document.getElementById('detailBody').innerHTML = `<div class="ledger-detail-grid">${rows}</div><div class="fee-detail-block"><div class="fee-detail-title">按 SIM 卡拆分明细</div><div class="table-wrapper"><table class="fee-detail-table"><thead><tr><th class="col-center">IMSI</th><th class="col-center">运营商</th><th class="col-center">套餐</th><th class="col-center">终端类型</th><th class="col-center">硬件识别码</th><th class="col-center">当月用量 (GB)</th><th class="col-center">单位成本 (元/GB)</th><th class="col-center">流量费用 (元)</th></tr></thead><tbody>${simRows}</tbody></table></div></div>`;
    Common.openModal('detailModal');
  }

  function exportData() {
    if (!filteredData.length) { Common.showToast('暂无可导出的流量费用明细', 'warning'); return; }
    if (selectedIds.size) { Common.showToast(`已导出选中的 ${selectedIds.size} 条流量费用明细`, 'success'); return; }
    Common.confirm({
      title: '确认导出', content: `当前未选择记录，将导出当前查询条件下的全部 ${filteredData.length} 条记录，是否继续？`, okText: '确认导出',
      onOk: () => Common.showToast('导出任务已创建，请稍后在导出记录中下载', 'success')
    });
  }

  window.TrafficFeeLedger = {
    toggle: (id, checked) => { checked ? selectedIds.add(id) : selectedIds.delete(id); render(); },
    detail, exportData
  };
  document.addEventListener('DOMContentLoaded', init);
}());
