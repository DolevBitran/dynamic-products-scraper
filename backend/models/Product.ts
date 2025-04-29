import mongoose, { Schema, model, Document, ObjectId } from 'mongoose';

interface IProduct {
    productId: string;
    title: string;
    sku: string;
}

const ProductSchema = new Schema<IProduct>({
    productId: {
        type: String,
        unique: [true, 'Product already exists in database'],
        required: [true, 'Must provide an productId'],
        // maxlength: [20, 'title can not be more than 20 characters']
    },
    title: {
        type: String,
        required: [true, 'Must provide product title'],
        trim: true,
        // maxlength: [100, 'title can not be more than 100 characters']
    },
    sku: {
        type: String,
        required: [true, 'Must provide product sku'],
        // maxlength: [20, 'title can not be more than 20 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

ProductSchema.virtual('productUrl').get(function (this: IProductDocument) {
    return `https://ksp.co.il/web/item/${this.productId}`;
});

interface IProductBaseDocument extends IProduct, Document {
}

export interface IProductDocument extends IProductBaseDocument {
    productUrl: string;
}

export default model<IProduct>('Product', ProductSchema, 'Products')
export { IProduct }