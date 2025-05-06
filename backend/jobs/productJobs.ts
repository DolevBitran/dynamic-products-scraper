import agenda, { JOB_TYPES } from '../config/agenda';
import { fieldsData } from '../controllers/fieldsController';
import { insertDataToDB } from '../controllers/productsController';
import { ScrapeType } from '../models/Field';
import Product, { IProductDocument } from '../models/Product';
import * as cheerio from 'cheerio';


const findElement = (selectors: string[], elementScope: ReturnType<typeof cheerio.load>): ReturnType<typeof elementScope> | null => {
  for (const selector of selectors) {
    try {
      const element = elementScope(selector);
      if (element.length > 0) {
        return element;
      }
    } catch (error) {
      console.log(error)
    }
  }
  return null;
};

const scrapeProductPage = async (p: { link: string }) => {
  const productPage = await fetch(p.link)
  const body = await productPage.text();
  const documentBody = cheerio.load(body);

  const scrapedFields = fieldsData
    .filter(field => field.scrapeType === ScrapeType.PRODUCT)
    .map(field => {
      const fieldSelectors = field.selector.split(',')
      try {
        const fieldEl = findElement(fieldSelectors, documentBody)
        const contentMap: { [key: string]: string | null | undefined } = {
          text: fieldEl?.text(),
          image: fieldEl?.attr('src') || fieldEl?.css('background-image')?.match(/url\(["']?(.*?)["']?\)/)?.[1],
          link: fieldEl?.attr('href'),
        };
        return { [field.fieldName]: contentMap[field.fieldName] || contentMap['text'] }
      } catch (error) {
        console.error(error)
        return { [field.fieldName]: undefined }
      }
    })
  return Object.assign(p, ...scrapedFields)
}

// Define the job processor for handling product data
export const defineJobs = () => {
  console.log('DEFINE_JOBS: Registering job processors...');
  console.log('DEFINE_JOBS: Agenda instance:', agenda ? 'Available' : 'Not available');

  // Process products job processor function
  const processProductsJob = async (job: any) => {
    console.log('JOB_PROCESSOR: Job processor function called');
    try {
      const { products } = job.attrs.data;

      // For now, just log the products that were saved
      console.log('Processing products job started');
      console.log(`Received ${products.length} products to process`);

      // Map product links for return value
      const productsData = products.map(scrapeProductPage);


      // Store the result in the job data
      job.attrs.data.result = await Promise.all(productsData);
      await job.save();
    } catch (error) {
      console.error('Error processing products job:', error);
      throw error;
    }
  };

  // Scrape all existing products job processor function
  const scrapeCollectionJob = async (job: any) => {
    console.log('SCRAPE_COLLECTION: Starting job to scrape all products');
    try {
      // Import the Product model directly to avoid circular dependencies
      const Product = (await import('../models/Product')).default;

      // Get all products from the database
      const products = await Product.find({}).lean();
      console.log(`SCRAPE_COLLECTION: Found ${products.length} products`);

      // If there are products, process them
      if (products.length > 0) {
        console.log('SCRAPE_COLLECTION: Queueing products for processing');

        // Convert to the expected type for processing
        const productsToProcess = products as unknown as IProductDocument[];

        // Queue the products for processing
        const processJob = await queueProductProcessing(productsToProcess);
        console.log(`SCRAPE_COLLECTION: Queued processing job with ID: ${processJob.attrs._id}`);

        // Store the result reference in the job data
        job.attrs.data.processJobId = processJob.attrs._id;
        job.attrs.data.productsCount = products.length;
        await job.save();
      } else {
        console.log('SCRAPE_COLLECTION: No products found to process');
      }
    } catch (error) {
      console.error('Error in scrapeCollectionJob:', error);
      throw error;
    }
  };

  // Define the jobs with their processor functions
  agenda.define(
    JOB_TYPES.PROCESS_PRODUCTS,
    processProductsJob
  );

  agenda.define(
    JOB_TYPES.SCRAPE_COLLECTION,
    scrapeCollectionJob
  );

  // Schedule the recurring job to get all products every 5 minutes
  (async () => {
    try {
      // Cancel any existing jobs of this type
      await agenda.cancel({ name: JOB_TYPES.SCRAPE_COLLECTION });

      // Schedule the new recurring job
      agenda.every('5 minutes', JOB_TYPES.SCRAPE_COLLECTION, { priority: 'low' }, {
        timezone: 'local' // Use the server's local timezone
      });

      console.log('DEFINE_JOBS: Scheduled recurring job to get all products every 5 minutes');
    } catch (error) {
      console.error('DEFINE_JOBS: Error scheduling recurring job:', error);
    }
  })();
};

// Helper function to queue a new product processing job
export const queueProductProcessing = async (products: IProductDocument[]) => {
  console.log('Queueing product processing job...', { products });

  try {
    // Create a job with initial data
    const job = agenda.create(JOB_TYPES.PROCESS_PRODUCTS, {
      products,
      scheduledAt: new Date(),
      priority: 'high',
      // Initialize result field to make it easier to find later
      result: null
    });

    // Set job options
    job.unique({ 'data.scheduledAt': new Date() });
    job.schedule('now');

    // Save the job
    await job.save();

    console.log(`Scheduled processing for ${products.length} products with job ID: ${job.attrs._id}`);

    // Set up a listener to log the job results once it's completed
    const jobId = job.attrs._id.toString();

    // Wait for the job to complete and then log the results
    const checkJobCompletion = async () => {
      try {
        // Find the job by ID to get the latest state
        const completedJob = await agenda.jobs({ _id: job.attrs._id });

        if (completedJob && completedJob.length > 0) {
          const jobData = completedJob[0].attrs.data;

          // Check if the job has completed (has results)
          if (jobData.result) {
            console.log(`Job ${jobId} completed with results:`, jobData.result);
            if (jobData.result.length > 0) {
              await insertDataToDB(jobData.result);
            }
            return true;
          }
        }

        // If not completed, wait and check again
        console.log(`Job ${jobId} still processing, checking again in 1 second...`);
        setTimeout(checkJobCompletion, 1000);
        return false;
      } catch (err) {
        console.error(`Error checking job ${jobId} completion:`, err);
        return false;
      }
    };

    // Start checking for job completion (non-blocking)
    setTimeout(checkJobCompletion, 1000);

    // Return the job so the controller can access it later
    return job;
  } catch (error) {
    console.error('Failed to queue product processing job:', error);
    throw error;
  }
};

