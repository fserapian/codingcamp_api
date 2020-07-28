const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
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
 * @desc  Update details, name and email
 * @route PUT /api/v1/auth/updatedetails
 * @access private
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;
  const fieldsToUpdate = {
    name,
    email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse('Cannot find user', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc  Update password
 * @route PUT /api/v1/auth/updatepassword
 * @access private
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPasswords(req.body.currentPassword))) {
    return next(new ErrorResponse('Incorrect password', 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendJwtTokenResponse(user, 200, res);
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

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You're receiving this email because you (or someone else) has requested to reset your password.
  To do that please send a PUT request to the address: ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset password token',
      message: message,
    });

    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse(`Email could not be sent`, 500));
  }
});

/**
 * @desc  Reset password
 * @route GET /api/v1/auth/resetpassword/:resetToken
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @param {String} resetToken
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Hash the token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendJwtTokenResponse(user, 200, res);
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
