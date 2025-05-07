import { Router } from 'express';
import { 
    getUserWebsites, 
    addWebsiteToUser, 
    removeWebsiteFromUser 
} from '../controllers/userWebsiteController';
import authenticateUser from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Routes for managing user's websites
router.route('/:userId/websites')
    .get(getUserWebsites)
    .post(addWebsiteToUser);

router.route('/:userId/websites/:websiteId')
    .delete(removeWebsiteFromUser);

export default router;
