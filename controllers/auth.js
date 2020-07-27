const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async-handler');
const User = require('../models/User');
const { findById } = require('../models/User');

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

  sendJwtTokenResponse(user, 200, res);
});

/**
 * @desc  Login user
 * @route POST /api/v1/auth/login
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please enter email and password'));
  }

  const user = await User.findOne({ email: email }).select('password');

  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  const passwordsMath = await user.matchPasswords(password);

  if (!passwordsMath) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  sendJwtTokenResponse(user, 200, res);
});

/**
 * @desc  Get logged in user
 * @route GET /api/v1/auth/me
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('Cannot find user', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc  Forgot password
 * @route POST /api/v1/auth/forgotpassword
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(`Cannot find user with email ${req.body.email}`, 404)
    );
  }

  const resetToken = user.getResetPasswordToken();
  // console.log('token->', resetToken);

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: user,
  });
});

const sendJwtTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.signJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token: token,
  });
};
