import {logRegular} from "./LogHelper";
import getWebsocketServer from "../App";
import {getConfig} from "./ConfigHelper";
import {Websocket} from "websocket-ts";
import {setLedColor} from "./WledHelper";
import {getGameInfoData} from "../clients/website/WebsiteClient";
import {getRandomInt} from "../../../helper/GeneralHelper";

const gameInfo = {
    data: {},
    manual: ''
}

let currentGameId = 0

export default function getGameInfo() {
    const config = getConfig(/theme/g)[0]
    const clonedGameInfo = structuredClone(gameInfo)

    if(clonedGameInfo.manual !== '') {
        clonedGameInfo.data['color'] = '#'+clonedGameInfo.manual
    }

    if(clonedGameInfo.data['color'] === '') {
        clonedGameInfo.data['color'] = '#'+config.default_color
    }

    return clonedGameInfo
}

export function getCurrentGameId() {
    return currentGameId
}

export async function fetchGameInfo() {
    logRegular('fetch theme from website')
    gameInfo.data = await getGameInfoData()
    currentGameId = gameInfo.data.game_id
}

export function pushGameInfo(websocket: Websocket|undefined = undefined) {
    const gameInfo = getGameInfo()
    if(websocket) {
        websocket.send(JSON.stringify({jsonrpc: "2.0", method: 'notify_game_update', params: gameInfo, id: getRandomInt(10_000)}))
        return
    }
    getWebsocketServer().send('notify_game_update', gameInfo)
}

export function setManualColor(value: string|undefined = undefined) {
    if(value) {
        logRegular(`set manual theme color: ${value}`);
        gameInfo.manual = value
        return
    }

    logRegular('reset manual theme color');
    gameInfo.manual = ''
    void setLedColor()
}