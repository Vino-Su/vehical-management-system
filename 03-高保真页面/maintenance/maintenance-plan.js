/* 计划详情与编辑：统一分区顺序、检查项查询/分组与完整展示、草稿统一保存。 */
(function (global) {
  'use strict';
  const store = global.MaintenanceStore;
  const byId = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const missing = x => !x.name.trim() || !x.standard.trim();
  const cycleName = id => store.cycles.find(c => c.id === id)?.name || '—';
  const option = (values, empty) => (empty ? `<option value="">${empty}</option>` : '') + values.map(x => `<option value="${esc(x.id || x)}">${esc(x.name || x)}</option>`).join('');

  function tabs() {
    const buttons = [...document.querySelectorAll('.plan-tabs [role="tab"]')];
    const activate = id => {
      buttons.forEach(button => {
        const active = button.id === id;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        byId(button.getAttribute('aria-controls')).hidden = !active;
      });
    };
    buttons.forEach(button => {
      button.onclick = () => activate(button.id);
      button.onkeydown = event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === 'Home' ? buttons[0] : event.key === 'End' ? buttons[1] : buttons.find(x => x !== button);
        activate(target.id); target.focus();
      };
    });
    return activate;
  }

  function summary(plan) {
    byId('itemTotal').textContent = plan.items.length;
    byId('planSummary').innerHTML=`<span>适用车型：<strong>${esc(plan.model || '待选择')}</strong></span><span>检查项：<strong class="num">${plan.items.length}</strong> 项</span>`;
  }

  function sourceDialog(x) {
    let overlay = byId('sourceModal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sourceModal'; overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal-box source-modal" role="dialog" aria-modal="true" aria-labelledby="sourceTitle"><div class="modal-header"><h3 id="sourceTitle">清单资料</h3><button class="modal-close" type="button" aria-label="关闭资料">×</button></div><div class="modal-body"><dl id="sourceInfo" class="rule-list"></dl></div><div class="modal-footer"><button class="btn" type="button">关闭</button></div></div>';
      overlay.querySelectorAll('button').forEach(b => b.onclick = () => Common.closeModal('sourceModal'));
      document.body.append(overlay);
    }
    const fields = [['清单序号', x.sourceNo], ['所属系统', x.system], ['部件名称', x.part], ['件号', x.partNumber], ['版本', x.partVersion], ['原表检查周期', x.sourceCycle], ['不符合标准处置措施', x.disposition], ['新增配套工具', x.tools], ['检查方法', x.method], ['备注', x.sourceNotes]];
    byId('sourceInfo').innerHTML = fields.map(([name, value]) => `<div><dt>${name}</dt><dd>${esc(value || '—')}${name === '检查方法' && x.methodUrl?.startsWith('https://') ? ` <a href="${esc(x.methodUrl)}" target="_blank" rel="noopener noreferrer">查看文档 ↗</a>` : ''}</dd></div>`).join('');
    Common.openModal('sourceModal');
  }

  function itemList(plan, editable, onEdit) {
    let active = 'all', system = '', keyword = '', pendingOnly = false;
    const selected = new Set(), collapsed = new Set();
    let visible = [], pageItems = [];
    byId('itemTools').innerHTML = `<div class="item-toolbar"><div class="cycle-tools"><div id="cycleTabs" class="cycle-tabs" aria-label="按周期查看"></div><div class="inline-actions"><button class="text-button" type="button" id="toggleGroups">折叠全部分组</button>${editable ? '<button class="btn btn-primary" type="button" id="addItem">＋ 新增检查项</button>' : ''}</div></div><div class="item-filters"><label for="itemSystem">所属系统</label><select id="itemSystem" class="cycle-select">${option(store.systems, '全部系统')}</select><label for="itemKeyword">关键词</label><input id="itemKeyword" type="search" placeholder="搜索部件、检查项目或件号"><button class="btn btn-primary" type="button" id="searchItems">查询</button><button class="btn" type="button" id="resetItems">重置</button><label class="pending-filter"><input type="checkbox" id="pendingOnly">仅看待补充 <span id="pendingTotal"></span></label></div>${editable ? `<div class="item-batch"><span id="selectedCount" aria-live="polite">已选 0 项</span><label for="batchCycle">批量配置周期</label><select id="batchCycle" class="cycle-select">${option(store.cycles, '选择周期')}</select><button class="btn" type="button" id="applyCycle">应用周期</button><button class="text-button" type="button" id="clearItems">清空选择</button><span class="muted">全选当前筛选下已展开项目；筛选变化清空选择</span></div>` : ''}</div>`;

    function selectionState() {
      if (!editable) return;
      byId('selectedCount').textContent = `已选 ${selected.size} 项`;
      const shown = pageItems.filter(x => !collapsed.has(x.system));
      const count = shown.filter(x => selected.has(x.id)).length;
      const all = byId('checkAllItems');
      if (all) { all.checked = shown.length > 0 && count === shown.length; all.indeterminate = count > 0 && count < shown.length; all.disabled = !shown.length; }
      byId('applyCycle').disabled = !selected.size;
      byId('clearItems').disabled = !selected.size;
    }

    function render() {
      const oldScroll = {top:byId('itemsTable').scrollTop,left:byId('itemsTable').scrollLeft};
      summary(plan);
      byId('cycleTabs').innerHTML = [{id:'all',name:'全部'}, ...store.cycles].map(c => `<button type="button" class="cycle-tab ${active === c.id ? 'active' : ''}" data-cycle="${c.id}" aria-pressed="${active === c.id}">${c.name} <small>${c.id === 'all' ? plan.items.length : plan.items.filter(x => x.cycle === c.id).length}</small></button>`).join('');
      byId('pendingTotal').textContent = plan.items.filter(missing).length;
      visible = plan.items.filter(x => (active === 'all' || x.cycle === active) && (!system || x.system === system) && (!pendingOnly || missing(x)) && (!keyword || [x.part, x.name, x.partNumber].some(v => (v || '').toLowerCase().includes(keyword))));
      const groups = [...new Set(visible.map(x => x.system))];
      visible = groups.flatMap(s => visible.filter(x => x.system === s));
      pageItems = visible;
      const columns = editable ? 8 : 7;
      const cell = (value, label) => value ? esc(value) : `<span class="missing-value">待补充${label}</span>`;
      const body = [...new Set(pageItems.map(x => x.system))].map(s => `<tr class="system-heading"><td colspan="${columns}"><button type="button" class="group-toggle" data-group="${esc(s)}" aria-expanded="${!collapsed.has(s)}"><span aria-hidden="true">${collapsed.has(s) ? '▸' : '▾'}</span> ${esc(s)} <span class="muted">筛选结果 ${visible.filter(x => x.system === s).length} 项</span></button></td></tr>` + (collapsed.has(s) ? '' : pageItems.filter(x => x.system === s).map(x => `<tr data-item-row="${esc(x.id)}" class="${missing(x) ? 'item-incomplete' : ''}">${editable ? `<td class="item-check-cell"><input type="checkbox" class="item-check" data-item="${esc(x.id)}" aria-label="选择清单第${x.sourceNo || plan.items.indexOf(x) + 1}项" ${selected.has(x.id) ? 'checked' : ''}></td>` : ''}<td class="num">${x.sourceNo || plan.items.indexOf(x) + 1}</td><td>${esc(x.system)}</td><td class="description-cell">${esc(x.part)}${x.partNumber ? `<div class="muted num">${esc(x.partNumber)} · ${esc(x.partVersion)}</div>` : ''}</td><td class="description-cell">${cell(x.name, '项目')}</td><td class="description-cell standard-cell">${cell(x.standard, '标准')}</td><td><span class="tag tag-blue">${cycleName(x.cycle)}</span></td><td class="item-actions"><span class="row-links">${editable ? `<button type="button" class="text-button" data-edit-item="${esc(x.id)}">编辑</button><button type="button" class="text-button danger" data-remove-item="${esc(x.id)}">删除</button>` : ''}${x.sourceNo ? `<button type="button" class="text-button" data-source="${esc(x.id)}">资料</button>` : editable ? '' : '—'}</span></td></tr>`).join(''))).join('');
      byId('itemsTable').innerHTML = visible.length ? `<div class="maintenance-table plan-items-table"><table><colgroup>${editable ? '<col style="width:44px">' : ''}<col style="width:56px"><col style="width:130px"><col style="width:250px"><col style="width:220px"><col style="width:310px"><col style="width:90px"><col style="width:${editable ? 150 : 76}px"></colgroup><thead><tr>${editable ? '<th class="item-check-cell"><input type="checkbox" id="checkAllItems" aria-label="全选当前筛选下已展开检查项"></th>' : ''}<th>序号</th><th>所属系统</th><th>检查部件 / 件号</th><th class="description-cell">检查项目</th><th class="description-cell">判定标准</th><th>检查周期</th><th class="item-actions">操作</th></tr></thead><tbody>${body}</tbody></table></div>` : '<div class="empty-state"><h3>暂无匹配的检查项</h3><div>请调整周期、系统或关键词，或重置筛选条件。</div></div>';
      byId('itemRange').textContent = `筛选结果 ${visible.length} / 全部 ${plan.items.length} 项`;
      byId('itemsError').textContent = editable && !plan.items.length ? '请至少添加一个检查项' : '';
      const pageGroups = [...new Set(pageItems.map(x => x.system))];
      byId('toggleGroups').textContent = (pageGroups.length && pageGroups.every(s => collapsed.has(s)) ? '展开' : '折叠') + '全部分组';
      byId('itemsTable').scrollTop=oldScroll.top;byId('itemsTable').scrollLeft=oldScroll.left;
      selectionState();
    }

    function resetView() { selected.clear();collapsed.clear();render();byId('itemsTable').scrollTop=0; }
    byId('cycleTabs').onclick = event => {const button=event.target.closest('[data-cycle]');if(button){active=button.dataset.cycle;resetView();}};
    byId('searchItems').onclick = () => {system=byId('itemSystem').value;keyword=byId('itemKeyword').value.trim().toLowerCase();resetView();};
    byId('itemKeyword').onkeydown = event => {if(event.key==='Enter'){event.preventDefault();byId('searchItems').click();}};
    byId('itemSystem').onchange = () => byId('searchItems').click();
    byId('pendingOnly').onchange = event => {pendingOnly=event.target.checked;resetView();};
    byId('resetItems').onclick = () => {active='all';system='';keyword='';pendingOnly=false;byId('itemSystem').value='';byId('itemKeyword').value='';byId('pendingOnly').checked=false;resetView();};
    byId('toggleGroups').onclick = () => {const groups=[...new Set(pageItems.map(x=>x.system))],expand=groups.every(s=>collapsed.has(s));groups.forEach(s=>expand?collapsed.delete(s):collapsed.add(s));render();};
    byId('itemsTable').onclick = event => {
      const b=event.target.closest('button');if(!b)return;
      if(b.dataset.group){collapsed.has(b.dataset.group)?collapsed.delete(b.dataset.group):collapsed.add(b.dataset.group);render();}
      if(b.dataset.editItem)onEdit(b.dataset.editItem);
      if(b.dataset.source)sourceDialog(plan.items.find(x=>x.id===b.dataset.source));
      if(b.dataset.removeItem)Common.confirm({title:'删除检查项',content:'删除后需重新保存计划，确认删除吗？',danger:true,onOk:()=>{plan.items=plan.items.filter(x=>x.id!==b.dataset.removeItem);selected.delete(b.dataset.removeItem);render();}});
    };
    byId('itemsTable').onchange = event => {
      if(event.target.id==='checkAllItems'){pageItems.filter(x=>!collapsed.has(x.system)).forEach(x=>event.target.checked?selected.add(x.id):selected.delete(x.id));byId('itemsTable').querySelectorAll('.item-check').forEach(c=>c.checked=selected.has(c.dataset.item));}
      else if(event.target.classList.contains('item-check'))event.target.checked?selected.add(event.target.dataset.item):selected.delete(event.target.dataset.item);
      selectionState();
    };
    if(editable){
      byId('clearItems').onclick=()=>{selected.clear();render();};
      byId('applyCycle').onclick=()=>{
        const target=byId('batchCycle').value;
        if(!target){Common.showToast('请选择目标周期','warning');return;}
        plan.items.forEach(x=>{if(selected.has(x.id))x.cycle=target;});
        selected.clear();render();Common.showToast('检查周期已更新，保存计划后生效','success');
      };
    }
    render();
    return {render, locate(id){const x=plan.items.find(x=>x.id===id);if(!x)return;active='all';system=x.system;keyword='';pendingOnly=false;byId('itemSystem').value=system;byId('itemKeyword').value='';byId('pendingOnly').checked=false;resetView();const row=byId('itemsTable').querySelector(`[data-item-row="${CSS.escape(id)}"]`);row?.scrollIntoView({block:'center'});row?.classList.add('located-item');}};
  }

  function init() {
    Common.initLayout({basePath:'../',sidebarId:'sidebar',activeMenuId:'maintenance-plan',headerId:'header',headerOptions:{showProject:true}});
    const id=new URLSearchParams(location.search).get('id'), plan=store.get(id);
    if(id&&!plan){byId('pageContent').innerHTML='<div class="empty-state"><h3>未找到维护计划</h3><a class="btn" href="maintenance-plan-list.html">返回列表</a></div>';return null;}
    return {id,plan};
  }

  function detail() {
    const context=init();if(!context)return;
    const p=context.plan;if(!p){byId('pageContent').innerHTML='<div class="empty-state"><h3>未找到维护计划</h3><a class="btn" href="maintenance-plan-list.html">返回列表</a></div>';return;}
    byId('planName').textContent=p.name;byId('editPlan').href='maintenance-plan-edit.html?id='+encodeURIComponent(p.id);
    const cells=values=>values.map(([label,value,span='',numeric=false])=>`<div class="plan-description-item ${span}"><dt>${esc(label)}</dt><dd${numeric?' class="num"':''}>${esc(value||'—')}</dd></div>`).join('');
    byId('planInfo').innerHTML=cells([['计划名称',p.name,'wide'],['计划状态',MaintenanceLifecycle.label(p)],['适用车型',p.model],['适用项目',p.scope==='all'?'全部项目':p.projects.join('、'),'wide'],['检查项数',p.items.length+' 项','',true],['生效时间',p.status==='enabled'?p.effectiveAt:'—','',true],['创建人',p.createdBy],['创建时间',p.createdAt,'',true],['更新人',p.updatedBy],['更新时间',p.updatedAt,'',true],['备注',p.notes,'full']]);
    byId('editPlan').textContent=p.status==='draft'?'继续完善':'编辑计划';
    byId('planState').innerHTML=`<span class="tag tag-${p.status==='enabled'?'green':p.status==='draft'?'orange':'default'}">${esc(MaintenanceLifecycle.label(p))}</span>`;
    const toggle=byId('togglePlan');toggle.hidden=p.status==='draft';toggle.textContent=p.status==='enabled'?'停用':'启用';toggle.onclick=()=>MaintenanceLifecycle[p.status==='enabled'?'disable':'enable'](p.id,()=>location.reload());
    byId('ruleInfo').innerHTML=cells([['豁免车辆状态',p.exempt.join('、')||'无','full'],['无作业任务车辆','日例保'+(p.noWork?'豁免':'不豁免'),'wide'],['日检模式',p.preTrip?'出车前检查':'周期内完成','wide'],['固定排除','已报废、已处置车辆不生成任务','full'],['首次周期起算','入项目日期；后续非日检按上次同周期实际完成日期 + 周期','full']]);
    tabs()('configTab');itemList(p,false);
  }

  function edit() {
    const context=init();if(!context)return;
    const current=context.plan,state=store.clone(current||{id:null,name:'',model:'',scope:'all',projects:[],items:[],exempt:[],noWork:false,preTrip:false,notes:''});
    const activate=tabs();activate('configTab');
    byId('editorTitle').textContent=current?'编辑维护计划':'新增维护计划';
    byId('backEditor').textContent=current?'返回详情':'返回列表';
    if(current)byId('planState').innerHTML=`<span class="tag tag-${current.status==='enabled'?'green':current.status==='draft'?'orange':'default'}">${esc(MaintenanceLifecycle.label(current))}</span>`;
    byId('saveDraft').hidden=!!current;
    byId('saveHint').textContent=current?'保存需完整校验；保存后保留启停状态，草稿完善后转为停用。':'草稿仅要求计划名称；正常保存后为停用，需单独启用。';
    byId('plan-name').value=state.name;byId('plan-notes').value=state.notes;
    byId('plan-name').oninput=event=>state.name=event.target.value;
    byId('plan-notes').oninput=event=>state.notes=event.target.value;
    const modelSelect=SearchSelect.init({container:'#modelSelect',placeholder:'搜索车型名称',items:store.models.map(x=>({value:x,label:x})),getValue:x=>x.value,getLabel:x=>x.label,matchText:x=>x.label,allowClear:false,onChange:value=>{state.model=value||'';byId('modelError').textContent='';summary(state);}});
    modelSelect.setValue(state.model);byId('modelSelect').querySelector('input')?.setAttribute('aria-labelledby','modelLabel');
    byId('plan-scope').value=state.scope;
    function checks(){byId('projectOptions').hidden=state.scope!=='selected';byId('projectOptions').innerHTML=store.projects.map(x=>`<label><input type="checkbox" value="${esc(x)}" ${state.projects.includes(x)?'checked':''}>${esc(x)}</label>`).join('');}
    checks();byId('exemptOptions').innerHTML=store.exemptStatuses.map(x=>`<label><input type="checkbox" value="${esc(x)}" ${state.exempt.includes(x)?'checked':''}>${esc(x)}</label>`).join('');
    byId('plan-scope').onchange=event=>{state.scope=event.target.value;checks();};
    byId('projectOptions').onchange=()=>state.projects=[...byId('projectOptions').querySelectorAll('input:checked')].map(x=>x.value);
    byId('exemptOptions').onchange=()=>state.exempt=[...byId('exemptOptions').querySelectorAll('input:checked')].map(x=>x.value);
    ['noWork','preTrip'].forEach(id=>{byId(id).checked=state[id];byId(id).onchange=event=>state[id]=event.target.checked;});

    let editingId=null;
    const fields={system:byId('item-system'),part:byId('item-part'),name:byId('item-name'),standard:byId('item-standard'),cycle:byId('item-cycle')};
    fields.system.innerHTML=option(store.systems);fields.cycle.innerHTML=option(store.cycles);
    const openItem=id=>{
      editingId=id||null;const x=state.items.find(x=>x.id===id);
      byId('itemForm').reset();document.querySelectorAll('[data-error]').forEach(e=>e.textContent='');byId('itemDuplicateError').textContent='';
      byId('itemModalTitle').textContent=x?`编辑检查项${x.sourceNo?' · 清单第 '+x.sourceNo+' 项':''}`:'新增检查项';
      if(x)Object.keys(fields).forEach(key=>fields[key].value=x[key]);
      Common.openModal('itemModal');
    };
    const list=itemList(state,true,openItem);byId('addItem').onclick=()=>openItem();
    byId('itemForm').onsubmit=event=>{
      event.preventDefault();let invalid=false;const data={...state.items.find(x=>x.id===editingId)};
      Object.keys(fields).forEach(key=>{data[key]=fields[key].value.trim();document.querySelector(`[data-error="${key}"]`).textContent=data[key]?'':'请填写此项';if(!data[key])invalid=true;});
      if(invalid)return;
      if(state.items.some(x=>x.id!==editingId&&store.itemKey(x)===store.itemKey(data))){byId('itemDuplicateError').textContent='同一系统、部件（件号与版本）、项目和周期不可重复';return;}
      if(editingId)state.items=state.items.map(x=>x.id===editingId?{...data,id:editingId}:x);else state.items.push({...data,id:store.uid()});
      Common.closeModal('itemModal');list.render();
    };
    const cancel=()=>Common.confirm({title:'放弃本次修改？',content:'确认后将放弃未保存的检查项和执行规则。',okText:'放弃修改',onOk:()=>location.href=current?'maintenance-plan-detail.html?id='+encodeURIComponent(current.id):'maintenance-plan-list.html'});
    byId('backEditor').onclick=cancel;byId('cancelEditor').onclick=cancel;
    byId('saveDraft').onclick=()=>{
      state.name=byId('plan-name').value.trim();state.notes=byId('plan-notes').value.trim();
      if(!state.name){activate('configTab');byId('nameError').textContent='保存草稿前请填写计划名称';byId('plan-name').focus();return;}
      try{const saved=store.saveDraft(state);Common.showToast('草稿已保存，不生成任务','success');location.href='maintenance-plan-detail.html?id='+encodeURIComponent(saved.id);}catch(error){byId('planErrors').textContent=error.message;byId('planErrors').focus();}
    };
    byId('planForm').onsubmit=event=>{
      event.preventDefault();state.name=byId('plan-name').value.trim();state.notes=byId('plan-notes').value.trim();
      const errors=store.validate(state,store.all(),current?.status==='enabled'), firstMissing=state.items.find(missing), duplicateKeys=new Set();
      const duplicate=state.items.find(x=>{const key=store.itemKey(x);if(duplicateKeys.has(key))return true;duplicateKeys.add(key);return false;});
      byId('nameError').textContent=state.name?'':'请填写计划名称';byId('modelError').textContent=store.models.includes(state.model)?'':'请选择有效的适用车型';byId('projectError').textContent=state.scope==='selected'&&!state.projects.length?'请至少选择一个项目':'';
      byId('planErrors').innerHTML=errors.map(x=>`<div>${esc(x)}</div>`).join('');
      if(errors.length){
        if(!state.name||!store.models.includes(state.model)||(state.scope==='selected'&&!state.projects.length)){activate('configTab');if(!state.name)byId('plan-name').focus();else if(!store.models.includes(state.model))byId('modelSelect').querySelector('input').focus();else byId('plan-scope').focus();}
        else {activate('itemsTab');if(firstMissing||duplicate)list.locate((firstMissing||duplicate).id);byId('planErrors').focus();}
        return;
      }
      try{const saved=store.save(state);Common.showToast('维护计划保存成功','success');location.href='maintenance-plan-detail.html?id='+encodeURIComponent(saved.id);}
      catch(error){byId('planErrors').textContent=error.message;byId('planErrors').focus();}
    };
  }
  global.MaintenancePlan={detail,edit};
})(window);
