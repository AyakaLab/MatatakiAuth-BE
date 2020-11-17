const KoaRouter = require('koa-router')
const Plugins = require('../../plugins')

const pluginRouter = new KoaRouter()

const Plugs = Plugins.Plugin

for (let i = 0; i < Plugs.endpoint.length; i++) {
    const item = Plugs.endpoint[i]
    const prefix = item.meta.displayName.toLowerCase()
    switch (item.method) {
        case 'GET':
            pluginRouter.get(prefix + item.endpoint, item.instance)
            break
        case 'POST':
            pluginRouter.post(prefix + item.endpoint, item.instance)
            break
        case 'DELETE':
            pluginRouter.delete(prefix + item.endpoint, item.instance)
            break
        case 'PUT':
            pluginRouter.put(prefix + item.endpoint, item.instance)
            break
        case 'OPTIONS':
            pluginRouter.options(prefix + item.endpoint, item.instance)
            break
    }
}

let pluginRouterCreation = {
    main () {
        this.emit('moduleReady', undefined, pluginRouter)
    },
    events: new Map(),
    on(event, callback) {
        this.events.set(event, callback)
    },
    emit(event, err, data) {
        this.events.get(event).call(this, err, data)
    }
}

module.exports = pluginRouterCreation

