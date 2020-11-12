// Local Packages
const Log = require('../util/log')

let goToAuthPage = async (ctx, next) => {
    Log.info('Auth Request Redirected to ' + ctx.globalConfig.publicUrl + '/' + ctx.params.platform + '/auth')
    ctx.status = 302
    ctx.redirect(ctx.globalConfig.publicUrl + '/' + ctx.params.platform + '/auth')
    await next()
}

module.exports = { goToAuthPage }