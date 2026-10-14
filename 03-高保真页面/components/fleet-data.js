/**
 * 车辆 / 设备 / SIM 卡 - 统一数据源
 * 供设备管理(vehicle-device/*)与 SIM 卡管理(sim-card/*)共用，
 * 避免两个模块各维护一份车辆、设备、SIM 卡数据导致口径不一致。
 * 说明：原型演示数据，页面内为内存态；真实系统由后端接口提供。
 *
 * 口径（依据《设备管理PRD》《SIM卡管理PRD》）：
 *   1. 设备是绑定关系的锚点，也是终端主数据；SIM 卡的绑定字段（车辆 VIN 码、车牌号、
 *      归属项目、硬件类型、硬件识别码）一律由 devices 派生，不在 SIM 卡侧单独维护。
 *   2. 一张 SIM 卡同一时间只绑定一台设备；一台设备同一时间只绑定一张 SIM 卡。
 *   3. 绑定关系变更只在设备侧留痕（设备变更日志，见下），SIM 卡侧记录绑定记录表（sims[].bindings）。
 */

/** 车辆主数据（assetId 用于跳转车辆资产详情） */
const vehicles = [
  {vin:'LSVAU2A39EN000001',assetId:1,plate:'京ADG090',project:'鸠江项目'},
  {vin:'LSVAU2A39EN000002',assetId:2,plate:'京ADG091',project:'椒北街道'},
  {vin:'LSVAU2A39EN000003',assetId:3,plate:'浙JAR6538',project:'镜湖区项目'},
  {vin:'LSVAU2A39EN000006',assetId:6,plate:'沪AAB124',project:'嘉定研发'},
  {vin:'LSVAU2A39EN000007',assetId:7,plate:'京ADJ055',project:'鸠江项目'},
  {vin:'LSVAU2A39EN000009',assetId:9,plate:'粤AEE077',project:'鸠江项目'},
  {vin:'LSVAU2A39EN000011',assetId:11,plate:'京ADK033',project:'镜湖区项目'}
];

/**
 * 设备台账（车端网联终端主数据 + 当前绑定关系 + 设备变更日志）
 * changeLog - 字段级事件流：每次保存设备信息或绑定关系后按字段差异逐项追加，
 *             一条记录 = 操作类型 + 修改字段 + 修改前 + 修改后 + 操作人 + 时间，倒序（最新置顶）。
 */
