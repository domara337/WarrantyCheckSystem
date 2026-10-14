import { Router } from 'express';
import {
	getByWarrantyId,
	create,
	updateItem,
	update,
	remove,
} from '../controllers/installation.controller';

const router = Router();

router.get('/warranty/:warranty_id', getByWarrantyId);
router.post('/', create);
router.patch('/items/:id', updateItem);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
