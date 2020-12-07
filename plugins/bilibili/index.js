// Dependecies
const qs = require('qs')
const axios = require('axios').default
let Compo = require('../../plugins')

// Local Packages
const Log = require('../../src/util/log')
const Hash = require('../../src/util/hash')
const Store = require('../../src/store/store')

// Plugin Method
// Inner

let QrCheck = {
    intervalIds: new Map(),
    functions: new Map(),
    time1: null,
    time2: null,
    create(id) {
        this.time1 = new Date()
        intervalId = setInterval(async () => {
            await Store.fresh.insert({ key: 'BilibiliLoginStatus', id: id, status: 'No status', message: 'No message', data: 'No data' })
            const oauthKeyQuery = await Store.fresh.findOne({ key: 'BilibiliQrOauthKey', id: id })
            const oauthKey = oauthKeyQuery.oauthKey
            const data = qs.stringify({ 'oauthKey': oauthKey })
            const config = {
                method: 'post',
                url: 'http://passport.bilibili.com/qrcode/getLoginInfo',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            }
            this.time2 = new Date()
            const result = this.time2.getTime() - this.time1.getTime()
            if (result > 60000) {
                this.clear(id)
                await Store.fresh.remove({ key: 'BilibiliQrOauthKey', id: id }, {})
                return
            }
            const res = await axios(config)
            if (res.data.data === -1) {
                this.clear(id)
            }
            if (res.data.data === -2) {
                this.clear(id)
            }
            if (res.data.status) {
                this.clear(id)
                this.emit('loggedIn', null, res)
                await Store.fresh.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { status: res.data.status } }, {})
                await Store.fresh.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { message: 'Login Success' } }, {})
                await Store.fresh.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { data: res.data.data } }, {})
            }
            else {
                await Store.fresh.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { status: res.data.status } }, {})
                await Store.fresh.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { message: res.data.message } }, {})
                await Store.fresh.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { data: res.data.data } }, {})
            }
        }, 3000)

        this.intervalIds.set(id, intervalId)
    },
    clear(id) {
        clearInterval(this.intervalIds.get(id))
    },
    on(functionName, callback) {
        this.functions.set(functionName, callback)
    },
    emit(functionName, err, data) {
        this.functions.get(functionName).call(this, err, data)
    }
}

