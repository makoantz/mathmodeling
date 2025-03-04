const express = require('express');
const router = express.Router();
const solutionController = require('../controllers/solutionController');

router.post('/verify-solution', solutionController.verifySolution);

module.exports = router;