const express = require('express');
const router = express.Router({ mergeParams: true });
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const { getUsers, getUser } = require('../controllers/users');

router.use(protect, authorize('admin'));

router.route('/').get(advancedResults(User), getUsers);
router.route('/:id').get(getUser);

module.exports = router;
