const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async-handler');
const User = require('../models/User');

/**
 * @desc  Register user
 * @route POST /api/v1/auth/register
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Get token
  const token = user.signJwtToken();

  res.status(200).json({
    success: true,
    token: token,
  });
});
