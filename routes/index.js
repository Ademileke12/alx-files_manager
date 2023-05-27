// routes/index.js

import express from 'express';
import UsersController from '../controllers/UsersController';

const router = express.Router();

router.post('/users', UsersController.postNew);
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;
