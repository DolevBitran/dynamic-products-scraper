import { Router } from 'express';
import { DeleteField, InsertAndUpdateFields, UpdateField } from '../controllers/fieldsController';
import { getFields } from '../controllers/fieldsController';

const router = Router();

router.route('/')
    .get(getFields)
    .post(InsertAndUpdateFields)

router.route('/:id')
    .put(UpdateField)
    .delete(DeleteField)

export default router;