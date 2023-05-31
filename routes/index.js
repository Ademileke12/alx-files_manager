const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

// GET /status
router.get('/status', AppController.getStatus);

// GET /stats
router.get('/stats', AppController.getStats);

// POST /users
router.post('/users', UsersController.postNew);

// GET /connect
router.get('/connect', AuthController.getConnect);

// GET /disconnect
router.get('/disconnect', AuthController.getDisconnect);

// GET /users/me
router.get('/users/me', UsersController.getMe);

// POST /files
router.post('/files', FilesController.postUpload);

module.exports = router;
