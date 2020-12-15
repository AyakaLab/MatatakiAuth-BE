// Dependecies
const axios = require('axios').default
let Compo = require('../../plugins')

// Local Packages
const Log = require('../../src/util/log')
const Hash = require('../../src/util/hash')
const Store = require('../../src/store/store')

// Plugin Method
// Inner

exports.endpoints = {
    main: async () => {

    }
}

// Register

exports.register = {
    endpoints: [
        {
            function: 'main',
            endpoint: '/oauth',
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