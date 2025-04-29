import { Router } from 'express';
import { DeleteField, InsertAndUpdateFields } from '../controllers/fieldsController';
import { getFields } from '../controllers/fieldsController';

const router = Router();

router.route('/')
    .get(getFields)
    .post(InsertAndUpdateFields)
    .delete(DeleteField)

export default router;