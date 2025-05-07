import { Router } from 'express';
import { 
    getWebsites, 
    getWebsiteById, 
    createWebsite, 
    updateWebsite, 
    deleteWebsite, 
    updateWebsiteStatus 
} from '../controllers/websiteController';

const router = Router();

// Routes for /api/websites
router.route('/')
    .get(getWebsites)
    .post(createWebsite);

// Routes for /api/websites/:id
router.route('/:id')
    .get(getWebsiteById)
    .put(updateWebsite)
    .delete(deleteWebsite);

// Route for updating website status
router.route('/:id/status')
    .patch(updateWebsiteStatus);

export default router;