let devices = [
  {id:1,name:'T-BOX',identifier:'TBX-2026-001',type:'T-Box',serial:'HW-001-8841',vendor:'华为',model:'ME909s',status:'正常',vehicleVin:'LSVAU2A39EN000001',simImsi:'460041234567890',updated:'2026-10-12 16:30',notes:'主车载通信终端',changeLog:[{time:'2026-10-12 16:30',type:'修改',field:'车辆VIN码',before:'',after:'LSVAU2A39EN000001',operator:'张三'},{time:'2026-09-25 14:05',type:'修改',field:'厂商',before:'中兴',after:'华为',operator:'张三'},{time:'2026-09-18 09:12',type:'修改',field:'IMSI',before:'',after:'460041234567890',operator:'李四'},{time:'2026-08-20 10:20',type:'新增',field:'',before:'',after:'',operator:'张三'}]},
  {id:2,name:'车载视频盒子',identifier:'VBX-2026-018',type:'视频盒子',serial:'VB-018-6632',vendor:'海康威视',model:'DS-MP7608',status:'正常',vehicleVin:'LSVAU2A39EN000002',simImsi:'460011234567891',updated:'2026-10-11 11:08',notes:'视频回传盒子',changeLog:[{time:'2026-10-11 11:08',type:'修改',field:'IMSI',before:'',after:'460011234567891',operator:'李明'},{time:'2026-09-20 14:20',type:'修改',field:'车辆VIN码',before:'',after:'LSVAU2A39EN000002',operator:'张三'},{time:'2026-08-15 09:35',type:'新增',field:'',before:'',after:'',operator:'李明'}]},
  {id:3,name:'DTU',identifier:'DTU-2026-027',type:'DTU',serial:'DTU-027-1903',vendor:'移远通信',model:'EC25',status:'正常',vehicleVin:'LSVAU2A39EN000003',simImsi:'460031234567892',updated:'2026-10-09 15:42',notes:'作业控制通信终端',changeLog:[{time:'2026-10-09 15:42',type:'修改',field:'车辆VIN码',before:'',after:'LSVAU2A39EN000003',operator:'王强'},{time:'2026-09-26 10:30',type:'修改',field:'IMSI',before:'',after:'460031234567892',operator:'王强'},{time:'2026-08-28 16:05',type:'新增',field:'',before:'',after:'',operator:'王强'}]},
  {id:4,name:'自动驾驶域控制器',identifier:'ADU-2026-006',type:'ADU',serial:'ADU-006-2128',vendor:'自研',model:'ADU 3.1',status:'正常',vehicleVin:'LSVAU2A39EN000006',simImsi:'460041234567893',updated:'2026-10-08 10:05',notes:'自动驾驶域控制器',changeLog:[{time:'2026-10-08 10:05',type:'修改',field:'车辆VIN码',before:'',after:'LSVAU2A39EN000006',operator:'赵伟'},{time:'2026-09-22 16:12',type:'修改',field:'IMSI',before:'',after:'460041234567893',operator:'赵伟'},{time:'2026-08-30 11:40',type:'新增',field:'',before:'',after:'',operator:'赵伟'}]},
  {id:5,name:'T-BOX',identifier:'TBX-2026-032',type:'T-Box',serial:'HW-032-7120',vendor:'移远通信',model:'AG55xN',status:'维修中',vehicleVin:'LSVAU2A39EN000007',simImsi:'',updated:'2026-10-07 17:18',notes:'待返修确认',changeLog:[{time:'2026-10-07 17:18',type:'修改',field:'状态',before:'正常',after:'维修中',operator:'王强'},{time:'2026-08-30 09:40',type:'修改',field:'车辆VIN码',before:'',after:'LSVAU2A39EN000007',operator:'张三'},{time:'2026-07-18 15:20',type:'新增',field:'',before:'',after:'',operator:'张三'}]},
  {id:6,name:'车载视频盒子',identifier:'VBX-2026-041',type:'视频盒子',serial:'VB-041-9921',vendor:'海康威视',model:'DS-MP7608',status:'正常',vehicleVin:'LSVAU2A39EN000009',simImsi:'460031234567895',updated:'2026-10-06 13:20',notes:'',changeLog:[{time:'2026-10-06 13:20',type:'修改',field:'IMSI',before:'',after:'460031234567895',operator:'李四'},{time:'2026-09-19 11:05',type:'修改',field:'车辆VIN码',before:'',after:'LSVAU2A39EN000009',operator:'李四'},{time:'2026-08-12 14:50',type:'新增',field:'',before:'',after:'',operator:'李四'}]},
  {id:7,name:'T-BOX',identifier:'TBX-2026-048',type:'T-Box',serial:'HW-048-5610',vendor:'华为',model:'ME909s',status:'正常',vehicleVin:'LSVAU2A39EN000011',simImsi:'460041234567896',updated:'2026-10-05 09:16',notes:'',changeLog:[{time:'2026-10-05 09:16',type:'修改',field:'IMSI',before:'',after:'460041234567896',operator:'王强'},{time:'2026-09-15 14:48',type:'修改',field:'车辆VIN码',before:'',after:'LSVAU2A39EN000011',operator:'张三'},{time:'2026-08-05 09:10',type:'新增',field:'',before:'',after:'',operator:'王强'}]},
  {id:8,name:'OBU',identifier:'OBU-2026-013',type:'OBU',serial:'OBU-013-4480',vendor:'中移物联',model:'OBU-X2',status:'正常',vehicleVin:'',simImsi:'',updated:'2026-10-04 16:02',notes:'备用设备',changeLog:[{time:'2026-10-04 16:02',type:'新增',field:'',before:'',after:'',operator:'李明'}]},
  {id:9,name:'DTU',identifier:'DTU-2026-054',type:'DTU',serial:'DTU-054-3320',vendor:'移远通信',model:'EC25',status:'已报废',vehicleVin:'',simImsi:'460031234567898',updated:'2026-09-28 12:34',notes:'原安装车辆已更换设备',changeLog:[{time:'2026-09-28 12:34',type:'修改',field:'状态',before:'正常',after:'已报废',operator:'王强'},{time:'2026-09-28 12:34',type:'修改',field:'车辆VIN码',before:'LSVAU2A39EN000006',after:'',operator:'王强'},{time:'2026-06-15 10:05',type:'修改',field:'IMSI',before:'',after:'460031234567898',operator:'王强'},{time:'2026-03-20 09:30',type:'新增',field:'',before:'',after:'',operator:'王强'}]},
  {id:10,name:'T-BOX',identifier:'TBX-2026-057',type:'T-Box',serial:'HW-057-8831',vendor:'华为',model:'ME909s',status:'已报废',vehicleVin:'',simImsi:'',updated:'2026-09-18 08:42',notes:'故障报废',changeLog:[{time:'2026-09-18 08:42',type:'修改',field:'状态',before:'正常',after:'已报废',operator:'王强'},{time:'2026-05-12 10:15',type:'新增',field:'',before:'',after:'',operator:'张三'}]},
  {id:11,name:'车载视频盒子',identifier:'VBX-2026-063',type:'视频盒子',serial:'VB-063-1178',vendor:'海康威视',model:'DS-MP7608',status:'正常',vehicleVin:'',simImsi:'',updated:'2026-09-12 10:20',notes:'待安装',changeLog:[{time:'2026-09-12 10:20',type:'新增',field:'',before:'',after:'',operator:'李明'}]},
  {id:12,name:'自动驾驶域控制器',identifier:'ADU-2026-012',type:'ADU',serial:'ADU-012-5699',vendor:'自研',model:'ADU 3.1',status:'正常',vehicleVin:'LSVAU2A39EN000006',simImsi:'',updated:'2026-09-10 14:54',notes:'一车多终端示例',changeLog:[{time:'2026-09-10 14:54',type:'修改',field:'车辆VIN码',before:'',after:'LSVAU2A39EN000006',operator:'赵伟'},{time:'2026-07-25 10:40',type:'新增',field:'',before:'',after:'',operator:'赵伟'}]}
];

