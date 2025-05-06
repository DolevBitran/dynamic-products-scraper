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

        // Execute bulk write
        const bulkWriteResult = await Product.bulkWrite(operations);
        console.log('Bulk write result:', JSON.stringify({
            insertedCount: bulkWriteResult.insertedCount,
            matchedCount: bulkWriteResult.matchedCount,
            modifiedCount: bulkWriteResult.modifiedCount,
            deletedCount: bulkWriteResult.deletedCount,
            upsertedCount: bulkWriteResult.upsertedCount
        }, null, 2));

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

export {
    getProducts,
    InsertAndUpdateProducts
};