import {getConfig} from "../../helper/ConfigHelper";
import OBSWebSocket, {EventSubscription, OBSWebSocketError} from "obs-websocket-js";
import {logCustom, logNotice, logRegular, logSuccess, logWarn} from "../../helper/LogHelper";
import {sleep} from "../../../../helper/GeneralHelper";

export class OBSClient {
    obsWebsocket: OBSWebSocket
    connected = false

    public async connect() {
        const config = getConfig(/obs/g)[0]

        this.connected = false

        if(this.obsWebsocket) {
            await this.obsWebsocket.disconnect()
        }

        try {
            this.obsWebsocket = new OBSWebSocket()
            await this.obsWebsocket.connect(`ws://${config.ip}:${config.port}`, config.password, {
                eventSubscriptions: EventSubscription.All
            })
        } catch (error) {
            logWarn('obs connection failed:')
            logWarn(JSON.stringify(error, Object.getOwnPropertyNames(error)))
            logWarn('reconnecting obs in 15 seconds...')

            setTimeout(async () => {
                await this.connect()
            }, 15_000)

            return
        }

        this.registerEvents()

        this.connected = true

        await this.reloadAllBrowserScenes()

        logSuccess('obs client is ready')
    }

    public registerEvents() {
        this.obsWebsocket.on('ConnectionClosed', async (error: OBSWebSocketError) => {
            await this.handleOBSError(error)
        })
        this.obsWebsocket.on('ConnectionError', async (error: OBSWebSocketError) => {
            await this.handleOBSError(error)
        })
    }

    private async handleOBSError(error: OBSWebSocketError) {
        logWarn(`obs disconnect: ${error.code} ${error.message}`)

        if(!this.connected) return

        logWarn('reconnecting obs now...')

        await this.connect()
    }

    public getOBSWebSocket() {
        return this.obsWebsocket
    }

    public async send(method: string, data: any) {
        // @ts-ignore
        await this.obsWebsocket.call(method, data)
    }

    public async getItems() {
        if(!this.connected) return

        logNotice('dump all obs scenes and items:')

        const {scenes} = await this.obsWebsocket.call('GetSceneList')

        for(const scene of scenes) {
            // @ts-ignore
            const {sceneItems} = await this.obsWebsocket.call('GetSceneItemList', {sceneUuid: scene.sceneUuid})
            logCustom(`items for scene ${scene.sceneName}[${scene.sceneIndex}]:`.cyan)

            for(const sceneItem of sceneItems) {
                logCustom(`${sceneItem.sourceName}[${sceneItem.sceneItemId}]`.blue)
            }
        }

        logNotice('end of obs dump')
    }

    public async reloadAllBrowserScenes() {
        if(!this.connected) return
        logRegular('reload all browser scenes')

        const {inputs} = await this.obsWebsocket.call('GetInputList', {inputKind: 'browser_source'})

        for (const input of inputs) {
            await this.obsWebsocket.call('PressInputPropertiesButton', {
                inputUuid: input.inputUuid as string,
                propertyName: 'refreshnocache'
            })
        }
    }
}