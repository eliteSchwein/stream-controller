import {EventSubChannelRedemptionAddEvent} from "@twurple/eventsub-base";
import {logRegular, logWarn} from "../../../../helper/LogHelper";
import {Bot} from "@twurple/easy-bot";
import {EventSubWsListener} from "@twurple/eventsub-ws";
import isShieldActive from "../../../../helper/ShieldHelper";
import {hasModerator} from "../../helper/PermissionHelper";

export default class BaseChannelPoint {
    eventSubWs: EventSubWsListener
    bot: Bot
    title: string

    public constructor(eventSubWs: EventSubWsListener, bot: Bot) {
        this.eventSubWs = eventSubWs
        this.bot = bot
    }

    public async handleChannelPoint(event: EventSubChannelRedemptionAddEvent) {
        if(event.rewardTitle !== this.title) return

        logRegular(`channel point redeemed by ${event.userName}: ${this.title} ${event.input}`)

        await this.handle(event)
    }

    async handle(event: EventSubChannelRedemptionAddEvent) {

    }

    async deny(event: EventSubChannelRedemptionAddEvent, message: string, reason: string) {
        if(event.broadcasterName !== event.userName) {
            await this.bot.whisper(event.userName, message)
        }

        logWarn(`channel point denied because ${reason} for ${event.userName}: ${this.title} ${event.input}`)

        await event.updateStatus('CANCELED')
    }

    public getTitle() {
        return this.title
    }
}