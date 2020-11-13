// Local Packages
const Log = require('../util/log')

let goToAuthPage = async (ctx, next) => {
    Log.info('Auth Request Redirected to ' + ctx.globalConfig.publicUrl + '/auth/' + ctx.params.platform)
    ctx.status = 302
    ctx.redirect(ctx.globalConfig.publicUrl + '/auth/' + ctx.params.platform)
    await next()
}

module.exports = { goToAuthPage }