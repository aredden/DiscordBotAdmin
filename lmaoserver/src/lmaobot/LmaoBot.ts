import { Client } from 'discord.js';
import dotenv from 'dotenv'

dotenv.config()
export class LmaoBot{
    private token= process.env.DISCORD_TOKEN;
    public client:Client = new Client();

    public login = () =>{
        this.client.login(this.token);
    }
}