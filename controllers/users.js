const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async-handler');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');

/**
 * @desc Get all users
 * @route GET /api/v1/users
 * @access private/Admin
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
