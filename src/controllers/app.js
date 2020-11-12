// Dependencies
const fs = require('fs')
const path = require('path')

// Local Packages
const Log = require('../util/log')
const Hash = require('../util/hash')
const Store = require('../store/store')

let getAvailableBinding = async (ctx, next) => {
    ctx.body = [
        {
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
    ]
}

module.exports = {
    getAvailableBinding
}