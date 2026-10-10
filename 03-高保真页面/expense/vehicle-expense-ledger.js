(function () {
  'use strict';
  const categories = { fuel:'加油费用', water:'加水费用', charge:'充电费用', traffic:'流量费用' };
  const cents = value => Math.round(Number(value || 0) * 100);
  const money = value => (value / 100).toFixed(2);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let sources = [], vehicles = [], filteredSources = [], detailRecords = [], pager, detailPager, appliedStart = '', appliedEnd = '';
  const selected = new Set();
  const get = id => document.getElementById(id);

  function load() {
    sources = Object.keys(categories).filter(k => k !== 'traffic').flatMap(kind => EnergyExpenseSource.read(kind).map(r => ({
      ...r, kind, cents:cents(r.amount), date:r.time.slice(0,10), period:r.time,
      sourceId:`${kind}-${r.id}`, href:`${kind}-fee-ledger.html?record=${encodeURIComponent(r.id)}`
    })));
    sources.push(...TrafficExpenseSource.read().map(r => ({
      ...r, kind:'traffic', cents:cents(r.fee), date:r.month+'-01', period:r.month,
      sourceId:`traffic-${r.vin}-${r.month}`, href:`traffic-fee-ledger.html?vin=${encodeURIComponent(r.vin)}&month=${encodeURIComponent(r.month)}`
    })));
    const projects = [...new Set(sources.map(r => r.project).filter(Boolean))].sort();
    const project = get('projectFilter'), current = project.value;
    project.innerHTML = '<option value="">全部项目</option>' + projects.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('');
    project.value = projects.includes(current) ? current : '';
  }

  function applyFilters() {
    const start=get('startDate').value, end=get('endDate').value;
    const plate=get('plateFilter').value.trim().toLowerCase(), vin=get('vinFilter').value.trim().toLowerCase(), project=get('projectFilter').value;
    if (start && end && start > end) { Common.showToast('开始日期不能晚于结束日期','warning'); return; }
    appliedStart=start; appliedEnd=end;
    filteredSources=sources.filter(r => (r.kind==='traffic'
      ? (!start || r.month>=start.slice(0,7)) && (!end || r.month<=end.slice(0,7))
      : (!start || r.date>=start) && (!end || r.date<=end))
      && (!project || r.project === project)
      && (!plate || (r.plate || '').toLowerCase().includes(plate))
      && (!vin || (r.vin || '').toLowerCase().includes(vin)));
    const grouped=new Map();
    filteredSources.forEach(r => {
      const key=r.vin || `unbound-${r.sourceId}`;
      if (!grouped.has(key)) grouped.set(key,{key,vin:r.vin || '—',plate:r.plate || '未绑定车辆',project:r.project || '未归属',fuel:0,water:0,charge:0,traffic:0,total:0,records:[]});
      const v=grouped.get(key); v[r.kind]+=r.cents; v.total+=r.cents; v.records.push(r);
    });
    vehicles=[...grouped.values()].sort((a,b)=>a.vin.localeCompare(b.vin));
    const visibleKeys = new Set(vehicles.map(v=>v.key));
    [...selected].forEach(k => { if (!visibleKeys.has(k)) selected.delete(k); });
    pager.setTotal(vehicles.length); pager.setPage(1); render();
  }

  function renderHead() {
    get('tableHead').innerHTML = '<tr><th><input id="checkAll" class="ledger-check" type="checkbox" aria-label="全选当前页"></th><th>车牌号</th><th>VIN码</th><th>归属项目</th><th>加油费用</th><th>加水费用</th><th>充电费用</th><th>流量费用</th><th>费用合计（元）</th><th>操作</th></tr>';
    get('checkAll').addEventListener('change', e => {
      const start=(pager.getCurrentPage()-1)*pager.getPageSize();
      vehicles.slice(start,start+pager.getPageSize()).forEach(v => e.target.checked ? selected.add(v.key) : selected.delete(v.key));
      render();
    });
  }

  function render() {
    renderHead();
    const start=(pager.getCurrentPage()-1)*pager.getPageSize();
    const page=vehicles.slice(start,start+pager.getPageSize());
    get('tableBody').innerHTML = page.map(v => `<tr><td><input class="ledger-check row-check" type="checkbox" data-key="${esc(v.key)}" ${selected.has(v.key)?'checked':''} aria-label="选择${esc(v.plate)}"></td><td>${esc(v.plate)}</td><td>${esc(v.vin)}</td><td>${esc(v.project)}</td>${Object.keys(categories).map(kind=>`<td class="num">${v.records.some(r=>r.kind===kind)?`<button class="source-link" data-key="${esc(v.key)}" data-kind="${kind}">${money(v[kind])}</button>`:'0.00'}</td>`).join('')}<td class="num amount">${money(v.total)}</td><td><button class="source-link" data-key="${esc(v.key)}" data-kind="">费用明细</button></td></tr>`).join('') || '<tr><td colspan="10" class="ledger-empty"><strong>暂无符合条件的台账</strong>请调整查询条件后重试</td></tr>';
    get('tableBody').querySelectorAll('.row-check').forEach(c=>c.addEventListener('change', e => { e.target.checked ? selected.add(e.target.dataset.key) : selected.delete(e.target.dataset.key); syncCheckAll(); }));
    get('tableBody').querySelectorAll('[data-key]').forEach(btn=>btn.addEventListener('click',()=>openDetails(btn.dataset.key,btn.dataset.kind)));
    syncCheckAll(); renderSummary();
  }

  function syncCheckAll() {
    const checks=[...get('tableBody').querySelectorAll('.row-check')], count=checks.filter(c=>c.checked).length, all=checks.length>0 && count===checks.length;
    const box=get('checkAll'); if (!box) return; box.checked=all; box.indeterminate=count>0 && !all;
  }
  function renderSummary() {
    const total=vehicles.reduce((sum,v)=>sum+v.total,0);
    get('summary').innerHTML=`<div class="ledger-summary-item"><span class="ledger-summary-label">车辆</span><span class="ledger-summary-value num">${vehicles.length}</span><span class="ledger-summary-label">辆</span></div><div class="ledger-summary-item primary"><span class="ledger-summary-label">费用合计</span><span class="ledger-summary-value num">¥${money(total)}</span></div>`;
  }

  function openDetails(key,kind) {
    const v=vehicles.find(r=>r.key===key); if (!v) return;
    detailRecords=v.records.filter(r=>!kind || r.kind===kind).sort((a,b)=>b.period.localeCompare(a.period));
    get('detailTitle').textContent=`${v.plate} · ${categories[kind] || '费用'}明细`;
    detailPager.setTotal(detailRecords.length); detailPager.setPage(1); renderDetails(); Common.openModal('detailModal');
  }
  function renderDetails() {
    const start=(detailPager.getCurrentPage()-1)*detailPager.getPageSize();
    get('detailBody').innerHTML=detailRecords.slice(start,start+detailPager.getPageSize()).map(r=>`<tr><td class="col-center">${esc(r.period)}</td><td>${categories[r.kind]}</td><td class="col-right num">${money(r.cents)}</td><td class="col-center"><a class="source-link" href="${esc(r.href)}">查看详情</a></td></tr>`).join('');
  }
  function exportData() {
    if (!vehicles.length) { Common.showToast('暂无可导出的台账数据','warning'); return; }
    if (!selected.size) {
      Common.confirm({ title:'确认导出', content:`当前未选择车辆，将导出当前查询条件下的全部 ${vehicles.length} 条记录，是否继续？`, okText:'确认导出', onOk:()=>doExport(vehicles) });
      return;
    }
    doExport(vehicles.filter(v=>selected.has(v.key)));
  }
  function doExport(chosen) {
    const cell=v=>'"'+String(v).replaceAll('"','""')+'"';
    const header=['车牌号','VIN码','归属项目',...Object.values(categories),'费用合计','开始日期','结束日期'];
    const lines=[header,...chosen.map(v=>[v.plate,v.vin,v.project,...Object.keys(categories).map(k=>money(v[k])),money(v.total),appliedStart,appliedEnd])];
    const url=URL.createObjectURL(new Blob(['\ufeff'+lines.map(line=>line.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a'); link.href=url; link.download='单车费用台账.csv'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    Common.showToast(`已导出 ${chosen.length} 辆车的台账`,'success');
  }

  document.addEventListener('DOMContentLoaded',()=>{
    Common.initLayout({basePath:'../',sidebarId:'sidebar',activeMenuId:'vehicle-expense-ledger',headerId:'header',headerOptions:{showProject:false}});
    load();
    pager=new Pagination({container:'paginationEl',pageSize:10,pageSizeOptions:[10,20,50],onPageChange:render});
    detailPager=new Pagination({container:'detailPagination',pageSize:10,pageSizeOptions:[10,20,50],onPageChange:renderDetails});
    applyFilters();
    get('searchBtn').addEventListener('click',applyFilters);
    get('resetBtn').addEventListener('click',()=>{['startDate','endDate','plateFilter'].forEach(id=>get(id).value='');get('vinFilter').value='';get('projectFilter').value='';selected.clear();applyFilters();});
    get('exportBtn').addEventListener('click',exportData);
    get('plateFilter').addEventListener('keydown',e=>{if(e.key==='Enter')applyFilters();});
    get('vinFilter').addEventListener('keydown',e=>{if(e.key==='Enter')applyFilters();});
    window.addEventListener('pageshow',e=>{if(e.persisted){load();applyFilters();}});
    window.addEventListener('storage',e=>{if(e.key && e.key.startsWith('vehicle-expense-')){load();applyFilters();}});
  });
}());
