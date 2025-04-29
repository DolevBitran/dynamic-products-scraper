import dotenv from 'dotenv';

dotenv.config();

interface Config {
    PORT: number;
    NODE_ENV: string;
    MONGO_URI: string;
}

const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI || '',
};

export default config;