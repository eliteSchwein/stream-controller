import parseConfig from "js-conf-parser";

let config = {}

export default function readConfig() {
    config = parseConfig(`${__dirname}/../..`, ".env.conf")
}

export function getConfig(filter: RegExp|undefined = undefined, asObject = false) {
    if(!filter) return config

    const result: any = []

    for (const key in config) {
        if(!key.match(filter)) {
            continue
        }

        if(asObject) {
            const realKey = key.replace(filter, '')
            result[realKey] = config[key]
        } else {
            result.push(config[key])
        }
    }

    return result
}

export function getAssetConfig(asset: string) {
    const assetData = getConfig(/asset /g, true)[asset]

    let video = undefined

    if(assetData.video) {
        video = assetData.video[Math.floor((Math.random()*assetData.video.length))]
    }

    assetData.video = video

    return assetData
}