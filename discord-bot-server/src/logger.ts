import winston, { Logger } from 'winston';
import chalk from 'chalk';
import moment from 'moment'
export default function getLogger(clazz:string):Logger{

    return winston.createLogger({
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: `log-${moment().format('MM.DD.YY_hh-mm-ss')}.log`,
                dirname:  `./logs`
            }),
        ],
        format: winston.format.printf(log => {
            const level = log.level;
            const sourceString = `[${clazz} - ${level.toUpperCase()}]`
            const messageString = ` - ${log.message}`;
            switch(level.toLowerCase()){
                case 'error':
                    return chalk.red(sourceString)+messageString;
                case 'debug':
                    return chalk.yellow(sourceString)+messageString;
                default:
                    return chalk.green(sourceString)+messageString;
            }
        }),
    });
}