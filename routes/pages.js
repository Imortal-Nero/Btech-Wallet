const express = require('express');
const path = require('path');

const router = express.Router();


router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/signup.html'));
});

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

router.get('/homepage', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/homepage.html'));
});

router.get('/checkbalance', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/checkbalance.html'));
});

router.get('/transactionhistory', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/transactionhistory.html'));
});

module.exports = router;