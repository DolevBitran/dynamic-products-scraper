import mongoose, { Schema, model, Document } from 'mongoose';

interface IProduct {
}

const ProductSchema = new Schema<IProduct>({
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