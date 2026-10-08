/* Shared single-vehicle snapshot used by vehicle detail and fleet monitoring prototypes. */
(function (root) {
  var snapshot = {
    assetId: 12,
    plate: '京ADG090',
    network: '14156',
    vin: 'LSVAU2A39EN000001',
    model: '麒麟清扫车',
    project: '鸠江项目',
    region: '芜湖市',
    city: '芜湖市',
    lat: 31.3866,
    lng: 118.4018,
    address: '芜湖市鸠江区万春街道附近',
    accuracy: '高（约 5 m）',
    heading: 82,
    mode: 'auto',
    modeText: '自动驾驶',
    workMode: '工作',
    alerts: 0,
    speed: 8,
    takeover: '未接管',
    accL: 0.06,
    accW: 0.02,
    roll: 0.01,
    yaw: 0.02,
    gear: 'D',
    online: '在线',
    soc: 68,
    range: 82,
    water: 12,
    sewage: 40,
    bin: 40,
    equipmentOnline: '8/8',
    traffic: '1.2 GB',
    time: '2026-09-15 14:32:18',
    source: '车载 T-Box / 自动驾驶平台',
    task: {
      name: '鸠江区主干道午后清扫',
      area: '万春街道 A 线',
      status: '执行中',
      progress: 62,
      start: '2026-09-15 13:30',
      eta: '预计 15:10 完成'
    },
    health: [
      { name: '自动驾驶系统 / 自检结果', value: '正常 · 已就绪', state: 'success' },
      { name: '急停与碰撞 / 近碰', value: '正常 · 无触发', state: 'success' },
      { name: '摄像头 / 激光雷达 / 毫米波雷达', value: '部分关注 · 前视摄像头掉线 3 次', state: 'warning' },
      { name: '定位可信度 / 电子围栏越界', value: '正常 · 未越界', state: 'success' },
      { name: '软件与地图版本', value: 'V3.2.1 / MAP-2026.08', state: 'success' }
    ],
    faults: [],
    anomalies: [
      { type: '超时停靠', start: '2026-09-15 11:16:03', end: '2026-09-15 11:18:11', duration: '2.1', reported: '2026-09-15 11:18:16' }
    ],
    trend: {
      hour: [8, 11, 10, 9, 8, 8],
      day: [36, 48, 61, 73, 86, 102],
      week: [312, 438, 506, 620, 744, 812, 886]
    }
  };

  root.VehicleMonitorData = {
    snapshot: snapshot,
    records: [snapshot]
  };
}(window));
