import BaseCommand from "./BaseCommand";
import {BotCommandContext} from "@twurple/easy-bot";
import {calculateTTSduration} from "../../../helper/TTShelper";
import {addAlert} from "../../../helper/AlertHelper";
import {v4 as uuidv4} from "uuid";
import {isThrottled} from "../../../helper/ThrottleHelper";

export default class TTSCommand extends BaseCommand {
    command = 'tts'
    enforceSame = true
    requiresMod = true
    params = [
        {
            name: 'text',
            type: 'all'
        },
    ]

    async handle(params: any, context: BotCommandContext) {
        if(isThrottled()) {
            await context.reply('Das Bot System ist gerade überlastet und kann TTS nicht verarbeiten!')
            return
        }
        const message = `${context.userName} sagt ${params.text}`
        addAlert({
            'dummy': true,
            'duration': calculateTTSduration(message),
            'icon': '',
            'message': message,
            'event-uuid': `Nachricht vorlesen CMD_${uuidv4()}`,
            'speak': true
        })
    }
}