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
    mode: 'auto',
    modeText: '自动驾驶',
    runningState: '作业',
    supplyState: '未补给',
    signalStrength: '强',
    alerts: 0,
    speed: 8,
    gear: 'D',
    online: '在线',
    soc: 68,
    water: 12,
    bin: 40,
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
    records: [snapshot],
    // All percentage fields share missing/invalid handling; zero is a valid value.
    formatPercent: function (value) {
      if (value === null || value === undefined || typeof value === 'boolean' || String(value).trim() === '') return '—';
      var number = Number(value);
      return Number.isFinite(number) && number >= 0 && number <= 100 ? number + '%' : '—';
    }
  };
}(window));
