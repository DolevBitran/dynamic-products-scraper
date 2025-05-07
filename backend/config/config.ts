import dotenv from 'dotenv';

dotenv.config();

interface Config {
    PORT: number;
    NODE_ENV: string;
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_LIFETIME: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_LIFETIME: string;
}

const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || 'jwt_secret_key_change_in_production',
    JWT_LIFETIME: process.env.JWT_LIFETIME || '15m',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_key_change_in_production',
    JWT_REFRESH_LIFETIME: process.env.JWT_REFRESH_LIFETIME || '7d',
};

export default config;