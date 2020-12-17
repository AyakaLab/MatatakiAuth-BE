const KoaRouter = require('koa-router')
const config = require('../../config.json')

const { getUserInfo, getUnbinding, getSetAvailable, getUserInfoPlain, getUserInfoList, postUserInfoList } = require('../controllers/user')

let userRouters = new KoaRouter()

userRouters.get("/unbinding", getUnbinding)
userRouters.get("/:id", getUserInfo)

userRouters.use(async (ctx, next) => {
    if (!ctx.request.headers.authorization) {
        ctx.status = 403
        return
    }
    else if (ctx.request.headers.authorization.replace(/^Bearer./, '') !== config.apiToken) {
        ctx.status = 403
        return
    }
    await next()
})

userRouters.get("/setAvailable", getSetAvailable)
userRouters.get("/info", getUserInfoPlain)
userRouters.get("/info/:platform", getUserInfoList)
userRouters.post("/info/:platform", postUserInfoList)

module.exports = userRouters