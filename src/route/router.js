const KoaRouter = require('koa-router')

let routers = new KoaRouter()

let app = require('../api/app')
let authRouter = require('../api/auth')
let userRouter = require('../api/user')
let imageRouter = require('../api/image')
let pluginRouterCreation = require('../api/plugin')

routers.use("/app", app.routes(), app.allowedMethods())
routers.use("/auth", authRouter.routes(), authRouter.allowedMethods())
routers.use("/user", userRouter.routes(), userRouter.allowedMethods())
routers.use("/image", imageRouter.routes(), imageRouter.allowedMethods())

pluginRouterCreation.on('moduleReady', (err, pluginRouter) => {
    if (err) console.log(err)
    routers.use("/", pluginRouter.routes(), pluginRouter.allowedMethods())
})
pluginRouterCreation.main()

module.exports = routers