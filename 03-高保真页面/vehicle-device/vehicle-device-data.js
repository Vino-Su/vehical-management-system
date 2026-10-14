/**
 * 设备管理 - 共享数据源
 * 供 设备台账页(vehicle-device-list.html) 与 设备详情页(vehicle-device-detail.html) 共用，
 * 避免两处各维护一份设备/车辆/SIM 数据导致口径不一致。
 * 说明：原型演示数据，页面内为内存态；真实系统由后端接口提供。
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
  {id:1,name:'T-BOX',identifier:'TBX-2026-001',type:'T-Box',serial:'HW-001-8841',vendor:'华为',model:'ME909s',status:'正常',vehicleVin:'LSVAU2A39EN000001',simImsi:'460041234567890',updated:'2026-10-12 16:30',notes:'主车载通信终端',history:[['2026-10-12 16:30','绑定车辆','绑定 京ADG090'],['2026-09-18 09:12','绑定 SIM','绑定 460041234567890']]},
  {id:2,name:'车载视频盒子',identifier:'VBX-2026-018',type:'视频盒子',serial:'VB-018-6632',vendor:'海康威视',model:'DS-MP7608',status:'正常',vehicleVin:'LSVAU2A39EN000002',simImsi:'460011234567891',updated:'2026-10-11 11:08',notes:'视频回传盒子',history:[['2026-10-11 11:08','绑定 SIM','绑定 460011234567891'],['2026-09-20 14:20','绑定车辆','绑定 京ADG091']]},
  {id:3,name:'DTU',identifier:'DTU-2026-027',type:'DTU',serial:'DTU-027-1903',vendor:'移远通信',model:'EC25',status:'正常',vehicleVin:'LSVAU2A39EN000003',simImsi:'460031234567892',updated:'2026-10-09 15:42',notes:'作业控制通信终端',history:[['2026-10-09 15:42','绑定车辆','绑定 浙JAR6538']]},
  {id:4,name:'自动驾驶域控制器',identifier:'ADU-2026-006',type:'ADU',serial:'ADU-006-2128',vendor:'自研',model:'ADU 3.1',status:'正常',vehicleVin:'LSVAU2A39EN000006',simImsi:'460041234567893',updated:'2026-10-08 10:05',notes:'自动驾驶域控制器',history:[['2026-10-08 10:05','绑定车辆','绑定 沪AAB124']]},
  {id:5,name:'T-BOX',identifier:'TBX-2026-032',type:'T-Box',serial:'HW-032-7120',vendor:'移远通信',model:'AG55xN',status:'维修中',vehicleVin:'LSVAU2A39EN000007',simImsi:'',updated:'2026-10-07 17:18',notes:'待返修确认',history:[['2026-10-07 17:18','设备维护','标记为维修中']]},
  {id:6,name:'车载视频盒子',identifier:'VBX-2026-041',type:'视频盒子',serial:'VB-041-9921',vendor:'海康威视',model:'DS-MP7608',status:'正常',vehicleVin:'LSVAU2A39EN000009',simImsi:'460031234567895',updated:'2026-10-06 13:20',notes:'',history:[['2026-10-06 13:20','绑定 SIM','绑定 460031234567895']]},
  {id:7,name:'T-BOX',identifier:'TBX-2026-048',type:'T-Box',serial:'HW-048-5610',vendor:'华为',model:'ME909s',status:'正常',vehicleVin:'LSVAU2A39EN000011',simImsi:'460041234567896',updated:'2026-10-05 09:16',notes:'',history:[['2026-10-05 09:16','绑定车辆','绑定 京ADK033']]},
  {id:8,name:'OBU',identifier:'OBU-2026-013',type:'OBU',serial:'OBU-013-4480',vendor:'中移物联',model:'OBU-X2',status:'正常',vehicleVin:'',simImsi:'',updated:'2026-10-04 16:02',notes:'备用设备',history:[['2026-10-04 16:02','新增设备','设备入库']]},
  {id:9,name:'DTU',identifier:'DTU-2026-054',type:'DTU',serial:'DTU-054-3320',vendor:'移远通信',model:'EC25',status:'已报废',vehicleVin:'',simImsi:'460031234567898',updated:'2026-09-28 12:34',notes:'原安装车辆已更换设备',history:[['2026-09-28 12:34','解绑车辆','设备从浙JDB1062移出']]},
  {id:10,name:'T-BOX',identifier:'TBX-2026-057',type:'T-Box',serial:'HW-057-8831',vendor:'华为',model:'ME909s',status:'已报废',vehicleVin:'',simImsi:'',updated:'2026-09-18 08:42',notes:'故障报废',history:[['2026-09-18 08:42','设备维护','标记为已报废']]},
  {id:11,name:'车载视频盒子',identifier:'VBX-2026-063',type:'视频盒子',serial:'VB-063-1178',vendor:'海康威视',model:'DS-MP7608',status:'正常',vehicleVin:'',simImsi:'',updated:'2026-09-12 10:20',notes:'待安装',history:[['2026-09-12 10:20','新增设备','设备入库']]},
  {id:12,name:'自动驾驶域控制器',identifier:'ADU-2026-012',type:'ADU',serial:'ADU-012-5699',vendor:'自研',model:'ADU 3.1',status:'正常',vehicleVin:'LSVAU2A39EN000006',simImsi:'',updated:'2026-09-10 14:54',notes:'一车多终端示例',history:[['2026-09-10 14:54','绑定车辆','绑定 沪AAB124']]}
];
