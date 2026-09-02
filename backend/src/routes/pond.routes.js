'use strict';

const express = require('express');
const { body } = require('express-validator');
const { getPonds, createPond, getPondById, updatePond, deletePond } = require('../controllers/pond.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const createRules = [
  body('name').trim().notEmpty().withMessage('Pond name is required.'),
  body('species').trim().notEmpty().withMessage('Species is required.'),
  body('size_acres').optional().isFloat({ min: 0 }).withMessage('Size must be a positive number.'),
  body('stocking_density').optional().isInt({ min: 0 }).withMessage('Stocking density must be a positive integer.'),
  body('status').optional().isIn(['active', 'harvested', 'idle']).withMessage('Invalid status value.'),
];

router.use(authenticate);

router.get('/',      getPonds);
router.post('/',     createRules, createPond);
router.get('/:id',   getPondById);
router.put('/:id',   createRules, updatePond);
router.delete('/:id', deletePond);

module.exports = router;
