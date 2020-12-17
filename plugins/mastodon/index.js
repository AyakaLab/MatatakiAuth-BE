// Dependecies
const axios = require('axios').default
const crypto = require('crypto')
let Compo = require('../../plugins')

// Local Packages
const Log = require('../../src/util/log')
const Hash = require('../../src/util/hash')
const Store = require('../../src/store/store')
const { disassemble } = require('../../src/util/cookie')

const passcode = require('../../encrypt.json')

const algorithm = 'aes-256-ctr'

const key = passcode.code
let iv = passcode.iv

function encryptText (text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return encrypted.toString('hex')
}

function decryptText (text) {
  iv = Buffer.from(iv)
  const encryptedText = Buffer.from(text, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

const timeoutIds = new Map()

// Plugin Method
// Inner

exports.endpoints = {
    getToken: async (ctx) => {
        if (!ctx.request.headers.authorization) {
            ctx.status = 403
        }

        const authTokenRaw = ctx.request.headers.authorization
        const authToken = authTokenRaw.replace(/^Bearer./, '')

        if (!authTokenRaw.includes('Bearer')) {
            ctx.status = 403
            return
        }

        const res = disassemble(authToken)
        const oauthKeyExist = await Store.main.find({ key: 'MastodonOAuthKey', id: res.id })
        
        if (oauthKeyExist) await Store.main.remove({ key: 'MastodonOAuthKey', id: res.id }, {})

        const timestamp = (new Date()).getTime()
        const oauthKey = encryptText(res.id + "" + timestamp)
        const oauthKeyUUID = Hash.md5(res.id + "" + timestamp)

        await Store.main.insert({ key: 'MastodonOAuthKey', id: res.id, token: oauthKey, uuid: oauthKeyUUID, timestamp: timestamp })

        const id = setTimeout(() => {
            Store.main.remove({ key: 'MastodonOAuthKey', id: res.id }, {})
        }, 6000)

        timeoutIds.set(res.id + "", id)

        const oauth = await Store.main.findOne({ key: 'MastodonOAuthKey', id: res.id, token: oauthKey, uuid: oauthKeyUUID })
        console.log(oauth)
        ctx.body = {
            code: 0,
            token: oauth.token
        }
    },
    getUpdate: async (ctx) => {
        let query = ctx.request.query
        query = JSON.parse(JSON.stringify(query))

        if (!ctx.request.headers.authorization) {
            ctx.status = 403
        }

        const oauthTokenRaw = ctx.request.headers.authorization
        const oauthToken = oauthTokenRaw.replace(/^Bearer./, '')

        if (!oauthTokenRaw.includes('Bearer')) {
            ctx.status = 403
            return
        }

        const res = await Store.main.findOne({ key: 'MastodonOAuthKey', id: parseInt(query.id) })
        if (res) {
            clearTimeout(timeoutIds.get(query.id + ""))
            timeoutIds.delete(query.id + "")
            await Store.main.remove({ key: 'MastodonOAuthKey', id: parseInt(query.id) }, {})
        }

        if (!(query.id && query.userId && query.domain && query.username)) {
            ctx.body = {
                code: 2,
                message: "missing fields"
            }
            return
        }
        
        if (Hash.md5(decryptText(oauthToken)) === res.uuid) {
            const userExist = await Store.user.findOne({ key: "UserMastodonProfile", id: query.id })
            if (userExist) {
                await Store.user.update({ key: "UserMastodonProfile", id: query.id }, { $set: { userId: query.userId }}, {})
                await Store.user.update({ key: "UserMastodonProfile", id: query.id }, { $set: { domain: query.domain }}, {})
                await Store.user.update({ key: "UserMastodonProfile", id: query.id }, { $set: { username: query.username} }, {})
            }
            else {
                await Store.user.insert({ key: "UserMastodonProfile", id: query.id, userId: query.userId, domain: query.domain, username: query.username })
            }
            const user = await Store.user.findOne({ key: "UserMastodonProfile", id: query.id })
            if (user) {
                ctx.body = {
                    code: 0,
                    message: "success"
                }
            }
            else {
                ctx.body = {
                    code: 1,
                    message: "failed"
                }
            }
        }
        else {
            ctx.status = 403
        }
    }
}

// Register

exports.register = {
    endpoints: [
        {
            function: 'getToken',
            endpoint: '/oauth/token',
            method: 'GET'
        },
        {
            function: 'getUpdate',
            endpoint: '/oauth/update',
            method: 'GET'
        }
    ],
    bindings: [
        {
            json: {
                type: 'mastodon',
                icon: '/image/mastodon.png',
                color: '#4888CE',
                typename: 'Mastodon',
                username: '', // 最好后端混淆后返回
                status: false,
                loading: false,
                is_main: 0,
                disabled: false
            }
        }
    ]
}