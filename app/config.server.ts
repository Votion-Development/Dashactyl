import dotenv from 'dotenv';

interface Config {
    key: string | undefined;
}

const env = dotenv.config().parsed;

export default <Config>{
    key: env?.DASH_APP_KEY
}
