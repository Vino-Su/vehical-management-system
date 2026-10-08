(function () {
  'use strict';

  Common.initLayout({
    basePath: '../', sidebarId: 'sidebar', headerId: 'header',
    activeMenuId: 'vehicle-use-records', headerOptions: { showProject: false }
  });

  // 本地原型数据与参考页面的三种状态、字段口径保持一致。
  var source = [
    ['张建国','粤B·12345','深圳南山智慧环卫项目','2026-06-20 08:00','2026-06-24 18:30',6390,450,'returned','138****6001','调度员李娜','调度员李娜','完成日常巡检作业'],
    ['李海涛','粤B·67890','深圳南山智慧环卫项目','2026-06-23 09:15','2026-06-23 17:45',510,180,'returned','138****6002','调度员李娜','调度员李娜',''],
    ['王志刚','粤B·22222','深圳南山智慧环卫项目','2026-06-21 11:00','',null,null,'using','138****6003','调度员王芳','','夜间作业进行中'],
    ['陈伟强','粤B·66666','深圳南山智慧环卫项目','2026-06-17 19:10','2026-06-18 07:20',730,260,'returned','138****6004','调度员王芳','调度员王芳',''],
    ['林大鹏','粤B·88888','深圳南山智慧环卫项目','2026-06-12 10:45','2026-06-15 16:00',4635,820,'returned','138****6005','调度员李娜','调度员李娜','周末应急加班'],
    ['赵福来','京C·33333','北京朝阳清洁项目','2026-06-20 07:50','2026-06-20 18:30',640,210,'returned','139****7001','调度员张宁','调度员张宁',''],
    ['钱长贵','沪D·44444','上海浦东环卫项目','2026-06-19 16:30','',null,null,'using','139****7002','调度员孙浩','','临时支援用车'],
    ['孙建军','粤A·55555','广州天河环卫项目','2026-06-18 11:00','2026-06-18 19:30',510,160,'returned','139****7003','调度员周强','调度员周强',''],
    ['周文斌','粤B·66666','深圳南山智慧环卫项目','2026-06-17 19:10','2026-06-18 06:00',650,190,'returned','138****6006','调度员王芳','调度员王芳',''],
    ['吴东海','京C·77777','北京朝阳清洁项目','2026-06-16 08:00','2026-06-16 20:00',720,230,'returned','139****7004','调度员张宁','调度员张宁',''],
    ['郑南方','沪D·88888','上海浦东环卫项目','2026-06-15 15:45','',null,null,'using','139****7005','调度员孙浩','','跨日作业进行中'],
    ['王保国','粤B·99999','深圳南山智慧环卫项目','2026-06-14 10:20','2026-06-14 21:00',640,210,'returned','138****6007','调度员李娜','调度员李娜',''],
    ['陈卫东','粤A·00000','广州天河环卫项目','2026-06-13 13:30','2026-06-14 08:00',1110,370,'returned','139****7006','调度员周强','调度员周强','夜班作业'],
    ['林国华','粤B·88888','深圳南山智慧环卫项目','2026-06-10 10:45','2026-06-10 19:00',495,150,'returned','138****6008','调度员王芳','调度员王芳',''],
    ['何守业','京C·11111','北京朝阳清洁项目','2026-06-11 15:20','2026-06-11 23:45',505,170,'returned','139****7007','调度员张宁','调度员张宁',''],
    ['梁宏达','沪D·22222','上海浦东环卫项目','2026-06-10 09:00','2026-06-10 18:30',570,190,'returned','139****7008','调度员孙浩','调度员孙浩',''],
    ['宋明亮','粤B·12345','深圳南山智慧环卫项目','2026-06-08 07:30','2026-06-08 12:00',270,80,'returned','138****6009','调度员李娜','调度员李娜','短途作业'],
    ['韩志强','粤B·22222','深圳南山智慧环卫项目','2026-06-25 09:00','2026-06-25 08:00',null,null,'abnormal','138****6010','调度员李娜','调度员李娜','交车时间早于绑车时间，请联系调度员核实'],
    ['杨春生','粤A·55555','广州天河环卫项目','2026-06-05 08:00','2026-06-05 19:00',660,220,'returned','139****7009','调度员周强','调度员周强',''],
    ['朱海龙','粤B·67890','深圳南山智慧环卫项目','2026-06-03 06:30','2026-06-03 18:00',690,230,'returned','138****6011','调度员李娜','调度员李娜',''],
    ['秦天宇','京C·33333','北京朝阳清洁项目','2026-06-01 07:00','',null,null,'using','139****7010','调度员张宁','','长期驻场作业中'],
    ['尤鹏飞','沪D·44444','上海浦东环卫项目','2026-05-28 09:00','2026-05-28 20:30',690,240,'returned','139****7011','调度员孙浩','调度员孙浩',''],
    ['许家辉','粤B·99999','深圳南山智慧环卫项目','2026-05-25 10:00','2026-05-25 19:30',570,180,'returned','138****6012','调度员李娜','调度员李娜','']
  ];
  var records = source.map(function (row, index) {
    return { id:index + 1, driver:row[0], plate:row[1], project:row[2], bindTime:row[3], returnTime:row[4], durationMin:row[5], mileage:row[6], status:row[7], phone:row[8], bindOperator:row[9], returnOperator:row[10], remark:row[11] };
  });
  var filtered = records.slice();
  var selectedIds = new Set();
  var currentPage = 1;
  var pageSize = 10;
  var exportRows = [];
  var tbody = document.getElementById('tableBody');
  var checkAll = document.getElementById('checkAll');
  var filterBar = document.querySelector('.filter-bar');
  var primaryFilters = filterBar.querySelector('.filter-primary');
  var extraFilters = filterBar.querySelector('.filter-extra');
  var filterActions = primaryFilters.querySelector('.filter-actions');
  var moreButton = primaryFilters.querySelector('.filter-more-toggle');
  var filterItems = ['driverFilter','plateFilter','statusFilter','bindStart','returnStart'].map(function (id) {
    return document.getElementById(id).closest('.filter-item');
  });
  var pager = new Pagination({
    container:'paginationBar', pageSize:pageSize, pageSizeOptions:[10,20,50,100], showStats:false,
    onPageChange:function (page, size) { currentPage = page; pageSize = size; renderTable(); }
  });

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char];
    });
  }
  function statusText(record) { return { returned:'已交车', using:'用车中', abnormal:'数据异常' }[record.status]; }
  function durationText(record) { return record.status === 'using' ? '进行中' : record.status === 'abnormal' || record.durationMin == null ? '—' : record.durationMin.toLocaleString('zh-CN'); }
  function mileageText(record) { return record.status !== 'returned' || record.mileage == null ? '—' : record.mileage.toLocaleString('zh-CN'); }
  function pageRows() { return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize); }

  function fitFiltersToFirstRow() {
    filterItems.forEach(function (item) { primaryFilters.insertBefore(item, filterActions); });
    moreButton.style.display = '';
    var gap = parseFloat(getComputedStyle(primaryFilters).columnGap) || 16;
    var toggleMargin = parseFloat(getComputedStyle(moreButton).marginLeft) || 0;
    var available = primaryFilters.clientWidth;
    var allItemsWidth = filterItems.reduce(function (sum, item) { return sum + item.offsetWidth; }, 0);
    var allFit = allItemsWidth + filterActions.offsetWidth + gap * filterItems.length <= available;
    var visibleCount = filterItems.length;
    if (!allFit) {
      var used = filterActions.offsetWidth + moreButton.offsetWidth + toggleMargin + gap;
      visibleCount = 0;
      filterItems.forEach(function (item) {
        var next = used + item.offsetWidth + gap;
        if (next <= available || visibleCount === 0) { used = next; visibleCount += 1; }
      });
    }
    filterItems.slice(visibleCount).forEach(function (item) { extraFilters.appendChild(item); });
    moreButton.style.display = allFit ? 'none' : '';
    if (allFit) {
      extraFilters.classList.remove('is-expanded');
      moreButton.classList.remove('is-expanded');
      moreButton.setAttribute('aria-expanded', 'false');
      moreButton.querySelector('.filter-more-text').textContent = '展开更多';
    }
  }

  function renderTable() {
    var rows = pageRows();
    tbody.innerHTML = rows.length ? rows.map(function (record) {
      var tag = { returned:'tag-green', using:'tag-orange', abnormal:'tag-red' }[record.status];
      return '<tr' + (selectedIds.has(record.id) ? ' class="selected"' : '') + '>' +
        '<td class="col-center"><input class="row-check" type="checkbox" data-id="' + record.id + '" aria-label="选择' + escapeHtml(record.driver) + '的用车记录"' + (selectedIds.has(record.id) ? ' checked' : '') + '></td>' +
        '<td class="col-center ellipsis" title="' + escapeHtml(record.driver) + '">' + escapeHtml(record.driver) + '</td>' +
        '<td class="col-center ellipsis" title="' + escapeHtml(record.plate) + '">' + escapeHtml(record.plate) + '</td>' +
        '<td class="col-center num">' + record.bindTime + '</td><td class="col-center num">' + (record.returnTime || '—') + '</td>' +
        '<td class="col-center num">' + durationText(record) + '</td><td class="col-center num">' + mileageText(record) + '</td>' +
        '<td class="col-center"><span class="tag ' + tag + '">' + statusText(record) + '</span></td>' +
        '<td class="col-center"><button class="btn-link record-link" type="button" data-detail="' + record.id + '">查看</button></td></tr>';
    }).join('') : '<tr class="empty-row"><td colspan="9">暂无用车记录</td></tr>';
    checkAll.checked = rows.length > 0 && rows.every(function (record) { return selectedIds.has(record.id); });
    checkAll.indeterminate = !checkAll.checked && rows.some(function (record) { return selectedIds.has(record.id); });
    document.getElementById('selectedCount').textContent = selectedIds.size;
    document.getElementById('selectionSummary').classList.toggle('visible', selectedIds.size > 0);
    document.getElementById('exportButton').disabled = filtered.length === 0;
    document.getElementById('totalCount').textContent = filtered.length;
    document.getElementById('pageInfo').textContent = '第 ' + currentPage + ' / ' + (Math.ceil(filtered.length / pageSize) || 1) + ' 页';
  }

  function applyFilters() {
    var values = {};
    ['driverFilter','plateFilter','bindStart','bindEnd','returnStart','returnEnd','statusFilter'].forEach(function (id) { values[id] = document.getElementById(id).value.trim(); });
    if (values.bindStart && values.bindEnd && values.bindStart > values.bindEnd) { Common.showToast('绑车开始日期不能晚于结束日期', 'warning'); return; }
    if (values.returnStart && values.returnEnd && values.returnStart > values.returnEnd) { Common.showToast('交车开始日期不能晚于结束日期', 'warning'); return; }
    filtered = records.filter(function (record) {
      var bind = record.bindTime.slice(0, 10);
      var returned = record.returnTime.slice(0, 10);
      return (!values.driverFilter || record.driver.includes(values.driverFilter)) &&
        (!values.plateFilter || record.plate.includes(values.plateFilter)) &&
        (!values.statusFilter || record.status === values.statusFilter) &&
        (!values.bindStart || bind >= values.bindStart) && (!values.bindEnd || bind <= values.bindEnd) &&
        (!values.returnStart || returned && returned >= values.returnStart) &&
        (!values.returnEnd || returned && returned <= values.returnEnd);
    });
    selectedIds.clear();
    currentPage = 1;
    pager.setTotal(filtered.length);
    pager.reset();
    renderTable();
  }

  function detailItem(label, value, full) {
    return '<div class="detail-item' + (full ? ' full' : '') + '"><dt>' + label + '</dt><dd>' + escapeHtml(value || '—') + '</dd></div>';
  }
  function openDetail(id) {
    var record = records.find(function (item) { return item.id === id; });
    if (!record) return;
    document.getElementById('detailGrid').innerHTML = [
      detailItem('司机名称',record.driver), detailItem('司机电话',record.phone),
      detailItem('关联车牌号',record.plate), detailItem('所属项目',record.project),
      detailItem('绑车时间',record.bindTime), detailItem('交车时间',record.returnTime || '—（用车中）'),
      detailItem('绑车操作员',record.bindOperator), detailItem('交车操作员',record.returnOperator),
      detailItem('用车时长',durationText(record) + (record.status === 'returned' ? ' min' : '')),
      detailItem('轨迹里程',mileageText(record) + (record.status === 'returned' ? ' km' : '')),
      detailItem('状态',statusText(record)), detailItem('备注',record.remark,true)
    ].join('');
    Common.openModal('detailModal');
  }

  function openExport() {
    exportRows = selectedIds.size ? filtered.filter(function (record) { return selectedIds.has(record.id); }) : filtered.slice();
    if (!exportRows.length) { Common.showToast('当前查询条件下暂无可导出的数据', 'warning'); return; }
    document.getElementById('exportDescription').textContent = (selectedIds.size ? '将导出已选 ' : '将导出当前查询条件下全部 ') + exportRows.length + ' 条用车记录为 CSV 文件。';
    document.getElementById('exportFileName').value = '用车记录-' + new Date().toLocaleDateString('sv-SE') + '.csv';
    Common.openModal('exportModal');
  }
  function confirmExport() {
    var name = document.getElementById('exportFileName').value.trim().replace(/[\\/:*?"<>|]/g, '_');
    if (!name) { Common.showToast('请输入文件名', 'warning'); return; }
    if (!/\.csv$/i.test(name)) name += '.csv';
    exportCSV({
      filename:name,
      headers:['司机名称','关联车牌号','绑车时间','交车时间','用车时长（min）','轨迹里程（km）','状态'],
      rows:exportRows.map(function (record) { return [record.driver,record.plate,record.bindTime,record.returnTime || '',durationText(record),mileageText(record),statusText(record)]; })
    });
    Common.closeModal('exportModal');
    Common.showToast('已导出 ' + exportRows.length + ' 条用车记录', 'success');
  }

  document.getElementById('searchButton').addEventListener('click', applyFilters);
  document.getElementById('resetButton').addEventListener('click', function () {
    ['driverFilter','plateFilter','bindStart','bindEnd','returnStart','returnEnd','statusFilter'].forEach(function (id) { document.getElementById(id).value = ''; });
    applyFilters();
  });
  document.querySelector('.filter-bar').addEventListener('keydown', function (event) { if (event.key === 'Enter') applyFilters(); });
  document.getElementById('exportButton').addEventListener('click', openExport);
  document.getElementById('confirmExportButton').addEventListener('click', confirmExport);
  document.getElementById('clearSelectionButton').addEventListener('click', function () { selectedIds.clear(); renderTable(); });
  checkAll.addEventListener('change', function () {
    pageRows().forEach(function (record) { if (checkAll.checked) selectedIds.add(record.id); else selectedIds.delete(record.id); });
    renderTable();
  });
  tbody.addEventListener('change', function (event) {
    if (!event.target.classList.contains('row-check')) return;
    var id = Number(event.target.dataset.id);
    if (event.target.checked) selectedIds.add(id); else selectedIds.delete(id);
    renderTable();
  });
  tbody.addEventListener('click', function (event) {
    var button = event.target.closest('[data-detail]');
    if (button) openDetail(Number(button.dataset.detail));
  });
  document.querySelectorAll('[data-close]').forEach(function (button) {
    button.addEventListener('click', function () { Common.closeModal(button.dataset.close); });
  });

  function startResponsiveFilters() {
    fitFiltersToFirstRow();
    if (window.ResizeObserver) new ResizeObserver(fitFiltersToFirstRow).observe(document.querySelector('.main-area'));
    else window.addEventListener('resize', fitFiltersToFirstRow);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startResponsiveFilters);
  else startResponsiveFilters();

  pager.setTotal(filtered.length);
  renderTable();
}());