/**
 * SIM 卡台账（卡自身字段；绑定字段由 devices 派生，见 simBinding）
 * plan 为套餐文案，quotaGb 为套餐额度（GB），usedGb 为当月已用（GB），bindings 为绑定记录表（倒序）。
 */
let sims = [
  {id:1,imsi:'460041234567890',msisdn:'13916881234',iccid:'898600F202601001',carrier:'中国移动',plan:'10G/月',quotaGb:10,usedGb:7.6,status:'正使用',pool:'POOL-2026-001',bindings:[['LSVAU2A39EN000001','京ADG090','TBX-2026-001','T-Box','2026-09-11 10:24','张三'],['LSVAU2A39EN000001','京ADG090','TBX-2025-032','T-Box','2026-01-05 09:16','李四'],['LSVAU2A39EN000001','京ADG090','DTU-2025-014','DTU','2025-07-18 15:42','王强']]},
  {id:2,imsi:'460011234567891',msisdn:'18602185678',iccid:'898601F202601002',carrier:'中国联通',plan:'100G/月',quotaGb:100,usedGb:112.4,status:'正使用',pool:'POOL-2026-002',bindings:[['LSVAU2A39EN000002','京ADG091','VBX-2026-018','视频盒子','2026-09-10 15:36','李明']]},
  {id:3,imsi:'460031234567892',msisdn:'13311780192',iccid:'898603F202601003',carrier:'中国电信',plan:'30G/月',quotaGb:30,usedGb:9.3,status:'沉默期',pool:'POOL-2026-003',bindings:[['LSVAU2A39EN000003','浙JAR6538','DTU-2026-027','DTU','2026-09-09 15:42','王强']]},
  {id:4,imsi:'460041234567893',msisdn:'13916885632',iccid:'898600F202601004',carrier:'中国移动',plan:'300G/月',quotaGb:300,usedGb:238.7,status:'正使用',pool:'POOL-2026-004',bindings:[['LSVAU2A39EN000006','沪AAB124','ADU-2026-006','ADU','2026-09-08 10:05','赵伟']]},
  {id:5,imsi:'460011234567894',msisdn:'18602183219',iccid:'898601F202601005',carrier:'中国联通',plan:'10G/月',quotaGb:10,usedGb:1.2,status:'测试期',pool:'POOL-2026-005',bindings:[]},
  {id:6,imsi:'460031234567895',msisdn:'13311783654',iccid:'898603F202601006',carrier:'中国电信',plan:'30G/月',quotaGb:30,usedGb:30.8,status:'停机保号',pool:'POOL-2026-006',bindings:[['LSVAU2A39EN000009','粤AEE077','VBX-2026-041','视频盒子','2026-09-06 13:20','李四']]},
  {id:7,imsi:'460041234567896',msisdn:'13916883456',iccid:'898600F202601007',carrier:'中国移动',plan:'100G/月',quotaGb:100,usedGb:66.1,status:'正使用',pool:'POOL-2026-007',bindings:[['LSVAU2A39EN000011','京ADK033','TBX-2026-048','T-Box','2026-09-05 09:16','王强']]},
  {id:8,imsi:'460011234567897',msisdn:'18602189876',iccid:'898601F202601008',carrier:'中国联通',plan:'10G/月',quotaGb:10,usedGb:0,status:'库存期',pool:'POOL-2026-008',bindings:[]},
  {id:9,imsi:'460031234567898',msisdn:'13311780987',iccid:'898603F202601009',carrier:'中国电信',plan:'30G/月',quotaGb:30,usedGb:17.5,status:'停机',pool:'POOL-2026-009',bindings:[]},
  {id:10,imsi:'460041234567899',msisdn:'13916887890',iccid:'898600F202601010',carrier:'中国移动',plan:'100G/月',quotaGb:100,usedGb:94.8,status:'预销号',pool:'POOL-2026-010',bindings:[]},
  {id:11,imsi:'460011234567800',msisdn:'18602184567',iccid:'898601F202601011',carrier:'中国联通',plan:'10G/月',quotaGb:10,usedGb:4.3,status:'未知',pool:'POOL-2026-011',bindings:[]},
  {id:12,imsi:'460031234567801',msisdn:'13311781234',iccid:'898603F202601012',carrier:'中国电信',plan:'300G/月',quotaGb:300,usedGb:263.4,status:'正使用',pool:'POOL-2026-012',bindings:[]}
];

