const { registeredUser } = require('../controller/authController');
const router = require('express').Router();

router.post('/registered-user', registeredUser);

module.exports = router;