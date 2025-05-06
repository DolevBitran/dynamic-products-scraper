import Agenda from 'agenda';
import mongoose from 'mongoose';
import config from '../config/config';

// Get the MongoDB connection string from the environment or use a default
const mongoConnectionString = config.MONGO_URI;

// Create a new agenda instance
const agenda = new Agenda({
  db: {
    address: mongoConnectionString,
    collection: 'agendaJobs'
    // MongoDB driver 4.0+ doesn't need useUnifiedTopology
  },
  processEvery: '30 seconds'
});

// Define job types
export const JOB_TYPES = {
  PROCESS_PRODUCTS: 'process-products'
};

// Start agenda
export const startAgenda = async () => {
  try {

    // Make sure MongoDB is connected before starting Agenda
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
    }

    // Start the job processor
    await agenda.start();
    console.log('AGENDA_INIT: Agenda job scheduler started successfully');

    return agenda;
  } catch (error) {
    console.error('AGENDA_INIT: Failed to start Agenda:', error);
    throw error;
  }
};

export default agenda;
