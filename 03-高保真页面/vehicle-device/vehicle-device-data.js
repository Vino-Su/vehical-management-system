/**
 * 设备管理 - 共享数据源
 * 供 设备台账页(vehicle-device-list.html) 与 设备详情页(vehicle-device-detail.html) 共用，
 * 避免两处各维护一份设备/车辆/SIM 数据导致口径不一致。
 * 说明：原型演示数据，页面内为内存态；真实系统由后端接口提供。
 *
 * 设备留痕（口径见《设备管理PRD》3.4、4.9）：
 *   changeLog - 设备变更日志：字段级事件流，每次保存设备信息或绑定关系后按字段差异逐项追加，
 *               一条记录 = 操作类型 + 修改字段 + 修改前 + 修改后 + 操作人 + 时间，倒序（最新置顶），供设备详情页展示
 */
const vehicles=[
  {vin:'LSVAU2A39EN000001',assetId:1,plate:'京ADG090',project:'鸠江项目'},
  {vin:'LSVAU2A39EN000002',assetId:2,plate:'京ADG091',project:'椒北街道'},
  {vin:'LSVAU2A39EN000003',assetId:3,plate:'浙JAR6538',project:'镜湖区项目'},
  {vin:'LSVAU2A39EN000006',assetId:6,plate:'沪AAB124',project:'嘉定研发'},
  {vin:'LSVAU2A39EN000007',assetId:7,plate:'京ADJ055',project:'鸠江项目'},
  {vin:'LSVAU2A39EN000009',assetId:9,plate:'粤AEE077',project:'鸠江项目'},
  {vin:'LSVAU2A39EN000011',assetId:11,plate:'京ADK033',project:'镜湖区项目'}
];
const sims=[
  {imsi:'460041234567890',carrier:'中国移动'},
  {imsi:'460011234567891',carrier:'中国联通'},
  {imsi:'460031234567892',carrier:'中国电信'},
  {imsi:'460041234567893',carrier:'中国移动'},
  {imsi:'460011234567894',carrier:'中国联通'},
  {imsi:'460031234567895',carrier:'中国电信'},
  {imsi:'460041234567896',carrier:'中国移动'},
  {imsi:'460031234567898',carrier:'中国电信'}
];
let devices=[
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
