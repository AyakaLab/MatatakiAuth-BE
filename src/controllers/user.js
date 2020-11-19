const Log = require('../util/log')
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

let getUserInfoPlain = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    let profile = await Store.user.findOne({ key: 'User' + query.platform + 'Profile', id: query.userId })
    if (profile) ctx.body = profile
    else ctx.body = false

    await next()
}

let getUnbinding = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    await Store.user.remove({ key: 'User' + query.platform + 'Profile', id: query.userId }, { multi: true })
    ctx.body = {code: 0, message: 'success'}
    await next()
}

let getUserInfoList = async (ctx, next) => {
    let platform = ctx.params.platform.split('')
    platform[0] = platform[0].toUpperCase()
    platform = platform.join('')
    Log.debug('User' + platform + 'Profile')
    const res = await Store.user.find({ key: 'User' + platform + 'Profile' })
    ctx.body = res
    await next()
}

let postUserInfoList = async (ctx, next) => {
    console.log(ctx.request.body)
    let platform = ctx.params.platform.split('')
    platform[0] = platform[0].toUpperCase()
    platform = platform.join('')
    Log.debug('User' + platform + 'Profile')
    let listData = []
    JSON.parse(ctx.request.body.list).forEach(item => listData.push(item))
    const res = await Store.user.find({ key: 'User' + platform + 'Profile' })
    let listRes = []
    listRes = res.filter(i => listData.find(e => parseInt(i.id) === e))
    ctx.body = listRes
}

let getSetAvailable = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    let profile = await Store.user.findOne({ key: 'User' + query.platform + 'Profile', id: query.userId })
    if (profile) {
        await Store.user.update({ key: 'User' + query.platform + 'Profile', id: query.userId }, { $set: { available: Boolean(query.available) } }, {})
        ctx.body = { code: 0, message: 'success' }
    }
    else if (!profile) { 
        ctx.body = { code: -1, message: 'User Not Found' }
    }
}

module.exports = {
    getUserInfo,
    getUserInfoPlain,
    getUserInfoList,
    postUserInfoList,
    getUnbinding,
    getSetAvailable
}