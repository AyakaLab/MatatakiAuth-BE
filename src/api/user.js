const KoaRouter = require('koa-router')

const { getUserInfo, getUnbinding, getUserInfoPlain } = require('../controllers/user')

let userRouters = new KoaRouter()

userRouters.get("/unbinding", getUnbinding)
userRouters.get("/info", getUserInfoPlain)
userRouters.get("/:id", getUserInfo)

module.exports = userRouters