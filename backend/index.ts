import express, { Application } from 'express';
import cors from 'cors';
import commonRoute from './routes/common';
import productsRoute from './routes/products';
import fieldsRoute from './routes/fields';
import authRoute from './routes/auth';
import usersRoute from './routes/users';
import websitesRoute from './routes/websites';
import userWebsitesRoute from './routes/userWebsites';
import config from './config/config';
import connectDB from './db/connect';
import { startAgenda } from './config/agenda';
import { defineJobs } from './jobs/productJobs';
import { loadFieldsFromDB } from './controllers/fieldsController';

const app: Application = express()


app.use(express.json());
app.use(cors());


app.use(commonRoute)
app.use('/products', productsRoute)
app.use('/fields', fieldsRoute)
app.use('/auth', authRoute)
app.use('/users', usersRoute)
app.use('/websites', websitesRoute)
app.use('/users', userWebsitesRoute)

const start = async () => {
    try {
        // Connect to MongoDB
        await connectDB(config.MONGO_URI);
        
        // Initialize and start Agenda
        const agenda = await startAgenda();
        
        // Define all job processors
        defineJobs();
        
        // Load fields from database on startup
        await loadFieldsFromDB();
        
        // Start the server
        app.listen(config.PORT, () => {
            console.log(`Server is listening on port ${config.PORT}...🏃`);
            console.log('Agenda job scheduler initialized');
        });
    } catch (err) {
        console.log(err);
    }
}

start()
