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
            await Store.main.insert({ key: 'BilibiliLoginStatus', id: id, status: 'No status', message: 'No message', data: 'No data' })
            const oauthKeyQuery = await Store.main.findOne({ key: 'BilibiliQrOauthKey', id: id })
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
                await Store.main.remove({ key: 'BilibiliQrOauthKey', id: id }, {})
                return
            }
            const res = await axios(config)
            Log.trace(res.data)
            if (res.data.data === -1) {
                this.clear(id)
            }
            if (res.data.data === -2) {
                this.clear(id)
            }
            if (res.data.status) {
                this.clear(id)
                this.emit('loggedIn', null, res.data.data)
                await Store.main.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { status: res.data.status } }, {})
                await Store.main.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { message: 'Login Success' } }, {})
                await Store.main.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { data: res.data.data } }, {})
            }
            else {
                await Store.main.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { status: res.data.status } }, {})
                await Store.main.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { message: res.data.message } }, {})
                await Store.main.update({ key: 'BilibiliLoginStatus', id: id }, { $set: { data: res.data.data } }, {})
            }
        }, 3000)

        this.intervalIds.set(id, intervalId)
    },
    clear(id) {
        clearInterval(this.intervalIds.get(id))
    },
    on(functionName, callback) {
        Log.info(callback)
        this.functions.set(functionName, callback)
    },
    emit(functionName, err, data) {
        console.log(this.functions.get(functionName).call)
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
    
        await Store.main.insert({ key: 'BilibiliQrOauthKey', id: hashRes, oauthKey: res.data.data.oauthKey, create_time: new Date() })
    
        // Clear oauth validation after 2 min
        setTimeout(async () => {
            await Store.main.remove({ key: 'BilibiliQrOauthKey', id: hashRes }, {})
            const res = await Store.main.findOne({ key: 'BilibiliQrOauthKey', id: hashRes })
            Log.debug('res: ' + JSON.stringify(res))
        }, 120000)
    
        QrCheck.create(hashRes)
        QrCheck.on('loggedIn', async (err, data) => {
            if (err) {
                Log.fatal(err)
            }
            else {
                Log.debug(data)
                await Store.main.remove({ key: 'BilibiliQrOauthKey', id: hashRes }, {})
                await Store.main.insert({ key: 'BilibiliLoginCookies', data: data, id: hashRes })
            }
        })
    
        await next()
    },
    async getLoginStatus (ctx, next) {
        let query = ctx.request.query
        query = JSON.parse(JSON.stringify(query))
        
        let res = await Store.main.findOne({ key: 'BilibiliLoginCookies', id: query.id })
        if (res) {
            ctx.body = { code: 0, data: res }
            await next()
            return
        }
        res = await Store.main.findOne({ key: 'BilibiliQrOauthKey', id: query.id })
        if (!res) {
            ctx.body = { code: -10, message: '请求已过期，请重新申请' }
            return
        }
        res = await Store.main.findOne({ key: 'BilibiliLoginStatus', id: query.id })
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