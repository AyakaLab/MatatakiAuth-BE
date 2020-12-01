const KoaRouter = require('koa-router')
const config = require('../../config.json')

const { getUserInfo, getUnbinding, getSetAvailable, getUserInfoPlain, getUserInfoList, postUserInfoList } = require('../controllers/user')

let userRouters = new KoaRouter()

userRouters.use(async (ctx, next) => {
    const method = ctx.method
    if (method === 'GET') {
        if (!ctx.request.query) {
            ctx.status = 403
            return
        }
        else if (ctx.request.query !== config.apiToken) {
            ctx.status = 403
            return
        }
    }
    else {
        if (!ctx.request.body.apiToken) {
            ctx.status = 403
            return
        }
        else if (ctx.request.body.apiToken !== config.apiToken) {
            ctx.status = 403
            return
        }
    }
    await next()
})

userRouters.get("/unbinding", getUnbinding)
userRouters.get("/setAvailable", getSetAvailable)
userRouters.get("/info", getUserInfoPlain)
userRouters.get("/info/:platform", getUserInfoList)
userRouters.post("/info/:platform", postUserInfoList)
userRouters.get("/:id", getUserInfo)

module.exports = userRouters