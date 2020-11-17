const Store = require("../store/store")

let getUserInfo = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    let profile
    
    if (query.platform) {
        profile = await Store.user.findOne({ key: 'User' + query.platform + 'Profile', id: ctx.params.id })
    }
    else {
        profile = await Store.user.findOne({ key: 'UserProfile', id: ctx.params.id })
    }
    
    if (!profile) ctx.body = { code: 0, message: 'User Not Found' }
    else {
        if (query.platform) {
            let obj = {}
            obj.code = 0
            profile.platform = 'bilibili'
            profile.account = profile.userId
            profile.status = 1
            obj.data = [profile]
            ctx.body = obj
            await next()
        }
        else {
            let obj = {}
            obj.code = 0
            obj.data = profile
            ctx.body = obj
            await next()
        }
    }
}

let getUnbinding = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    await Store.user.remove({ key: 'User' + query.platform + 'Profile', id: query.userId }, { multi: true })
    ctx.body = {code: 0, message: 'success'}
    await next()
}
module.exports = {
    getUserInfo,
    getUnbinding
}