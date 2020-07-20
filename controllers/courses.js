const Course = require('../models/Course');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async-handler');
const Bootcamp = require('../models/Bootcamp');

/**
 * @desc Get all courses
 * @route GET /api/v1/courses
 * @route GET /api/v1/bootcamps/:bootcampId/coures
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name',
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * @desc Get single course by id
 * @route GET /api/v1/courses/:id
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @param {String} id
 */
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Cannot find course with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

/**
 * @desc Create course
 * @route POST /api/v1/bootcamps/:bootcampId/courses
 * @access private
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @param {String} bootcampId
 */
exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.bootcampId}`)
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

/**
 * @desc Update course
 * @route PUT /api/v1/courses/:id
 * @access private
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @param {String} id
 */
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Cannot find course with id ${req.params.id}`)
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

/**
 * @desc Delete course
 * @route DELETE /api/v1/courses/:id
 * @access private
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @param {String} id
 */
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Cannot find course with id ${req.params.id}`)
    );
  }

  course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
