const Store = require("../store/store")

let getUserInfo = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    const profile = await Store.user.findOne({ key: 'User' + query.platform + 'Profile', id: ctx.params.id })
    if (!profile) ctx.body = { code: 0, message: 'User Not Found' }
    else {
        let obj = {}
        obj.code = 0
        profile.platform = 'bilibili'
        profile.account = profile.userId
        profile.status = 1
        obj.data = [profile]
        ctx.body = obj
    }
}

let getUnbinding = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    await Store.user.remove({ key: 'User' + query.platform + 'Profile', id: query.userId }, { multi: true })
    ctx.body = {code: 0, message: 'success'}
}
module.exports = {
    getUserInfo,
    getUnbinding
}