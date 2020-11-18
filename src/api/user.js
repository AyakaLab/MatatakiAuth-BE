const KoaRouter = require('koa-router')

const { getUserInfo, getUnbinding, getSetAvailable, getUserInfoPlain, getUserInfoList } = require('../controllers/user')

let userRouters = new KoaRouter()

userRouters.get("/unbinding", getUnbinding)
userRouters.get("/setAvailable", getSetAvailable)
userRouters.get("/info", getUserInfoPlain)
userRouters.get("/info/:platform", getUserInfoList)
userRouters.get("/:id", getUserInfo)

module.exports = userRouters