/* 日常维护页面交互：列表筛选、计划草稿编辑、周期查看、任务只读追溯。 */
(function(){
  'use strict';
  const page=document.body.dataset.page;
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const store=window.MaintenanceStore;
  const cycle=id=>store.cycles.find(x=>x.id===id)||{id,name:'—',type:'—'};
  const tag=(value,kind)=>`<span class="tag tag-${kind||'default'}">${esc(value)}</span>`;
  const statusTag=value=>tag(value,{待开始:'blue',进行中:'purple',已完成:'green',逾期:'red',逾期完成:'orange',已失效:'default'}[value]||'default');
  const initLayout=active=>Common.initLayout({basePath:'../',sidebarId:'sidebar',activeMenuId:active,headerId:'header',headerOptions:{showProject:true}});
  function setOptions(id,items,all='全部'){const el=document.getElementById(id);if(!el)return;el.innerHTML=(all?`<option value="">${all}</option>`:'')+items.map(x=>`<option value="${esc(typeof x==='string'?x:x.id)}">${esc(typeof x==='string'?x:x.name)}</option>`).join('');}
  function projectMatch(p,q){return !q||(p.scope==='all'?true:p.projects.includes(q));}
  function planFilters(){
    setOptions('q-model',store.models);setOptions('q-project',store.projects);setOptions('q-cycle',store.cycles);
    let pageNo=1,pageSize=10,pager;
    const render=()=>{
      document.getElementById('loadError').textContent='';
      const name=document.getElementById('q-name').value.trim().toLowerCase(),model=document.getElementById('q-model').value,project=document.getElementById('q-project').value,cycleId=document.getElementById('q-cycle').value,status=document.getElementById('q-status').value;
      const all=store.all().filter(p=>(!name||p.name.toLowerCase().includes(name))&&(!model||p.model===model)&&projectMatch(p,project)&&(!cycleId||p.items.some(i=>i.cycle===cycleId))&&(!status||p.status===status));
      pageNo=Math.max(1,Math.min(pageNo,Math.ceil(all.length/pageSize)||1));
      const slice=all.slice((pageNo-1)*pageSize,pageNo*pageSize),body=document.getElementById('planBody');
      body.innerHTML=slice.length?slice.map(p=>{
        const cs=[...new Set(p.items.map(i=>cycle(i.cycle).name))];
        return '<tr data-plan="'+esc(p.id)+'"><td class="description-cell" title="'+esc(p.name)+'">'+esc(p.name)+'</td><td>'+esc(p.model||'待完善')+'</td><td>'+(cs.map(x=>tag(x,'blue')).join(' ')||'—')+'</td><td>'+tag(MaintenanceLifecycle.label(p),p.status==='enabled'?'green':p.status==='draft'?'orange':'default')+'</td><td class="num">'+esc(p.createdAt||'—')+'</td><td>'+esc(p.createdBy||'—')+'</td><td class="num">'+esc(p.updatedAt||'—')+'</td><td>'+esc(p.updatedBy||'—')+'</td><td class="num">'+esc(p.status==='enabled'?p.effectiveAt||'—':'—')+(p.status==='enabled'&&p.effectiveAt>store.now()?'<div class="muted">待生效</div>':'')+'</td><td><span class="row-links"><a class="text-button" href="maintenance-plan-detail.html?id='+encodeURIComponent(p.id)+'">详情</a><a class="text-button" href="maintenance-plan-edit.html?id='+encodeURIComponent(p.id)+'">'+(p.status==='draft'?'继续完善':'编辑')+'</a>'+(p.status==='draft'?'':'<button class="text-button" type="button" data-toggle="'+esc(p.id)+'">'+(p.status==='enabled'?'停用':'启用')+'</button>')+'<button class="text-button danger" type="button" data-delete="'+esc(p.id)+'">删除</button></span></td></tr>';
      }).join(''):'<tr><td colspan="10"><div class="empty-state"><h3>暂无维护计划</h3><div>没有匹配的数据，请调整查询条件或新增计划。</div></div></td></tr>';
      body.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const p=store.get(b.dataset.toggle);MaintenanceLifecycle[p.status==='enabled'?'disable':'enable'](p.id,render);});
      body.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{const p=store.get(b.dataset.delete);Common.confirm({title:'删除维护计划',content:'确认删除“'+esc(p?.name)+'”吗？已生成的历史任务会保留任务快照。',danger:true,onOk:()=>{try{store.remove(b.dataset.delete);Common.showToast('维护计划已删除','success');render();}catch(err){document.getElementById('loadError').textContent='删除失败：'+err.message;}}});});
      if(!pager)pager=new Pagination({container:'pager',pageSize,pageSizeOptions:[10,20,50],onPageChange:(p,s)=>{pageNo=p;pageSize=s;render();}});
      pager.setTotal(all.length);pager.setPage(pageNo);
    };
    document.getElementById('queryForm').onsubmit=e=>{e.preventDefault();pageNo=1;render();};
    document.getElementById('resetQuery').onclick=()=>{document.getElementById('queryForm').reset();pageNo=1;render();};
    render();
  }
  function taskFilters(){
    setOptions('q-project',store.projects);setOptions('q-cycle',store.cycles);
    let pageNo=1,pageSize=10,pager,currentRows=[],exportRows=[];
    const selectedIds=new Set(),checkAll=document.getElementById('checkAll');
    const updateSelectionState=()=>{
      const boxes=[...document.querySelectorAll('#taskBody .row-check')],checked=boxes.filter(b=>b.checked).length;
      checkAll.checked=boxes.length>0&&checked===boxes.length;
      checkAll.indeterminate=checked>0&&checked<boxes.length;
      document.getElementById('selectedCount').textContent=selectedIds.size;
      document.getElementById('selectionSummary').classList.toggle('visible',selectedIds.size>0);
    };
    const render=()=>{
      const taskNo=(document.getElementById('q-task')?.value||'').trim().toLowerCase(),vehicle=(document.getElementById('q-vehicle')?.value||'').trim().toLowerCase(),planName=(document.getElementById('q-plan')?.value||'').trim().toLowerCase(),project=document.getElementById('q-project')?.value||'',cycleId=document.getElementById('q-cycle')?.value||'',status=document.getElementById('q-status')?.value||'',generatedStart=document.getElementById('q-generated-start')?.value||'',generatedEnd=document.getElementById('q-generated-end')?.value||'';
      if(generatedStart&&generatedEnd&&generatedStart>generatedEnd){Common.showToast('生成开始日期不能晚于结束日期','warning');return;}
      const all=store.tasks().filter(t=>(!taskNo||t.id.toLowerCase().includes(taskNo))&&(!vehicle||[t.plate,t.vin].some(x=>x.toLowerCase().includes(vehicle)))&&(!planName||(t.planName||'').toLowerCase().includes(planName))&&(!project||t.project===project)&&(!cycleId||t.cycle===cycleId)&&(!status||t.status===status)&&(!generatedStart||t.generated.slice(0,10)>=generatedStart)&&(!generatedEnd||t.generated.slice(0,10)<=generatedEnd));
      currentRows=all;
      const body=document.getElementById('taskBody'),slice=all.slice((pageNo-1)*pageSize,pageNo*pageSize);
      body.innerHTML=slice.length?slice.map(t=>`<tr class="${selectedIds.has(t.id)?'selected':''}"><td><input class="row-check" type="checkbox" data-id="${esc(t.id)}" aria-label="选择任务${esc(t.id)}" ${selectedIds.has(t.id)?'checked':''}></td><td class="num">${esc(t.id)}</td><td class="num">${esc(t.iotCode||'—')}</td><td>${esc(t.project)}</td><td class="description-cell">${esc(t.planName)}</td><td class="nowrap">${tag(cycle(t.cycle).name,'blue')} ${esc(cycle(t.cycle).type)}</td><td class="num">${esc(t.generated)}</td><td>${statusTag(t.status)}</td><td class="num">${esc(t.completed||'—')}</td><td>${esc(t.completedBy||'—')}</td><td><a class="text-button" href="maintenance-task-detail.html?id=${encodeURIComponent(t.id)}">详情</a></td></tr>`).join(''):`<tr><td colspan="11"><div class="empty-state"><h3>暂无维护任务</h3><div>没有匹配的任务，请调整查询条件。</div></div></td></tr>`;
      body.querySelectorAll('.row-check').forEach(c=>c.onchange=()=>{c.checked?selectedIds.add(c.dataset.id):selectedIds.delete(c.dataset.id);c.closest('tr').classList.toggle('selected',c.checked);updateSelectionState();});
      if(!pager)pager=new Pagination({container:'pager',pageSize,pageSizeOptions:[10,20,50],onPageChange:(p,s)=>{pageNo=p;pageSize=s;render()}});
      pager.setTotal(all.length);pager.setPage?.(pageNo);updateSelectionState();
    };
    checkAll.onchange=()=>{document.querySelectorAll('#taskBody .row-check').forEach(c=>{c.checked=checkAll.checked;checkAll.checked?selectedIds.add(c.dataset.id):selectedIds.delete(c.dataset.id);c.closest('tr').classList.toggle('selected',checkAll.checked)});updateSelectionState();};
    document.getElementById('queryForm').onsubmit=e=>{e.preventDefault();selectedIds.clear();pageNo=1;render()};
    document.getElementById('resetQuery').onclick=()=>{document.getElementById('queryForm').reset();selectedIds.clear();pageNo=1;render()};
    document.getElementById('clearSelectionButton').onclick=()=>{selectedIds.clear();render()};
    document.getElementById('exportButton').onclick=()=>{ListExport.run({rows:currentRows,selectedIds,currentPage:pageNo,pageSize,onExport:(rows,scope)=>{exportRows=rows;document.getElementById('exportDescription').textContent=(scope.selected?'将导出当前页已选 ':'将导出当前查询条件下全部 ')+rows.length+' 条维护任务为 CSV 文件。';document.getElementById('exportFileName').value='维护任务-'+new Date().toLocaleDateString('sv-SE')+'.csv';Common.openModal('exportModal');}})};
    document.getElementById('confirmExportButton').onclick=()=>{let name=document.getElementById('exportFileName').value.trim().replace(/[\\/:*?"<>|]/g,'_');if(!name){Common.showToast('请输入文件名','warning');return}if(!/\.csv$/i.test(name))name+='.csv';exportCSV({filename:name,headers:['任务编号','网联编号','归属项目','维护计划','检查周期','维保类型','生成时间','任务状态','实际完成时间','完成人'],rows:exportRows.map(t=>{const c=cycle(t.cycle);return [t.id,t.iotCode||'',t.project,t.planName,c.name,c.type,t.generated,t.status,t.completed||'',t.completedBy||'']})});Common.closeModal('exportModal');Common.showToast('已导出 '+exportRows.length+' 条维护任务','success')};
    document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>Common.closeModal(b.dataset.close));
    render();
  }
  function tableForTask(t){if(!t.items.length)return '<div class="empty-state">暂无检查项</div>';return `<div class="table-wrapper maintenance-table"><table><colgroup><col style="width:150px"><col style="width:150px"><col style="width:190px"><col style="width:430px"><col style="width:120px"><col style="width:140px"><col style="width:260px"></colgroup><thead><tr><th>所属系统</th><th>检查部件</th><th>检查项目</th><th>判定标准（任务快照）</th><th>检查周期</th><th>检查结果</th><th>结果说明</th></tr></thead><tbody>${t.items.map(x=>`<tr><td>${esc(x.system)}</td><td>${esc(x.part)}</td><td>${esc(x.name)}</td><td class="description-cell">${esc(x.standard)}</td><td>${tag(cycle(x.cycle).name,'blue')}</td><td>${x.result==='正常'?tag('正常','green'):x.result==='异常'?tag('异常','red'):tag('待检查','default')}</td><td class="description-cell">${esc(x.resultNote||'—')}</td></tr>`).join('')}</tbody></table></div>`; }
  function taskDetail(){
    initLayout('maintenance-task');
    const t=store.task(new URLSearchParams(location.search).get('id'));
    if(!t){document.getElementById('pageContent').innerHTML='<div class="empty-state"><h3>未找到维护任务</h3><a class="btn" href="maintenance-task-list.html">返回台账</a></div>';return;}
    document.getElementById('taskTitle').textContent='维护任务 '+t.id;
    document.getElementById('taskStatus').innerHTML=statusTag(t.status);
    const info=[['任务编号',t.id],['车辆',t.plate+' · '+t.vin],['归属项目',t.project],['车型',t.model],['维护计划',t.planName],['检查周期',cycle(t.cycle).name+' · '+cycle(t.cycle).type],['生成时间',t.generated]];
    const cells=arr=>arr.map(x=>'<div class="info-cell"><dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd></div>').join('');
    document.getElementById('taskInfo').innerHTML=cells(info);
    document.getElementById('executionInfo').innerHTML=cells([['执行要求',t.requirement],['执行窗口',t.window],['完成人',t.completedBy||'—'],['实际完成时间',t.completed||'—'],['接收角色','项目经理、安全员']]);
    const notes={'待开始':'任务已生成，请由项目经理或安全员在城市管家开始执行。','进行中':'任务执行中，请在执行窗口内完成全部检查项。','已完成':'任务已完成，PC提供结果追溯。','逾期':'非日例保已逾期，在下一同周期新任务生成前支持在城市管家继续执行。','逾期完成':'任务已逾期完成，PC提供结果追溯。','已失效':'日例保逾期未完成，任务已失效，不支持再次执行。'};
    document.getElementById('taskNote').textContent=notes[t.status]||'';
    const done=t.items.filter(x=>x.result!=='待检查').length,abnormal=t.items.filter(x=>x.result==='异常').length;
    document.getElementById('resultSummary').textContent=done+'/'+t.items.length+' 项已检查'+(abnormal?'，'+abnormal+' 项异常':'');
    document.getElementById('itemsTable').innerHTML=tableForTask(t);
    const vehicleLink=document.createElement('a');vehicleLink.className='btn';vehicleLink.textContent='车辆档案';vehicleLink.href='../vehicle-asset/vehicle-asset-detail.html?id='+encodeURIComponent(t.assetId);document.getElementById('sourcePlan').before(vehicleLink);
    if(store.get(t.planId))document.getElementById('sourcePlan').href='maintenance-plan-detail.html?id='+encodeURIComponent(t.planId);
    else {const link=document.getElementById('sourcePlan');link.removeAttribute('href');link.classList.add('disabled');link.setAttribute('aria-disabled','true');link.textContent='原计划已删除';}
  }
  try{if(page==='plan-list'){initLayout('maintenance-plan');planFilters()}else if(page==='plan-detail')MaintenancePlan.detail();else if(page==='plan-edit')MaintenancePlan.edit();else if(page==='task-list'){initLayout('maintenance-task');taskFilters()}else if(page==='task-detail')taskDetail()}catch(e){const target=document.getElementById('loadError')||document.getElementById('planErrors');if(target)target.textContent='页面数据加载失败：'+e.message;else{const alert=document.createElement('div');alert.className='form-errors';alert.setAttribute('role','alert');alert.textContent='页面数据加载失败：'+e.message;document.getElementById('pageContent')?.replaceChildren(alert);}console.error(e)}
})();
