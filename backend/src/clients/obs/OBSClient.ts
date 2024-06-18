import {getConfig} from "../../helper/ConfigHelper";
import OBSWebSocket, {EventSubscription} from "obs-websocket-js";
import {logRegular} from "../../helper/LogHelper";

export class OBSClient {
    obsWebsocket: OBSWebSocket

    public async connect() {
        const config = getConfig(/obs/g)[0]

        this.obsWebsocket = new OBSWebSocket()
        await this.obsWebsocket.connect(`ws://${config.ip}:${config.port}`, config.password, {
            eventSubscriptions: EventSubscription.All
        })
    }

    public registerEvents() {

    }

    public getOBSWebSocket() {
        return this.obsWebsocket
    }

    public async reloadAllBrowserScenes() {
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