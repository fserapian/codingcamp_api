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

/**
 * @desc Get single user
 * @route GET /api/v1/users/:id
 * @access private/Admin
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc Create user
 * @route POST /api/v1/users
 * @access private/Admin
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
});
