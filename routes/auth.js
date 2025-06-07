const express = require('express');
const authController = require('../controller/auth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/users', authController.getUser);
router.get('/balance', authController.getBalance);
router.post('/transfer', authController.transfer);
router.get('/transactions', authController.getTransactionHistory);
router.get('/bank_id', authController.getbank_id);
router.get('/admin/users', authController.getAllUsers);
router.post('/retrieve', authController.getretrieve);
router.get('/userstransactions', authController.getUsersTransactionHistory);
router.post('/assign-role', authController.assignRole);
router.post('/admin/delete-user', authController.deleteUser);
module.exports = router;