/* ========== 查询助手：以设备为锚点派生 SIM 卡的绑定字段 ========== */

/** 取 SIM 卡当前绑定的设备 */
function deviceOfSim(imsi){return devices.find(d=>d.simImsi&&d.simImsi===imsi)||null}
/** 取设备当前绑定的车辆 */
function vehicleOfDevice(device){return device&&device.vehicleVin?vehicles.find(v=>v.vin===device.vehicleVin)||null:null}
/**
 * 取 SIM 卡的绑定信息（车辆 VIN 码 / 车牌号 / 归属项目 / 硬件类型 / 硬件识别码）。
 * 未绑定设备时全部返回空字符串，由页面统一展示为「—」或「未绑定」。
 */
function simBinding(imsi){
  const d=deviceOfSim(imsi),v=vehicleOfDevice(d);
  return {vin:d&&d.vehicleVin?d.vehicleVin:'',plate:v?v.plate:'',project:v?v.project:'',type:d?d.type:'',device:d?d.identifier:''};
}
/** SIM 卡台账行数据 = 卡自身字段 + 绑定字段（供 SIM 卡台账列表直接渲染/筛选） */
function simRows(){return sims.map(s=>Object.assign({},s,simBinding(s.imsi)))}
/** 设备可绑定的 SIM 卡候选中，判断该卡是否已被其他设备占用 */
function simOccupiedBy(imsi,deviceId){const d=deviceOfSim(imsi);return d&&d.id!==deviceId?d:null}

/* ========== 设备变更日志写入 ========== */

/** 可维护的设备字段与其在变更日志中的展示名；顺序即同一时间戳下日志的展示顺序。 */
const DEVICE_EDIT_FIELDS={name:'设备名称',type:'设备类型',identifier:'设备识别码',serial:'设备序列号',vendor:'厂商',model:'型号',status:'状态',notes:'备注'};
/** 当前操作人：静态原型沿用全局用户名称，未登录时默认「管理员」。 */
function currentOperator(){return (window.Common&&Common.getCurrentUser&&Common.getCurrentUser().name)||'管理员'}
/**
 * 追加一条设备变更日志（字段级事件），最新置顶。
 * 修改前/后传空字符串即表示「原为空」或「已清空」，由页面统一展示为「—」。
 */
