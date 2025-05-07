import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product, { IProductDocument } from '../models/Product';
import Field from '../models/Field';
import agenda from '../config/agenda';
import { queueProductProcessing } from '../jobs/productJobs';

// Define a type for the operation structure
type BulkOperation = {
    updateOne: {
        filter: { _id: string };
        update: { $set: any };
        upsert: boolean;
    }
};


export const insertDataToDB = async (productsData: IProductDocument[] | undefined, ops?: BulkOperation[]) => {
    if (!ops?.length && !productsData?.length) {
        return null
    }

    const operations = ops || productsData?.map((product: IProductDocument) => ({
        updateOne: {
            filter: { _id: product._id },
            update: { $set: product },
            upsert: true
        }
    }))

    // Execute bulk write
    const bulkWriteResult = await Product.bulkWrite(operations as BulkOperation[]);
    console.log('Bulk write result:', JSON.stringify({
        insertedCount: bulkWriteResult.insertedCount,
        matchedCount: bulkWriteResult.matchedCount,
        modifiedCount: bulkWriteResult.modifiedCount,
        deletedCount: bulkWriteResult.deletedCount,
        upsertedCount: bulkWriteResult.upsertedCount
    }, null, 2));
    return bulkWriteResult;
}


const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products: IProductDocument[] = await Product.find({});
        res.status(200).json({ success: true, count: products.length, products })
    } catch (error: any) {
        console.log({ error })
        res.status(400).json({ error });
    }
}

const InsertAndUpdateProducts = async (req: Request, res: Response): Promise<void> => {
    const { products } = req.body;
    console.log(`Received ${products?.length || 0} products`);

    try {
        if (!products || products.length === 0) {
            res.status(400).json({ error: 'No products provided' });
            return;
        }

        // First, get all fields to identify text fields for matching
        const fields = await Field.find({});
        const textFields = fields
            .filter(field => field.contentType === 'text' && field.scrapeType === 'product')
            .map(field => field.fieldName);

        console.log(`Found ${textFields.length} text fields for product matching:`, textFields);

        if (textFields.length === 0) {
            console.warn('No text fields found for matching products. Using _id only.');
        }

        // Process each product one by one for better control and logging
        const processedProducts = [];
        const operations = [];

        for (const product of products) {
            // Step 1: Try to find an existing product using text fields
            let existingProduct = null;

            if (textFields.length > 0) {
                // Build a query to match on text fields that exist in this product
                const matchQuery: any = { $or: [] };

                for (const fieldName of textFields) {
                    if (product[fieldName] && typeof product[fieldName] === 'string' && product[fieldName].trim() !== '') {
                        matchQuery.$or.push({ [fieldName]: product[fieldName] });
                    }
                }

                if (matchQuery.$or.length > 0) {
                    console.log(`Searching for existing product with query:`, JSON.stringify(matchQuery));
                    existingProduct = await Product.findOne(matchQuery);
                }
            }

            // Step 2: Prepare the product with proper ID
            let productToSave: any;

            if (existingProduct) {
                // Use the existing product's ID
                console.log(`Found existing product with ID: ${existingProduct._id}`);
                productToSave = {
                    ...product,
                    _id: existingProduct._id
                };
            } else {
                // Create a new ID if needed
                let productId;

                if (product._id) {
                    try {
                        // Validate the ID if it exists
                        productId = new mongoose.Types.ObjectId(product._id).toString();
                    } catch (error) {
                        // Create a new ID if invalid
                        productId = new mongoose.Types.ObjectId().toString();
                    }
                } else {
                    // Create a new ID if none exists
                    productId = new mongoose.Types.ObjectId().toString();
                }

                console.log(`Creating new product with ID: ${productId}`);
                productToSave = {
                    ...product,
                    _id: productId
                };
            }

            // Step 3: Add to processed products and create operation
            processedProducts.push(productToSave);

            operations.push({
                updateOne: {
                    filter: { _id: productToSave._id },
                    update: { $set: productToSave },
                    upsert: true
                }
            });
        }

        console.log(`Created ${operations.length} bulk write operations`);

        await insertDataToDB(undefined, operations);

        // Get all product IDs we processed
        const productIds = processedProducts.map(product => product._id);

        // Find the updated products
        const updatedProducts = await Product.find({ _id: { $in: productIds } });
        console.log(`Found ${updatedProducts.length} updated products out of ${productIds.length} processed`);

        // Convert Mongoose documents to plain objects for processing
        const productsToProcess = JSON.parse(JSON.stringify(updatedProducts));

        // Queue products for processing
        try {
            // Queue the job and get the job object
            const job = await queueProductProcessing(productsToProcess);
            console.log('Job queued with ID:', job.attrs._id);

            // Wait for the job to complete and get its result
            await new Promise(resolve => {
                const checkJobStatus = async () => {
                    try {
                        // Get the latest job data
                        const completedJobs = await agenda.jobs({ _id: job.attrs._id });

                        if (completedJobs.length > 0) {
                            const completedJob = completedJobs[0];

                            if (completedJob.attrs.lastFinishedAt) {
                                // Log all job attributes to debug
                                console.log('Job completed. Full job data:', JSON.stringify(completedJob.attrs, null, 2));

                                // Get the result from the job data
                                if (completedJob.attrs.data && completedJob.attrs.data.result) {
                                    console.log('Job result found in data:', completedJob.attrs.data.result);
                                    resolve(completedJob.attrs.data.result);
                                } else {
                                    console.log('No result found in job data');
                                    resolve(null);
                                }
                            } else {
                                console.log('Job still running...');
                                // Check again in 500ms
                                setTimeout(checkJobStatus, 500);
                            }
                        } else {
                            console.log('Job not found, checking again...');
                            // Check again in 500ms
                            setTimeout(checkJobStatus, 500);
                        }
                    } catch (error) {
                        console.error('Error checking job status:', error);
                        resolve(null);
                    }
                };

                // Start checking
                checkJobStatus();
            });

            console.log('Successfully processed products');
        } catch (error) {
            console.error('Error queuing or processing products:', error);
        }

        // Send successful response
        res.status(200).json({
            success: true,
            count: updatedProducts.length,
            updatedProducts
        });
        return;
    } catch (error: any) {
        console.error('Error in InsertAndUpdateProducts:', error);
        res.status(500).json({ error: 'Server Error' });
        return;
    }
}

const DeleteProduct = async (req: Request, res: Response): Promise<void> => {
    const productId = req.params.id;
    console.log('Product ID:', productId);

    try {
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        console.log("Product deleted successfully");
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

const UpdateProduct = async (req: Request, res: Response): Promise<void> => {
    const productId = req.params.id;
    const productData = req.body;

    try {
        // Validate the product data
        if (!productData) {
            res.status(400).json({ success: false, message: 'No product data provided' });
            return;
        }

        // Find and update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: productData },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        // Queue the updated product for processing if needed
        try {
            const productToProcess = JSON.parse(JSON.stringify(updatedProduct));
            await queueProductProcessing([productToProcess]);
            console.log('Product queued for processing after update');
        } catch (error) {
            console.error('Error queuing product for processing:', error);
            // Continue even if processing fails
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error: any) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating product',
            error
        });
    }
};

export {
    getProducts,
    InsertAndUpdateProducts,
    DeleteProduct,
    UpdateProduct
};