import { Request, Response } from 'express';
import Product, { IProduct, IProductDocument } from '../models/Product';


const getProducts = async (req: Request, res: Response) => {
    try {
        const products: IProductDocument[] = await Product.find({});
        res.status(200).json({ success: true, count: products.length, products })
    } catch (error: any) {
        console.log({ error })
        res.status(400).json({ error });
    }
}

const InsertAndUpdateProducts = async (req: Request, res: Response) => {
    const { products } = req.body

    try {
        const operations = products.map((product: IProduct) => ({
            updateOne: {
                filter: { productId: product.productId },
                update: { $set: product },
                upsert: true,
            }
        }));

        await Product.bulkWrite(operations);
        const updatedProducts = await Product.find({
            productId: { $in: products.map((p: IProduct) => p.productId) }
        });

        res.status(200).json({ success: true, updatedProducts })
    } catch (error: any) {
        res.status(500).json({ error: 'Server Error' });
    }
}

export {
    getProducts,
    InsertAndUpdateProducts
};