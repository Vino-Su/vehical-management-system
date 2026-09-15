/**
 * 导出组件(公共组件,适用于高保真原型演示)
 *
 * 特性:
 *   - 纯原生 JS,零依赖,零样式(下载无界面)
 *   - CSV 导出支持中文(自动添加 UTF-8 BOM,Excel 打开不乱码)
 *   - 单元格自动转义(逗号、引号、换行)
 *
 * 用法:
 *   1. 页面引入:<script src="components/export-component.js"></script>
 *   2. 从数据导出:
 *      exportCSV({
 *        filename: '订单记录.csv',
 *        headers: ['订单编号', '客户名称', '金额'],
 *        rows: [['ORD001', '华东运输', '1234.50'], ...]
 *      });
 *   3. 从页面现有表格导出:
 *      exportTableToCSV({
 *        tableId: 'recentTable',          // 表格 id(不含表头行外的干扰元素)
 *        filename: '最近更新记录.csv'
 *      });
 *   4. 配合 toast:showToast('已开始导出', 'success');
 */
(function (global) {
  'use strict';

  // 单元格转义:逗号、引号、换行时包裹双引号
  function escapeCell(value) {
    var s = String(value === undefined || value === null ? '' : value);
    if (/[",\n\r]/.test(s)) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function buildCSV(headers, rows) {
    var lines = [];
    if (headers && headers.length) {
      lines.push(headers.map(escapeCell).join(','));
    }
    (rows || []).forEach(function (row) {
      lines.push(row.map(escapeCell).join(','));
    });
    return '﻿' + lines.join('\r\n');
  }

  function triggerDownload(content, filename) {
    var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || '导出.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /** 从二维数据导出 CSV */
  function exportCSV(options) {
    options = options || {};
    var content = buildCSV(options.headers, options.rows);
    triggerDownload(content, options.filename);
    return true;
  }

  /** 从页面现有表格 DOM 导出 CSV */
  function exportTableToCSV(options) {
    options = options || {};
    var table = document.getElementById(options.tableId);
    if (!table) {
      throw new Error('exportTableToCSV: 未找到表格 #' + options.tableId);
    }
    var headers = [];
    var headRow = table.querySelector('thead tr');
    if (headRow) {
      headers = Array.prototype.map.call(headRow.querySelectorAll('th,td'), function (cell) {
        return cell.textContent.trim();
      });
    }
    var rows = [];
    var bodyRows = table.querySelectorAll('tbody tr');
    Array.prototype.forEach.call(bodyRows, function (tr) {
      var row = Array.prototype.map.call(tr.querySelectorAll('td'), function (cell) {
        return cell.textContent.trim();
      });
      rows.push(row);
    });
    var content = buildCSV(headers, rows);
    triggerDownload(content, options.filename);
    return rows.length;
  }

  global.exportCSV = exportCSV;
  global.exportTableToCSV = exportTableToCSV;
})(window);
