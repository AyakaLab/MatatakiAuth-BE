// Dependencies
const KoaRouter = require('koa-router')

// Local Package
const getImage = require('../controllers/image')

const imageRouter = new KoaRouter()

imageRouter.get("/:imgName", getImage)

module.exports = imageRouter