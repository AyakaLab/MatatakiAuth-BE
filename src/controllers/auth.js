// Local Packages
const Log = require('../util/log')

let goToAuthPage = async (ctx, next) => {
    Log.info('Auth Request Redirected to ' + ctx.globalConfig.publicUrl + '/auth/' + ctx.params.platform)
    ctx.status = 302
    if (ctx.request.query.token) {
        ctx.redirect(ctx.globalConfig.publicUrl + '/auth/' + ctx.params.platform + '?token=' + ctx.request.query.token + '&network=' + ctx.request.query.network)
    }
    else {
        ctx.redirect(ctx.globalConfig.publicUrl + '/auth/' + ctx.params.platform)
    }
    await next()
}

module.exports = { goToAuthPage }