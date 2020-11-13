const KoaRouter = require('koa-router')

const { getAvailableBinding } = require('../controllers/app')

let appRouters = new KoaRouter()

appRouters.get("/availableBinding", getAvailableBinding)

module.exports = appRouters