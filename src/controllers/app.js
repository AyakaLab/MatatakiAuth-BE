// Dependencies

// Local Packages

const Plugins = require('../../plugins')

let getAvailableBinding = async (ctx, next) => {
    let resArray = Plugins.Plugin.binding.map(item => item.json)
    ctx.body = resArray
}

module.exports = {
    getAvailableBinding
}