function recordDeviceChange(device,time,type,field,before,after,operator){
  (device.changeLog||(device.changeLog=[])).unshift({time,type,field:field||'',before:before==null?'':String(before),after:after==null?'':String(after),operator:operator||currentOperator()});
}
/** 编辑设备保存后按字段差异逐项写入变更日志（未变化的字段不记）；反向写入以保证日志中字段顺序与表单一致。 */
function recordDeviceEdits(device,before,after,time){
  Object.keys(DEVICE_EDIT_FIELDS).reverse().forEach(key=>{
    const b=(before&&before[key])||'',a=(after&&after[key])||'';
    if(b!==a)recordDeviceChange(device,time,'修改',DEVICE_EDIT_FIELDS[key],b,a);
  });
}
/**
 * 绑定关系保存后写入变更日志：车辆与 SIM 卡各自变化时分别记一条，未变化项不记；解绑一侧记为空值。
 * 修改字段沿用设备字段名（车辆VIN码 / IMSI），修改前/后只存 VIN、IMSI 本身，不拼接车牌，便于按字段名直接比对。
 */
function recordBindingChanges(device,time,oldVin,oldSim){
  // 先写 IMSI、后写 VIN，保证同一时间戳下「车辆VIN码」在日志中位于「IMSI」之上
  if((device.simImsi||'')!==(oldSim||''))recordDeviceChange(device,time,'修改','IMSI',oldSim||'',device.simImsi||'');
  if((device.vehicleVin||'')!==(oldVin||''))recordDeviceChange(device,time,'修改','车辆VIN码',oldVin||'',device.vehicleVin||'');
}
/** 设备新增后写入一条登记记录：字段级日志用「—」占位，与车辆资产变更日志中删除记录的口径一致。 */
function recordDeviceCreated(device,time){recordDeviceChange(device,time,'新增','','','')}

/* ========== SIM 卡绑定记录写入 ========== */

/**
 * 保存 SIM 卡绑定后新增一条绑定记录（倒序，最新置顶）。
 * 解绑时硬件识别码等传空字符串，由 SIM 卡详情页统一展示为「—」。
 */
function recordSimBinding(sim,time,binding){
  const row=[binding.vin||'',binding.plate||'',binding.device||'',binding.type||'',time,currentOperator()];
  (sim.bindings||(sim.bindings=[])).unshift(row);
}
/**
 * 保存 SIM 卡的绑定关系（设备是绑定关系的锚点）：
 *   1. 原设备解绑（simImsi 置空）并按字段差异写设备变更日志；
 *   2. 新设备绑定（simImsi 置为本卡 IMSI）并按字段差异写设备变更日志；
 *   3. 追加一条 SIM 卡绑定记录（解绑时绑定字段留空）。
 * deviceCode 传空表示解绑。返回 { changed, device, binding }，无变化时 changed 为 false。
 */
function applySimBinding(sim,deviceCode,time){
  const oldDevice=deviceOfSim(sim.imsi);
  const newDevice=deviceCode?devices.find(d=>d.identifier===deviceCode)||null:null;
  if((oldDevice?oldDevice.identifier:'')===(deviceCode||''))return {changed:false};
  if(oldDevice){const oldVin=oldDevice.vehicleVin;oldDevice.simImsi='';oldDevice.updated=time;recordBindingChanges(oldDevice,time,oldVin,sim.imsi)}
  if(newDevice){const oldSim=newDevice.simImsi||'',oldVin=newDevice.vehicleVin;newDevice.simImsi=sim.imsi;newDevice.updated=time;recordBindingChanges(newDevice,time,oldVin,oldSim)}
  const vehicle=newDevice?vehicleOfDevice(newDevice):null;
  const binding={vin:newDevice?newDevice.vehicleVin||'':'',plate:vehicle?vehicle.plate:'',project:vehicle?vehicle.project:'',type:newDevice?newDevice.type:'',device:newDevice?newDevice.identifier:''};
  recordSimBinding(sim,time,binding);
  return {changed:true,device:newDevice,binding};
}
