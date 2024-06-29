import BaseChannelPoint from "./BaseChannelPoint";
import {EventSubChannelRedemptionAddEvent} from "@twurple/eventsub-base";
import {getAssetConfig, getConfig} from "../../../../helper/ConfigHelper";
import getWebsocketServer from "../../../../App";
import {sleep} from "../../../../../../helper/GeneralHelper";
import {addAlert} from "../../../../helper/AlertHelper";

export default class BoostChannelPoint extends BaseChannelPoint {
    title = 'Boost'

    async handle(event: EventSubChannelRedemptionAddEvent) {
        const shipDiagnosticsConfig = getConfig(/api ship_diagnostics/g)[0]

        const websocketServer = getWebsocketServer()

        //websocketServer.send('trigger_keyboard', {'name': 'ship', 'keys': ['a']})

        const shipApiData = await (await fetch(shipDiagnosticsConfig.url)).json()

        if(!shipApiData.in_ship) {
            await this.deny(event, "Deine Kanalpunkte wurden dir zurück gegeben weil ich aktuell nicht in ein Schiff bin.", "not_in_ship")
            return
        }

        if(shipApiData.ship_docked) {
            await this.deny(event, "Deine Kanalpunkte wurden dir zurück gegeben weil das Schiff angedockt ist.", "ship_docked")
            return
        }

        const theme = getAssetConfig('boost')

        if(shipApiData.in_supercruise) {
            if(shipApiData.low_fuel) {
                await this.deny(event, "Deine Kanalpunkte wurden dir zurück gegeben weil das Schiff zu wenig Treibstoff hat.", "low_fuel")
                return
            }

            addAlert({
                'sound': theme.sound,
                'duration': 15,
                'color': theme.color,
                'icon': theme.icon,
                'message': `OVERCHARGE`,
                'event-uuid': this.title,
                'video': theme.video
            })

            websocketServer.send('trigger_keyboard', {'name': 'ship', 'keys': ['tab']})

            await sleep(15_000)

            websocketServer.send('trigger_keyboard', {'name': 'ship', 'keys': ['tab']})
            
            return
        }

        addAlert({
            'sound': theme.sound,
            'duration': 5,
            'color': theme.color,
            'icon': theme.icon,
            'message': `BOOOST`,
            'event-uuid': this.title,
            'video': theme.video
        })

        if(shipApiData.gear_down) websocketServer.send('trigger_keyboard', {'name': 'ship', 'keys': ['l']})
        if(shipApiData.scoop_deployed) websocketServer.send('trigger_keyboard', {'name': 'ship', 'keys': ['home']})

        await sleep(100)

        websocketServer.send('trigger_keyboard', {'name': 'ship', 'keys': ['tab']})

        await sleep(100)

        if(shipApiData.gear_down) websocketServer.send('trigger_keyboard', {'name': 'ship', 'keys': ['l']})
        if(shipApiData.scoop_deployed) websocketServer.send('trigger_keyboard', {'name': 'ship', 'keys': ['home']})
    }
}