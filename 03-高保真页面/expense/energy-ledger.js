(function () {
  'use strict';

  const icon = { fuel: '加油', water: '加水', charge: '充电' };
  const type = document.body.dataset.ledgerType;
  const currency = n => `¥${Number(n || 0).toFixed(2)}`;
  const number = n => Number(n || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  const localDateTime = value => String(value || '').replace(' ', 'T');
  const text = value => value === undefined || value === null || value === '' ? '—' : String(value);

  const ledgers = {
    fuel: {
      title: '加油费用明细台账', singular: '加油记录', timeLabel: '加油时间', unitLabel: '加油量', unit: 'L', activeMenuId: 'fuel-fee',
      filterExtra: { label: '关联油卡', key: 'oilCard', placeholder: '油卡号' },
      columns: [
        ['plate','车牌号','left'], ['time','加油时间','center'], ['quantity','加油量 (L)','right'], ['unitPrice','加油单价 (元/L)','right'], ['amount','加油金额 (元)','right'], ['oilCard','关联油卡','left'], ['cardBalance','油卡余额 (元)','right'], ['mileage','当前里程 (km)','right'], ['evidence','交易凭证','center'], ['reporter','上报人','center']
      ],
      fields: [
        ['plate','车牌号','text',true], ['vin','车架号','text',true], ['project','所属项目','select',true], ['reporter','上报人','text',true], ['time','加油时间','datetime-local',true], ['unitPrice','加油单价 (元/L)','number',true], ['quantity','加油量 (L)','number',true], ['amount','加油金额 (元)','number',true], ['paymentMethod','支付方式','select',true], ['oilCard','关联油卡','text',true], ['cardBalance','油卡余额 (元)','number',true], ['mileage','当前里程数 (km)','number',true], ['remark','备注','textarea',false]
      ],
      attachments: [['mileagePhoto','里程照片',true], ['voucherPhoto','交易凭证',true]],
      auto: ['unitPrice','quantity'],
      data: [
        ['浙JAR6538','LSVAU2A39EN000001','嘉定研发','王师傅','2026-09-13 08:40',52.30,7.62,398.53,'油卡','ZSH-8920',1230.50,18420],
        ['浙JDB1062','LSVAU2A39EN000002','椒北街道','李师傅','2026-09-12 17:25',46.80,7.55,353.34,'油卡','ZSH-8921',876.20,24688],
        ['皖B·A5268','LSVAU2A39EN000003','镜湖区项目','陈师傅','2026-09-12 09:10',38.60,7.69,296.73,'线上支付','',0,36820],
        ['皖B·D8612','LSVAU2A39EN000004','鸠江项目','张师傅','2026-09-11 15:45',58.10,7.48,434.59,'油卡','ZSH-8872',540.10,19534],
        ['琼A·C2610','LSVAU2A39EN000005','陵水项目','赵师傅','2026-09-10 10:15',44.20,7.66,338.57,'现金','',0,22804],
        ['浙JAR6538','LSVAU2A39EN000001','嘉定研发','王师傅','2026-09-09 07:50',49.70,7.62,378.71,'油卡','ZSH-8920',1629.03,18064],
        ['皖B·A5268','LSVAU2A39EN000003','镜湖区项目','陈师傅','2026-09-08 18:20',41.20,7.70,317.24,'线上支付','',0,36102],
        ['皖B·D8612','LSVAU2A39EN000004','鸠江项目','张师傅','2026-09-07 12:30',51.60,7.54,389.06,'油卡','ZSH-8872',974.69,18943],
        ['浙JDB1062','LSVAU2A39EN000002','椒北街道','李师傅','2026-09-06 16:10',43.50,7.58,329.73,'油卡','ZSH-8921',1229.54,24027],
        ['琼A·C2610','LSVAU2A39EN000005','陵水项目','赵师傅','2026-09-05 08:55',47.10,7.65,360.32,'现金','',0,22118],
        ['皖B·A5268','LSVAU2A39EN000003','镜湖区项目','陈师傅','2026-09-04 19:05',36.70,7.72,283.32,'线上支付','',0,35426]
      ]
    },
    water: {
      title: '加水费用明细台账', singular: '加水记录', timeLabel: '加水时间', unitLabel: '加水量', unit: '吨', activeMenuId: 'water-fee',
      columns: [['plate','车牌号','left'], ['time','加水时间','center'], ['quantity','加水量 (吨)','right'], ['paymentMethod','支付方式','center'], ['amount','加水金额 (元)','right'], ['mileage','当前里程 (km)','right'], ['reporter','上报人','center']],
      fields: [['plate','车牌号','text',true], ['vin','车架号','text',true], ['project','所属项目','select',true], ['reporter','上报人','text',true], ['time','加水时间','datetime-local',true], ['paymentMethod','支付方式','select',true], ['quantity','加水量 (吨)','number',true], ['amount','加水金额 (元)','number',false], ['mileage','当前里程数 (km)','number',false], ['remark','备注','textarea',false]],
      attachments: [['mileagePhoto','里程照片',false], ['voucherPhoto','支付照片',true]],
      data: [
        ['浙JAR6538','LSVAU2A39EN000001','嘉定研发','王师傅','2026-09-13 13:25',2.80,42.00,'月付',18420], ['浙JDB1062','LSVAU2A39EN000002','椒北街道','李师傅','2026-09-12 11:40',3.50,52.50,'月付',24688], ['皖B·A5268','LSVAU2A39EN000003','镜湖区项目','陈师傅','2026-09-11 16:05',2.10,31.50,'线上支付',36820], ['皖B·D8612','LSVAU2A39EN000004','鸠江项目','张师傅','2026-09-10 14:20',4.20,63.00,'现金',19534], ['琼A·C2610','LSVAU2A39EN000005','陵水项目','赵师傅','2026-09-09 09:15',3.10,46.50,'月付',22804], ['浙JAR6538','LSVAU2A39EN000001','嘉定研发','王师傅','2026-09-08 12:10',2.60,39.00,'月付',18064], ['皖B·A5268','LSVAU2A39EN000003','镜湖区项目','陈师傅','2026-09-07 17:30',3.60,54.00,'线上支付',36102], ['皖B·D8612','LSVAU2A39EN000004','鸠江项目','张师傅','2026-09-06 10:45',2.40,36.00,'现金',18943], ['浙JDB1062','LSVAU2A39EN000002','椒北街道','李师傅','2026-09-05 15:35',3.00,45.00,'月付',24027], ['琼A·C2610','LSVAU2A39EN000005','陵水项目','赵师傅','2026-09-04 08:20',2.70,40.50,'月付',22118], ['皖B·A5268','LSVAU2A39EN000003','镜湖区项目','陈师傅','2026-09-03 18:30',2.20,33.00,'线上支付',35426]]
    },
    charge: {
      title: '充电费用明细台账', singular: '充电记录', timeLabel: '充电开始时间', unitLabel: '充电度数', unit: '度', activeMenuId: 'charge-fee',
      columns: [['plate','车牌号','left'], ['time','充电开始时间','center'], ['duration','充电时长 (分钟)','right'], ['paymentMethod','支付方式','center'], ['quantity','充电度数 (度)','right'], ['amount','充电金额 (元)','right'], ['mileage','当前里程 (km)','right'], ['evidence','充电明细','center'], ['reporter','上报人','center']],
      fields: [['plate','车牌号','text',true], ['vin','车架号','text',true], ['project','所属项目','select',true], ['reporter','上报人','text',true], ['time','充电开始时间','datetime-local',true], ['endTime','充电结束时间','datetime-local',true], ['quantity','充电度数 (度)','number',true], ['electricFee','充电电费 (元)','number',true], ['serviceFee','充电服务费 (元)','number',true], ['amount','充电金额 (元)','number',true], ['paymentMethod','支付方式','select',true], ['mileage','当前里程数 (km)','number',false], ['remark','备注','textarea',false]],
      attachments: [['mileagePhoto','里程照片',true], ['chargePhoto','充电明细截图',true], ['voucherPhoto','支付照片',false]],
      auto: ['electricFee','serviceFee'],
      data: [
        ['浙JAR6538','LSVAU2A39EN000001','嘉定研发','王师傅','2026-09-13 20:10','2026-09-13 21:38',88,124.20,26.40,150.60,'线上支付',18420], ['浙JDB1062','LSVAU2A39EN000002','椒北街道','李师傅','2026-09-12 22:15','2026-09-12 23:52',76,106.40,22.80,129.20,'月结',24688], ['皖B·A5268','LSVAU2A39EN000003','镜湖区项目','陈师傅','2026-09-12 19:00','2026-09-12 20:24',70,98.00,21.00,119.00,'线上支付',36820], ['皖B·D8612','LSVAU2A39EN000004','鸠江项目','张师傅','2026-09-11 21:20','2026-09-11 23:08',96,134.40,28.80,163.20,'月结',19534], ['琼A·C2610','LSVAU2A39EN000005','陵水项目','赵师傅','2026-09-10 18:45','2026-09-10 20:02',62,86.80,18.60,105.40,'线上支付',22804], ['浙JAR6538','LSVAU2A39EN000001','嘉定研发','王师傅','2026-09-09 20:35','2026-09-09 21:58',72,100.80,21.60,122.40,'线上支付',18064], ['皖B·A5268','LSVAU2A39EN000003','镜湖区项目','陈师傅','2026-09-08 19:10','2026-09-08 20:37',74,103.60,22.20,125.80,'月结',36102], ['皖B·D8612','LSVAU2A39EN000004','鸠江项目','张师傅','2026-09-07 21:40','2026-09-07 23:20',90,126.00,27.00,153.00,'线上支付',18943], ['浙JDB1062','LSVAU2A39EN000002','椒北街道','李师傅','2026-09-06 22:05','2026-09-06 23:26',68,95.20,20.40,115.60,'月结',24027], ['琼A·C2610','LSVAU2A39EN000005','陵水项目','赵师傅','2026-09-05 19:00','2026-09-05 20:30',75,105.00,22.50,127.50,'线上支付',22118], ['皖B·A5268','LSVAU2A39EN000003','镜湖区项目','陈师傅','2026-09-04 18:30','2026-09-04 19:48',65,91.00,19.50,110.50,'月结',35426]]
    }
  };

  const config = ledgers[type];
  if (!config) return;
  const projects = ['嘉定研发', '椒北街道', '镜湖区项目', '鸠江项目', '陵水项目'];
  const payments = type === 'water' ? ['月付', '现金', '线上支付'] : type === 'charge' ? ['月结', '线上支付', '现金'] : ['油卡', '现金', '线上支付'];
  const byType = new Map(config.fields.map(field => [field[0], field[2]]));
  let editingId = null, deletingId = null, currentPage = 1, pageSize = 10, manuallyAdjusted = false, pager = null;
  let selectedIds = new Set();
  let allData = config.data.map((row, index) => toRecord(row, index + 1));
  let filteredData = [...allData];

  function toRecord(row, id) {
    const base = { id, plate:row[0], vin:row[1], project:row[2], reporter:row[3], time:row[4] };
    if (type === 'fuel') Object.assign(base, { quantity:row[5], unitPrice:row[6], amount:row[7], paymentMethod:row[8], oilCard:row[9], cardBalance:row[10], mileage:row[11] });
    if (type === 'water') Object.assign(base, { quantity:row[5], amount:row[6], paymentMethod:row[7], mileage:row[8] });
    if (type === 'charge') Object.assign(base, { endTime:row[5], quantity:row[6], electricFee:row[7], serviceFee:row[8], amount:row[9], paymentMethod:row[10], mileage:row[11] });
    base.remark = ''; base.mileagePhoto = '已上传 1 张'; base.voucherPhoto = '已上传 1 张'; if (type === 'charge') base.chargePhoto = '已上传 1 张';
    return base;
  }

  function init() {
    document.title = `${config.title} - 车辆管理系统`;
    document.getElementById('timeFilterLabel').textContent = config.timeLabel;
    document.getElementById('extraFilter').innerHTML = config.filterExtra ? `<label>${config.filterExtra.label}</label><input id="filterExtra" placeholder="${config.filterExtra.placeholder}" />` : '';
    document.getElementById('newRecordText').textContent = `新增${config.singular}`;
    document.getElementById('importTitle').textContent = `导入${config.singular}`;
    Common.initLayout({ basePath:'../', sidebarId:'sidebar', activeMenuId:config.activeMenuId, headerId:'header', headerOptions:{ showProject:false } });
    bind(); initPagination(); render();
  }

  function bind() {
    document.getElementById('searchBtn').addEventListener('click', search);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('addBtn').addEventListener('click', () => openForm());
    document.getElementById('importBtn').addEventListener('click', () => Common.openModal('importModal'));
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('formModal').addEventListener('modal:close', () => { editingId = null; });
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
    const records = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    renderHeader(); renderBody(records); renderSummary();
  }

  function renderHeader() {
    const html = [`<th class="col-center" style="width:48px"><input id="selectAll" type="checkbox" aria-label="全选" /></th>`]
      .concat(config.columns.map(([,label]) => `<th class="col-center">${label}</th>`))
      .concat('<th class="col-center" style="width:210px">操作</th>').join('');
    document.getElementById('tableHead').innerHTML = `<tr>${html}</tr>`;
    const pageRecords = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const selectAll = document.getElementById('selectAll');
    selectAll.checked = pageRecords.length > 0 && pageRecords.every(record => selectedIds.has(record.id));
    selectAll.addEventListener('change', event => { pageRecords.forEach(record => event.target.checked ? selectedIds.add(record.id) : selectedIds.delete(record.id)); render(); });
  }

  function renderBody(records) {
    const body = document.getElementById('tableBody');
    if (!records.length) { body.innerHTML = `<tr><td colspan="${config.columns.length + 2}" class="ledger-empty"><strong>暂无符合条件的记录</strong>请调整查询条件后重试</td></tr>`; return; }
    body.innerHTML = records.map(record => {
      const cells = config.columns.map(([key]) => `<td class="col-center ${key === 'amount' ? 'num' : ''}">${cell(record, key)}</td>`).join('');
      return `<tr class="${selectedIds.has(record.id) ? 'selected' : ''}"><td class="col-center"><input type="checkbox" ${selectedIds.has(record.id) ? 'checked' : ''} aria-label="选择${record.plate}" onchange="EnergyLedger.toggle(${record.id},this.checked)" /></td>${cells}<td class="col-center"><div class="ledger-action-cell"><button class="btn-link" type="button" onclick="EnergyLedger.detail(${record.id})">详情</button><button class="btn-link" type="button" onclick="EnergyLedger.edit(${record.id})">编辑</button><button class="btn-link" type="button" onclick="EnergyLedger.change(${record.id})">变更记录</button><button class="btn-link is-danger" type="button" onclick="EnergyLedger.remove(${record.id})">删除</button></div></td></tr>`;
    }).join('');
  }

  function cell(record, key) {
    if (key === 'amount' || key === 'unitPrice' || key === 'electricFee' || key === 'serviceFee' || key === 'cardBalance') return currency(record[key]);
    if (key === 'quantity') return `${number(record[key])}`;
    if (key === 'duration') return duration(record.time, record.endTime);
    if (key === 'mileage') return number(record[key]);
    if (key === 'evidence') return `<button class="ledger-evidence" type="button" onclick="EnergyLedger.preview(${record.id})">查看</button>`;
    return text(record[key]);
  }

  function renderSummary() {
    const sumQuantity = filteredData.reduce((total, record) => total + Number(record.quantity || 0), 0);
    const sumAmount = filteredData.reduce((total, record) => total + Number(record.amount || 0), 0);
    document.getElementById('summary').innerHTML = `<div class="ledger-summary-item"><span class="ledger-summary-label">当前筛选</span><span class="ledger-summary-value num">${filteredData.length}</span><span class="ledger-summary-label">条</span></div><div class="ledger-summary-item"><span class="ledger-summary-label">${config.unitLabel}</span><span class="ledger-summary-value num">${number(sumQuantity)}</span><span class="ledger-summary-label">${config.unit}</span></div><div class="ledger-summary-item primary"><span class="ledger-summary-label">费用合计</span><span class="ledger-summary-value num">${currency(sumAmount)}</span></div><div class="ledger-selection" ${selectedIds.size ? '' : 'style="visibility:hidden"'}>已选择 <strong class="num">${selectedIds.size}</strong> 条</div>`;
  }

  function search() {
    const start = document.getElementById('startDate').value, end = document.getElementById('endDate').value;
    const plate = document.getElementById('plateFilter').value.trim(), reporter = document.getElementById('reporterFilter').value.trim();
    const extra = config.filterExtra ? document.getElementById('filterExtra').value.trim() : '';
    filteredData = allData.filter(record => (!start || record.time.slice(0,10) >= start) && (!end || record.time.slice(0,10) <= end) && (!plate || record.plate.includes(plate)) && (!reporter || record.reporter.includes(reporter)) && (!extra || String(record[config.filterExtra.key] || '').includes(extra)));
    selectedIds.clear(); resetToFirstPage();
  }
  function reset() { document.getElementById('startDate').value = ''; document.getElementById('endDate').value = ''; document.getElementById('plateFilter').value = ''; document.getElementById('reporterFilter').value = ''; if (config.filterExtra) document.getElementById('filterExtra').value = ''; filteredData = [...allData]; selectedIds.clear(); resetToFirstPage(); }
  function resetToFirstPage() { if (pager) { pager.reset(); } else { currentPage = 1; render(); } }

  function openForm(id) {
    editingId = id || null; manuallyAdjusted = false;
    const record = id ? allData.find(item => item.id === id) : defaultRecord();
    document.getElementById('formTitle').textContent = `${id ? '编辑' : '新增'}${config.singular}`;
    document.getElementById('formBody').innerHTML = `<div class="form-grid">${config.fields.map(field => formField(field, record)).join('')}</div>${config.attachments.map(attachment => attachmentField(attachment, record)).join('')}`;
    updateFormRule(); Common.openModal('formModal');
  }
  function defaultRecord() { return { project:'嘉定研发', paymentMethod:payments[0], time:'', endTime:'', plate:'', vin:'', reporter:'', quantity:'', unitPrice:'', amount:'', electricFee:'', serviceFee:'', oilCard:'', cardBalance:'', mileage:'', remark:'' }; }
  function formField([key,label,inputType,required], record) {
    const value = record[key] ?? ''; const requiredMark = required ? '<span class="required">*</span>' : ''; const min = inputType === 'number' ? ' min="0" step="0.01"' : '';
    let control = '';
    if (inputType === 'select') { const options = key === 'project' ? projects : payments; control = `<select id="field_${key}" ${key === 'paymentMethod' && type === 'water' ? 'onchange="EnergyLedger.paymentChanged()"' : ''}>${options.map(option => `<option ${value === option ? 'selected' : ''}>${option}</option>`).join('')}</select>`; }
    else if (inputType === 'textarea') control = `<textarea id="field_${key}" rows="2" placeholder="请输入${label}">${value}</textarea>`;
    else control = `<input id="field_${key}" type="${inputType}" value="${inputType === 'datetime-local' ? localDateTime(value) : value}" placeholder="请输入${label}"${min} ${config.auto && config.auto.includes(key) ? 'oninput="EnergyLedger.autoAmount()"' : ''}${key === 'amount' && config.auto ? ' oninput="EnergyLedger.manualAmount()"' : ''}>`;
    return `<div class="form-row"><label>${requiredMark}${label}</label><div class="control">${control}<div class="field-error" id="error_${key}"></div></div></div>`;
  }
  function attachmentField([key,label,required], record) { return `<div class="form-row form-row--wide"><label>${required ? '<span class="required">*</span>' : ''}${label}</label><div class="control ledger-form-upload"><input id="field_${key}" type="file" accept="image/png,image/jpeg" multiple><div class="ledger-file-hint">${record[key] || '支持 JPG、PNG，最多 3 张，单张不超过 10MB'}</div></div></div>`; }
  function updateFormRule() { const note = document.getElementById('amountRule'); if (!note) return; if (type === 'water') { note.textContent = '月付可不填写加水金额；现金和线上支付必须填写金额。'; note.className = 'ledger-form-note'; } else { note.textContent = '费用金额已按明细自动计算，可手动调整。'; note.className = 'ledger-form-note is-linked'; } }
  function autoAmount() { if (manuallyAdjusted || !config.auto) return; const values = config.auto.map(key => Number(document.getElementById(`field_${key}`).value || 0)); const amount = type === 'fuel' ? values.reduce((total, value) => total * value, 1) : values.reduce((total, value) => total + value, 0); document.getElementById('field_amount').value = amount.toFixed(2); const note = document.getElementById('amountRule'); note.textContent = type === 'fuel' ? '费用金额已按单价 x 加油量自动计算，可手动调整。' : '费用金额已按电费 + 服务费自动计算，可手动调整。'; note.className = 'ledger-form-note is-linked'; }
  function manualAmount() { if (!config.auto) return; manuallyAdjusted = true; const note = document.getElementById('amountRule'); note.innerHTML = '金额已手动调整。<button class="btn-link" type="button" onclick="EnergyLedger.relinkAmount()">重新联动</button>'; note.className = 'ledger-form-note is-manual'; }
  function relinkAmount() { manuallyAdjusted = false; autoAmount(); }
  function paymentChanged() { const amount = document.getElementById('field_amount'); amount.required = document.getElementById('field_paymentMethod').value !== '月付'; updateFormRule(); }
  function save() {
    const values = {}; let firstInvalid = null;
    config.fields.forEach(([key,,inputType,required]) => { const element = document.getElementById(`field_${key}`); const value = element.value.trim(); const needsAmount = type === 'water' && key === 'amount' && document.getElementById('field_paymentMethod').value !== '月付'; const error = document.getElementById(`error_${key}`); error.textContent = (required || needsAmount) && !value ? '请填写此项' : ''; if ((required || needsAmount) && !value && !firstInvalid) firstInvalid = element; values[key] = inputType === 'number' && value ? Number(value) : value; });
    if (firstInvalid) { firstInvalid.focus(); Common.showToast('请完整填写必填信息', 'warning'); return; }
    if (type === 'charge' && values.endTime <= values.time) { document.getElementById('error_endTime').textContent = '结束时间必须晚于开始时间'; Common.showToast('请检查充电时间', 'warning'); return; }
    let attachmentMissing = false;
    config.attachments.forEach(([key,,required]) => { const element = document.getElementById(`field_${key}`); const existing = editingId ? (allData.find(item => item.id === editingId)[key] || '') : ''; if (element.files.length > 3) { Common.showToast('每类凭证最多上传 3 张图片', 'warning'); firstInvalid = element; } else if (required && !element.files.length && !existing) { attachmentMissing = true; firstInvalid = element; } else values[key] = element.files.length ? `已上传 ${element.files.length} 张` : existing; });
    if (firstInvalid) { if (attachmentMissing) Common.showToast('请上传必填凭证', 'warning'); return; }
    if (type === 'charge') values.duration = duration(values.time, values.endTime);
    const isEditing = Boolean(editingId);
    if (isEditing) Object.assign(allData.find(item => item.id === editingId), values); else { values.id = Math.max(0, ...allData.map(item => item.id)) + 1; allData.unshift(values); }
    filteredData = [...allData]; Common.closeModal('formModal'); resetToFirstPage(); Common.showToast(`${isEditing ? '保存' : '新增'}成功`, 'success');
  }
  function detail(id) { const record = allData.find(item => item.id === id); if (!record) return; document.getElementById('detailTitle').textContent = `${config.singular}详情`; document.getElementById('detailBody').innerHTML = `<div class="ledger-detail-grid">${config.fields.map(([key,label]) => `<div class="ledger-detail-row"><div class="ledger-detail-label">${label}</div><div class="ledger-detail-value ${['amount','quantity','unitPrice','electricFee','serviceFee','cardBalance','mileage'].includes(key) ? 'num' : ''}">${detailValue(record,key)}</div></div>`).join('')}${config.attachments.map(([key,label]) => `<div class="ledger-detail-row"><div class="ledger-detail-label">${label}</div><div class="ledger-detail-value"><button class="btn-link" type="button" onclick="EnergyLedger.preview(${id})">${record[key] || '未上传'}</button></div></div>`).join('')}</div>`; Common.openModal('detailModal'); }
  function detailValue(record,key) { if (['amount','unitPrice','electricFee','serviceFee','cardBalance'].includes(key)) return currency(record[key]); if (key === 'quantity') return `${number(record[key])} ${config.unit}`; if (key === 'mileage') return `${number(record[key])} km`; return text(record[key]); }
  function change(id) { const record = allData.find(item => item.id === id); document.getElementById('changeBody').innerHTML = `<tr><td>费用金额（元）</td><td>${currency(Number(record.amount || 0) - 6.8)}</td><td>${currency(record.amount)}</td><td>2026-09-14 10:30</td><td>费用管理员</td></tr><tr><td>${config.unitLabel}（${config.unit}）</td><td>${number(Number(record.quantity || 0) - 1.2)}</td><td>${number(record.quantity)}</td><td>2026-09-14 10:30</td><td>费用管理员</td></tr>`; Common.openModal('changeModal'); }
  function remove(id) { deletingId = id; Common.confirm({ title:'确认删除', content:`确定删除该${config.singular}吗？删除后数据不可恢复。`, danger:true, onOk: () => { allData = allData.filter(item => item.id !== deletingId); filteredData = filteredData.filter(item => item.id !== deletingId); selectedIds.delete(deletingId); render(); Common.showToast('删除成功', 'success'); } }); }
  function exportData() { if (selectedIds.size) Common.showToast(`已导出选中 ${selectedIds.size} 条记录`, 'success'); else Common.confirm({ title:'确认导出', content:`将导出当前筛选条件下的 ${filteredData.length} 条记录。`, onOk: () => Common.showToast('导出任务已创建', 'success') }); }
  function submitImport() { const file = document.getElementById('importFile'); if (!file.files.length) { Common.showToast('请选择导入文件', 'warning'); return; } Common.closeModal('importModal'); Common.showToast('导入成功，已完成数据校验', 'success'); }
  function preview(id) { const record = allData.find(item => item.id === id); document.getElementById('previewBody').innerHTML = `<div class="ledger-receipt"><div class="ledger-receipt-title">${icon[type]}费用凭证</div><div class="ledger-receipt-line"><span>车辆</span><strong>${record.plate}</strong></div><div class="ledger-receipt-line"><span>发生时间</span><strong>${record.time}</strong></div><div class="ledger-receipt-line"><span>${config.unitLabel}</span><strong>${number(record.quantity)} ${config.unit}</strong></div><div class="ledger-receipt-line"><span>支付方式</span><strong>${record.paymentMethod}</strong></div><div class="ledger-receipt-line"><span>金额</span><strong>${currency(record.amount)}</strong></div></div>`; Common.openModal('previewModal'); }
  function duration(start, end) { if (!start || !end) return '—'; const minutes = Math.round((new Date(localDateTime(end)) - new Date(localDateTime(start))) / 60000); return Number.isFinite(minutes) ? minutes : '—'; }

  window.EnergyLedger = { toggle:(id, checked) => { checked ? selectedIds.add(id) : selectedIds.delete(id); render(); }, detail, edit:openForm, change, remove, preview, autoAmount, manualAmount, relinkAmount, paymentChanged, save, submitImport };
  document.addEventListener('DOMContentLoaded', init);
}());
