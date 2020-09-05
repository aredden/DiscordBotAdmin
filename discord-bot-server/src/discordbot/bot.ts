/** @format */

import { Client } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();
export class DiscordBot {
	private token = process.env.DISCORD_TOKEN;
	public client: Client = new Client();

	public login = () => {
		this.client.login(this.token).then((_succeed: string) => {
			this.client = this.client.setMaxListeners(30);
		});
	};
}
