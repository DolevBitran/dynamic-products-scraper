import mongoose, { Schema, model, Document } from 'mongoose';

export enum STATUS {
    ACTIVE = 1,
    INACTIVE = 2,
}

export interface IWebsite {
    name: string;
    url: string;
    status: STATUS;
    description?: string;
    logo?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IWebsiteDocument extends IWebsite, Document {
    // Add any instance methods here if needed
}

const WebsiteSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: Number,
        enum: Object.values(STATUS),
        default: STATUS.ACTIVE,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const Website = model<IWebsiteDocument>('Website', WebsiteSchema, 'Websites');

export default Website;