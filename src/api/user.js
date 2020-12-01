const KoaRouter = require('koa-router')
const config = require('../../config.json')

const { getUserInfo, getUnbinding, getSetAvailable, getUserInfoPlain, getUserInfoList, postUserInfoList } = require('../controllers/user')

let userRouters = new KoaRouter()

userRouters.use(async (ctx, next) => {
    const method = ctx.method
    if (method === 'GET') {
        if (!ctx.request.query) {
            return
        }
        else if (ctx.request.query !== config.apiKey) {
            return
        }
    }
    else {
        if (!ctx.request.body.apiKey) {
            return
        }
        else if (ctx.request.body.apiKey !== config.apiKey) {
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