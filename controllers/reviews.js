const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async-handler');
const Review = require('../models/Review');

/**
 * @desc Get all reviews
 * @route GET /api/v1/reviews
 * @route GET /api/v1/bootcamps/:bootcampId/reviews
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

/**
 * @desc Get single review
 * @route GET /api/v1/reviews/:id
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @param {String} id
 */
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});
