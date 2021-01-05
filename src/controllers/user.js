const Log = require('../util/log')
const Store = require("../store/store")
const config = require('../../config.json')

const { disassemble } = require('../util/cookie')

let getUserInfo = async (ctx, next) => {
    console.log(ctx)
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    const accessToken = ctx.request.headers['x-access-token']
    if (accessToken) {
        ctx.user = disassemble(accessToken)
        console.log(ctx.user)
    }

    if (!ctx.user || !ctx.user.id) {
        ctx.status = 403
        return
    }

    ctx.user.id = ctx.user.id + ''

    let profile
    if (query.platform) {
        console.log(query.platform)
        console.log({ key: 'User' + query.platform + 'Profile', id: ctx.user.id })
        profile = await Store.user.findOne({ key: 'User' + query.platform + 'Profile', id: ctx.user.id })
    }
    else {
        profile = await Store.user.findOne({ key: 'UserProfile', id: ctx.user.id + '' })
    }
    console.log(profile)
    if (!profile) ctx.body = { code: 0, message: 'User Not Found' }
    else {
        let account = ''
        if (profile.mainInfo) {
            account = profile.mainInfo
        }
        else {
            account = profile.userId
        }
        delete profile.key
        delete profile._id
        if (query.platform) {
            let obj = {}
            obj.code = 0
            profile.platform = query.platform.toLowerCase()
            profile.account = account
            profile.status = 1
            obj.data = [profile]
            ctx.body = obj
        }
        else {
            let obj = {}
            obj.code = 0
            obj.data = profile
            profile.account = account
            ctx.body = obj
        }
    }
}

let getUserInfoPlain = async (ctx, next) => {
    if (!ctx.request.headers.authorization) {
        ctx.status = 403
        return
    }
    else if (ctx.request.headers.authorization.replace(/^Bearer./, '') !== config.apiToken) {
        ctx.status = 403
        return
    }

    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    let profile = await Store.user.findOne({ key: 'User' + query.platform + 'Profile', id: query.userId })
    if (profile) ctx.body = profile
    else ctx.body = false
}

let getUserInfoByPlatformId = async (ctx, next) => {
    if (!ctx.request.headers.authorization) {
        ctx.status = 403
        return
    }
    else if (ctx.request.headers.authorization.replace(/^Bearer./, '') !== config.apiToken) {
        ctx.status = 403
        return
    }
    
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    let platform = query.platform.split('')
    platform[0] = platform[0].toUpperCase()
    platform = platform.join('')

    console.log('User' + platform + 'Profile')

    let profile = {}
    if (platform === "Mastodon") {
        let userFull = query.userId.split('@')
        const userId = userFull[0]
        const domain = userFull[1]
        await Store.user.findOne({ key: 'User' + platform + 'Profile', userId: userId, domain: domain.replace(/(http(s?):\/\/)/gm, '') })
    }
    else await Store.user.findOne({ key: 'User' + platform + 'Profile', userId: query.userId })

    if (profile) ctx.body = profile
    else ctx.body = false
}

let getUnbinding = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    await Store.user.remove({ key: 'User' + query.platform + 'Profile', id: query.userId }, { multi: true })
    ctx.body = {code: 0, message: 'success'}
}

let getUserInfoList = async (ctx, next) => {
    if (!ctx.request.headers.authorization) {
        ctx.status = 403
        return
    }
    else if (ctx.request.headers.authorization.replace(/^Bearer./, '') !== config.apiToken) {
        ctx.status = 403
        return
    }
    
    let platform = ctx.params.platform.split('')
    platform[0] = platform[0].toUpperCase()
    platform = platform.join('')
    Log.debug('User' + platform + 'Profile')
    const res = await Store.user.find({ key: 'User' + platform + 'Profile' })
    ctx.body = res
}

let postUserInfoList = async (ctx, next) => {
    if (!ctx.request.headers.authorization) {
        ctx.status = 403
        return
    }
    else if (ctx.request.headers.authorization.replace(/^Bearer./, '') !== config.apiToken) {
        ctx.status = 403
        return
    }
    
    let platform = ctx.params.platform.split('')
    platform[0] = platform[0].toUpperCase()
    platform = platform.join('')
    Log.debug('User' + platform + 'Profile')
    let listData = []
    if (Array.isArray(ctx.request.body.list)) ctx.request.body.list.forEach(item => listData.push(item))
    else if (typeof(ctx.request.body.list) === 'string') JSON.parse(ctx.request.body.list).forEach(item => listData.push(item))
    const res = await Store.user.find({ key: 'User' + platform + 'Profile' })
    let listRes = []
    listRes = res.filter(i => listData.find(e => parseInt(i.id) === e))
    ctx.body = listRes
}

let getSetAvailable = async (ctx, next) => {
    if (!ctx.request.headers.authorization) {
        ctx.status = 403
        return
    }
    else if (ctx.request.headers.authorization.replace(/^Bearer./, '') !== config.apiToken) {
        ctx.status = 403
        return
    }
    
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
    getUserInfoByPlatformId,
    getUserInfo,
    getUserInfoPlain,
    getUserInfoList,
    postUserInfoList,
    getUnbinding,
    getSetAvailable
}