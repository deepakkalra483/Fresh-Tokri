import express from 'express';
import { getAddresses, addAddress } from '../controllers/addressController.js';

const router = express.Router();

router.get('/', getAddresses);
router.post('/', addAddress);

export default router;

