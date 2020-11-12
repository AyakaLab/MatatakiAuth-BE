// Dependencies
const fs = require('fs')

let getImage = async (ctx, next) => {
    let query = ctx.params
    query = JSON.parse(JSON.stringify(query))

    ctx.type = 'image/png'
    ctx.body = fs.createReadStream('./assets/img/' + ctx.params.imgName)
    await next()
}

module.exports = getImage