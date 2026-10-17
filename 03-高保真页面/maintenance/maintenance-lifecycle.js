/* 计划启停交互：配置保存与启用分开；原型仅保存状态，不模拟任务调度。 */
(function(global){
  'use strict';
  const store=global.MaintenanceStore;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=p=>({draft:'草稿',enabled:'启用',disabled:'停用'}[p.status]||'—');
  const note=p=>p.status==='enabled'?(p.effectiveAt>store.now()?'待生效 · ':'生效于 ')+p.effectiveAt:'不生成新任务';
  function status(p){return `<span class="tag tag-${p.status==='enabled'?'green':p.status==='draft'?'orange':'default'}">${label(p)}</span>${p.status==='enabled'?`<div class="muted">${esc(note(p))}</div>`:''}`;}
  function enable(id,onDone){
    const p=store.get(id);if(!p)return;
    document.getElementById('enablePlanModal')?.remove();
    const modal=document.createElement('div');modal.id='enablePlanModal';modal.className='modal-overlay';
    modal.innerHTML=`<div class="modal-box enable-plan-modal" role="dialog" aria-modal="true" aria-labelledby="enablePlanTitle"><div class="modal-header"><h3 id="enablePlanTitle">启用维护计划</h3><button type="button" class="modal-close" aria-label="关闭">×</button></div><div class="modal-body"><p>确认启用“${esc(p.name)}”？请选择生效时间。</p><fieldset class="effective-options"><legend>生效时间</legend><label><input type="radio" name="effectiveMode" value="tomorrow" checked><span>次日 00:00 生效（推荐）<small>从次日开始按计划规则生成任务。</small></span></label><label><input type="radio" name="effectiveMode" value="now"><span>立即生效<small>检查当前到期任务；同车、同周期、同轮不重复生成，不补发往日任务。</small></span></label></fieldset><p class="muted" id="effectivePreview"></p><div class="form-errors" id="enablePlanError" role="alert"></div></div><div class="modal-footer"><button type="button" class="btn" data-cancel>取消</button><button type="button" class="btn btn-primary" id="confirmEnablePlan">确认启用</button></div></div>`;
    document.body.append(modal);
    const close=()=>Common.closeModal(modal);
    modal.querySelector('.modal-close').onclick=close;modal.querySelector('[data-cancel]').onclick=close;
    const preview=()=>{
      const tomorrow=new Date(Date.parse(store.now().slice(0,10)+'T00:00:00+08:00')+86400000).toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}).slice(0,10)+' 00:00:00';
      modal.querySelector('#effectivePreview').textContent='预计生效时间（北京时间）：'+(modal.querySelector('input:checked').value==='tomorrow'?tomorrow:'确认启用时立即生效');
    };
    modal.querySelectorAll('input').forEach(input=>input.onchange=preview);preview();
    modal.querySelector('#confirmEnablePlan').onclick=()=>{try{store.enable(id,modal.querySelector('input:checked').value);close();Common.showToast('计划已启用','success');onDone();}catch(error){modal.querySelector('#enablePlanError').textContent=error.message;}};
    Common.openModal(modal);modal.querySelector('input:checked').focus();
  }
  function disable(id,onDone){const p=store.get(id);if(!p)return;Common.confirm({title:'停用维护计划',content:`确认停用“${esc(p.name)}”？停用立即生效，停止生成新任务；待生效安排一并取消，已有任务及历史结果保留。`,okText:'确认停用',onOk:()=>{try{store.disable(id);Common.showToast('计划已停用','success');onDone();}catch(error){Common.showToast(error.message,'error');}}});}
  global.MaintenanceLifecycle={label,note,status,enable,disable};
})(window);
