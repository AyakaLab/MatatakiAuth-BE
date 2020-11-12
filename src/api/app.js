const KoaRouter = require('koa-router')

const { getAvailableBinding } = require('../controllers/app')
const { getQrloginUrl, getLoginStatus } = require('../controllers/bilibili/auth')

let appRouters = new KoaRouter()

appRouters.get("/availableBinding", getAvailableBinding)
appRouters.get("/qrcodeUrl", getQrloginUrl)
appRouters.get("/loginStatus", getLoginStatus)

module.exports = appRouters