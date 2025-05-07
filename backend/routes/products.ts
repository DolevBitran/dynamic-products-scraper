import { Router } from 'express';
import { getProducts, InsertAndUpdateProducts, DeleteProduct } from '../controllers/productsController';

const router = Router();

router.route('/')
    .get(getProducts)
    .post(InsertAndUpdateProducts)

router.route('/:id')
    .delete(DeleteProduct)

export default router;