exports.endpoints = {
    async getQrloginUrl (ctx, next) {
        const res = await axios.get('http://passport.bilibili.com/qrcode/getLoginUrl')
    
        if (res.data.code != 0) {
            ctx.body = { code: -1, message: '请求失败' }
        }
    
        // Create Oauth Key
        let hashRes = Hash.sha256(new Date())
        hashRes = hashRes.substring(0, 8)
    
        ctx.body = { url: res.data.data.url, oauthKey: res.data.data.oauthKey, hashId: hashRes }
        console.log({ url: res.data.data.url, oauthKey: res.data.data.oauthKey, hashId: hashRes })
    
        await Store.fresh.insert({ key: 'BilibiliQrOauthKey', id: hashRes, oauthKey: res.data.data.oauthKey, create_time: new Date() })
    
        // Clear oauth validation after 2 min
        setTimeout(async () => {
            await Store.fresh.remove({ key: 'BilibiliQrOauthKey', id: hashRes }, {})
            const res = await Store.fresh.findOne({ key: 'BilibiliQrOauthKey', id: hashRes })
            Log.debug('res: ' + JSON.stringify(res))
        }, 120000)
    
        QrCheck.create(hashRes)
        QrCheck.on('loggedIn', async (err, data) => {
            if (err) {
                Log.fatal(err)
            }
            else {
                await Store.fresh.remove({ key: 'BilibiliQrOauthKey', id: hashRes }, {})
                let date = data.headers['set-cookie']
                let expires = {}
                date.forEach(item => {
                    let pairName = item.replace(/=.*$/, '')
                    let arr = item.split('; ')
                    arr.forEach(e => {
                        if (e.includes('Expires')) {
                            let pair = e.split('=')
                            Object.defineProperty(expires, pairName, {
                                value: pair[1],
                                writable: true,
                                enumerable: true
                            })
                        }
                    })
                })
                await Store.fresh.insert({ key: 'BilibiliLoginCookies', data: data.data.data, expires: expires, id: hashRes })
            }
        })
    
        await next()
    },
    async getLoginStatus (ctx, next) {
        let query = ctx.request.query
        query = JSON.parse(JSON.stringify(query))
        
        let res = await Store.fresh.findOne({ key: 'BilibiliLoginCookies', id: query.id })
        if (res) {
            ctx.body = { code: 0, data: res }

            // Process Data
            let urlData = res.data.url.replace(/^https?.*\/.*\?/gi, '')
            urlData = urlData.split('&')
            let data = {}
            urlData.forEach(item => {
                const pair = item.split('=')
                Object.defineProperty(data, pair[0], {
                    value: pair[1],
                    writable: true,
                    enumerable: true
                })
            })

            // Apply to Database
            const bilibiliUser = await Store.user.findOne({ key: 'UserBilibiliProfile', id: query.userId })
            if (!bilibiliUser) {
                Log.info('Creating Bilibili Profile for id ' + query.userId)
                await Store.user.insert({ 
                    key: 'UserBilibiliProfile', 
                    id: query.userId, 
                    userId: data.DedeUserID, 
                    dedeUserID: data.DedeUserID,
                    dedeUserIDckMd5: data['DedeUserID__ckMd5'], 
                    expires: res.expires,
                    SESSDATA: data.SESSDATA,
                    biliJct: data['bili_jct'],
                    available: true
                })
            }
            else {
                Log.info('Updating Bilibili Profile for id ' + query.userId)
                await Store.user.update({ key: 'UserBilibiliProfile', id: query.userId }, { $set: { userId: data.DedeUserID } }, {})
                await Store.user.update({ key: 'UserBilibiliProfile', id: query.userId }, { $set: { dedeUserID: data.DedeUserID } }, {})
                await Store.user.update({ key: 'UserBilibiliProfile', id: query.userId }, { $set: { dedeUserIDckMd5: data['DedeUserID__ckMd5'] } }, {})
                await Store.user.update({ key: 'UserBilibiliProfile', id: query.userId }, { $set: { expires: res.expires } }, {})
                await Store.user.update({ key: 'UserBilibiliProfile', id: query.userId }, { $set: { SESSDATA: data.SESSDATA } }, {})
                await Store.user.update({ key: 'UserBilibiliProfile', id: query.userId }, { $set: { biliJct: data['bili_jct'] } }, {})
            }

            await next()
            return
        }
        res = await Store.fresh.findOne({ key: 'BilibiliQrOauthKey', id: query.id })
        if (!res) {
            ctx.body = { code: -10, message: '请求已过期，请重新申请' }
            return
        }
        res = await Store.fresh.findOne({ key: 'BilibiliLoginStatus', id: query.id })
        if (!res.status) {
            ctx.body = { code: res.data, message: res.message, data: res.data }
        }
        else {
            ctx.body = { code: 1, message: res.message, data: res.data }
        }
        await next()
    }
}

// Register

exports.register = {
    endpoints: [
        {
            function: 'getQrloginUrl',
            endpoint: '/qrcodeUrl',
            method: 'GET'
        },
        {
            function: 'getLoginStatus',
            endpoint: '/loginStatus',
            method: 'GET'
        }
    ],
    bindings: [
        {
            json: {
                type: 'bilibili',
                icon: '/image/bilibili.png',
                color: '#59C2DF',
                typename: 'Bilibili',
                username: '', // 最好后端混淆后返回
                status: false,
                loading: false,
                is_main: 0,
                disabled: false
            }
        }
    ]
}