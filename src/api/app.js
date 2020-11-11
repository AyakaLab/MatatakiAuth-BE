const KoaRouter = require('koa-router')

const { getQrloginUrl, getLoginStatus } = require('../controllers/bilibili/auth')

let appRouters = new KoaRouter()

appRouters.get("/qrcodeUrl", getQrloginUrl)
appRouters.get("/loginStatus", getLoginStatus)

module.exports = appRouters