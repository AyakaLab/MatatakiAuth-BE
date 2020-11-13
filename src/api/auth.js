// Dependencies
const KoaRouter = require('koa-router')

// Local Package
const { goToAuthPage } = require('../controllers/auth')

const authRouter = new KoaRouter()

authRouter.get("/:platform", goToAuthPage)

module.exports = authRouter