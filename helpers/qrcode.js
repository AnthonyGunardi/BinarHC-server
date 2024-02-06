const QRCode = require('qrcode')

const generateQR = async (text) => {
  try {
    console.log(await QRCode.toDataURL(text))
  } catch (err) {
    console.error(err)
  }
}

module.exports = generateQR