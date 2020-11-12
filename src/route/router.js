const KoaRouter = require('koa-router')

let routers = new KoaRouter()

let app = require('../api/app')
let imageRouter = require('../api/image')

routers.use("/app", app.routes(), app.allowedMethods())
routers.use("/image", imageRouter.routes(), imageRouter.allowedMethods())

module.exports = routers