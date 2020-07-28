const asyncHandler = require('../middleware/async-handler');
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

  res.status(201).json({
    success: true,
    data: user,
  });
});

/**
 * @desc Update user
 * @route PUT /api/v1/users/:id
 * @access private/Admin
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc Delete user
 * @route DELETE /api/v1/users/:id
 * @access private/Admin
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
