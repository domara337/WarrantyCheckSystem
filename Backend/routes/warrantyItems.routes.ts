import { Router } from 'express';
import {
	searchWarranties,
	getBySerialNumber,
	createWarranty,
	updateWarranty,
	removeWarranty,
	createProduct,
	getAllWarranties,
} from '../controllers/warrantyItems.controller';

const router = Router();

router.get('/', getAllWarranties);
router.get('/search', searchWarranties);
router.get('/serial/:serialNumber', getBySerialNumber);
router.post('/enter-product', createProduct);
router.post('/', createWarranty);
router.patch('/:id', updateWarranty);
router.delete('/:id', removeWarranty);

export default router;
