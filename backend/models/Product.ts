import mongoose, { Schema, model, Document, Types } from 'mongoose';

interface IProduct {
    websites?: Types.ObjectId[];
}

const ProductSchema = new Schema<IProduct>({
    websites: [{
        type: Schema.Types.ObjectId,
        ref: 'Website',
        required: true,
    }],
}, {
    timestamps: true,
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

interface IProductBaseDocument extends IProduct, Document {
}

export interface IProductDocument extends IProductBaseDocument {
    _id: {
        type: Schema.Types.ObjectId,
        auto: true, // Auto-generate the ObjectId field
    }
}

export default model<IProduct>('Product', ProductSchema, 'Products')
export { IProduct }