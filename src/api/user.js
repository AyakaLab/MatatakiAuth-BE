const KoaRouter = require('koa-router')

const { getUserInfo, getUnbinding } = require('../controllers/user')

let userRouters = new KoaRouter()

userRouters.get("/unbinding", getUnbinding)
userRouters.get("/:id", getUserInfo)

module.exports = userRouters