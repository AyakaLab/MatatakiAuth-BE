// Dependencies

let fs = require('fs')
let path = require('path')

// Local Files
let Log = require('./src/util/log')
let config = require('./config.json')
let Plugin = { endpoint: [], binding: [] }

// Body

let componentDir = path.join(__dirname, "/plugins/")

let Register = {
    load(extensionDir = componentDir) {
        try {
            // Read all folders inside the Components folder
            if (!fs.existsSync(extensionDir)) {
                Log.warning('没有加载部分组件')
                Log.warning('如果有安装组件，请检查 node_modules 文件夹是否存在于根目录下')
                return Plugin
            }

            let files = fs.readdirSync(extensionDir)
            let scopedFiles = files
            scopedFiles.forEach(value => {
                if (fs.statSync(path.join(extensionDir, value)).isDirectory()) {
                    files = fs.readdirSync(extensionDir)
                }
            })
            // Iterial all folders to find the config.json under it
            files.forEach(value => {
                let folder = path.join(extensionDir, value)
                let stats = fs.statSync(folder)

                if (stats.isDirectory()) {
                    // Get package info
                    if (!fs.existsSync(path.resolve(folder + "/package.json"))) {
                        Log.warning("No package.json file found in folder name" + ` "${value}",` + " consider ignoring this folder")
                        return
                    }

                    delete require.cache[require.resolve(folder + "/package.json")]
                    let compoPackageInfo = require(folder + "/package.json")
                    let compoEntry = compoPackageInfo.main

                    // Preinit
                    let compoVersion = compoPackageInfo.version
                    let compoMetadataInfo
                    if (!fs.existsSync(path.resolve(folder + "/metadata.json"))) {
                        Log.warning("No valid metadata.json found in component" + ` "${value}" ` + ", all names and alias will be processed as default value")
                        Log.warning("If you are the developer of this component, you should consider add a metadata.json file for better context control.")

                        compoName = compoPackageInfo.name
                        compoDisplayName = compoPackageInfo.name
                        compoDescription = compoPackageInfo.description
                        compoGroup = compoPackageInfo.author
                    }
                    else {
                        delete require.cache[require.resolve(folder + "/metadata.json")]
                        compoMetadataInfo = require(folder + "/metadata.json")

                        compoName = compoPackageInfo.name
                        compoDescription = compoMetadataInfo.description
                        compoDisplayName = compoMetadataInfo.displayName
                        compoGroup = compoMetadataInfo.groupName
                    }

                    // Get index
                    let compoPath = extensionDir + value + "/" + compoEntry

                    try {
                        if (fs.statSync(compoPath)) {
                            delete require.cache[require.resolve(compoPath)]
                            let plugin = require(compoPath)

                            // Check if register endpoints exist
                            if (plugin.register.endpoints) {
                                plugin.register.endpoints.map(end => {
                                    if (end.function !== undefined) {
                                        end.instance = plugin.endpoints[end.function]
                                        end.endpoint = end.endpoint
                                        end.method = end.method
                                        end.meta = compoMetadataInfo
                                        Plugin.endpoint.push(end)
                                    }
                                })
                            }

                            // Check if register binding exist
                            if (plugin.register.bindings) {
                                plugin.register.bindings.map(bid => {
                                    if (bid.json !== undefined) {
                                        bid.binding = bid.json
                                        bid.meta = compoMetadataInfo
                                        Plugin.binding.push(bid)
                                    }
                                })
                            }

                            Log.debug(`已挂载组件 ${value}\x1b[34m@${compoVersion}\x1b[0m 来自 \x1b[33m${value}\x1b[0m`)
                        }
                    }
                    catch (error) {
                        Log.fatal(error)
                    }
                }
            })
            return Plugin
        }
        catch (error) {
            Log.fatal(error)
        }
    }
}

let Interface = {
    Log
}

// Exports

exports.Plugin = Plugin
exports.Interface = Interface
exports.Register = Register