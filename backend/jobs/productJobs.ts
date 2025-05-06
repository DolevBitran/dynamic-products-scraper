import agenda, { JOB_TYPES } from '../config/agenda';
import { fieldsData } from '../controllers/fieldsController';
import { ScrapeType } from '../models/Field';
import { IProductDocument } from '../models/Product';
import * as cheerio from 'cheerio';

// Define job data interface for type safety
interface ProcessProductsJobData {
  products: IProductDocument[];
  scheduledAt: Date;
}

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
  return Object.assign({}, ...scrapedFields)
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
      console.log('Products:', JSON.stringify(products, null, 2));

      // Map product links for return value
      const productsData = products.map(scrapeProductPage);

      // Store the result in the job data
      job.attrs.data.result = await Promise.all(productsData);
      console.log(job.attrs.data.result)
      await job.save();
    } catch (error) {
      console.error('Error processing products job:', error);
      throw error;
    }
  };

  // Define the job with the processor function
  agenda.define(
    JOB_TYPES.PROCESS_PRODUCTS,
    processProductsJob
  );
};

// Helper function to queue a new product processing job
export const queueProductProcessing = async (products: IProductDocument[]) => {
  console.log('Queueing product processing job...', { products });

  try {
    // Create a job with initial data
    const job = agenda.create(JOB_TYPES.PROCESS_PRODUCTS, {
      products,
      scheduledAt: new Date(),
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

