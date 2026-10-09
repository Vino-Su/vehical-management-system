/* 车辆列表和详情共用的 VIN 二维码编码与图片下载，依赖本地 qrcode-generator。 */
(function (global) {
    'use strict';

    function encode(vin) {
        if (!/^[A-Z0-9]{17}$/.test(vin)) throw new Error('车辆 VIN 必须为 17 位大写字母或数字');
        const code = global.qrcode(0, 'M');
        code.addData(vin, 'Alphanumeric');
        code.make();
        return code;
    }

    function buildSvg(vin) {
        return encode(vin).createSvgTag({ cellSize: 1, margin: 4, scalable: true });
    }

    function toPng(vin) {
        const code = encode(vin);
        const count = code.getModuleCount();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 960;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('无法生成二维码图片');
        // 四模块静区、整数倍像素保证边缘清晰，白底可直接用于打印。
        const scale = Math.floor(canvas.width / (count + 8));
        const offset = Math.floor((canvas.width - count * scale) / 2);
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000';
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                if (code.isDark(row, col)) context.fillRect(offset + col * scale, offset + row * scale, scale, scale);
            }
        }
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('二维码图片生成失败')), 'image/png');
        });
    }

    function download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    global.VehicleQr = { buildSvg, toPng, download };
})(window);
