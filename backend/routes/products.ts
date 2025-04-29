import { Router } from 'express';
import { getProducts, InsertAndUpdateProducts } from '../controllers/productsController';

const router = Router();

router.route('/')
    .get(getProducts)
    .post(InsertAndUpdateProducts)

export default router;