import TwitchAuth from "./Auth";
import {getConfig} from "../../helper/ConfigHelper";
import {Bot} from "@twurple/easy-bot";
import registerCommands from "../../commands/TwitchCommands";
import buildCommands from "../../commands/TwitchCommands";

export default class TwitchClient {
    protected auth: TwitchAuth
    protected bot: Bot

    public async connect() {
        this.auth = new TwitchAuth()

        const config = getConfig()['twitch']

        const authProvider = await this.auth.getAuthCode()

        // Step 1: Create a temporary bot instance without commands
        const tempBot = new Bot({ authProvider, channels: config.channels });

        // Step 2: Build commands using the temporary bot instance
        const commands = buildCommands(tempBot);

        // Step 3: Create the final bot instance with the full configuration
        this.bot = new Bot({ authProvider, channels: config.channels, commands });
    }

    public async registerEvents() {

    }

    public getBot() {
        return this.bot
    }
}