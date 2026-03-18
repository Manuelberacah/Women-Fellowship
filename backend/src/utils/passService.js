const QRCode = require("qrcode");

async function generatePassQr(payload) {
  const data = JSON.stringify(payload);
  return QRCode.toDataURL(data, { margin: 1, width: 300 });
}

module.exports = { generatePassQr };
