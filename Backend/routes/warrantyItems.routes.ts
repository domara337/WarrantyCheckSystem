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
router.get('/enter-product', (_req, res) => {
	res.set('Allow', 'POST').status(405).json({
		success: false,
		message: 'This endpoint only accepts POST requests. Submit the Enter Product form in the application.',
	});
});
router.post('/enter-product', createProduct);
router.post('/', createWarranty);
router.patch('/:id', updateWarranty);
router.delete('/:id', removeWarranty);

export default router;
