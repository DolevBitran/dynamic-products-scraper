import { Router } from 'express';
import { getProducts, InsertAndUpdateProducts, DeleteProduct, UpdateProduct } from '../controllers/productsController';

const router = Router();

router.route('/')
    .get(getProducts)
    .post(InsertAndUpdateProducts)

router.route('/:id')
    .put(UpdateProduct)
    .delete(DeleteProduct)

export default router;