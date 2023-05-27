const express = require('express');
const AuthController = require('../controllers/AuthController');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
<<<<<<< HEAD
router.post('/users', UsersController.postNew);i
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
=======
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);
router.get('/files/:id/data', FilesController.getFile);
>>>>>>> e81b84c9beced44f3f1d283e3a576d32709e2d10

module.exports = router;
