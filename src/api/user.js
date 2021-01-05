const KoaRouter = require('koa-router')
const config = require('../../config.json')

const { getUserInfo, getUnbinding, getSetAvailable, getUserInfoPlain, getUserInfoByPlatformId, getUserInfoList, postUserInfoList } = require('../controllers/user')

let userRouters = new KoaRouter()

userRouters.get("/id", getUserInfo)
userRouters.get("/unbinding", getUnbinding)

userRouters.get("/platforminfo", getUserInfoByPlatformId)
userRouters.get("/setAvailable", getSetAvailable)
userRouters.get("/info", getUserInfoPlain)
userRouters.get("/info/:platform", getUserInfoList)
userRouters.post("/info/:platform", postUserInfoList)

module.exports = userRouters