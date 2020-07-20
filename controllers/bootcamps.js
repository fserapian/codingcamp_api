const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async-handler');

/**
 * @desc  Get all bootcamps
 * @route GET /api/v1/bootcamps
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  const excludedFields = ['select', 'sort', 'page', 'limit'];

  const reqQuery = { ...req.query };

  excludedFields.forEach((f) => delete reqQuery[f]);

  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|eq|in)\b/g,
    (match) => `$${match}`
  );

  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  // Select certain fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  const pagination = {};

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  const bootcamps = await query;

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination: pagination,
    data: bootcamps,
  });
});

/**
 * @desc  Get single bootcamp
 * @route GET /api/v1/bootcamps/:id
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

/**
 * @desc  Create bootcamp
 * @route POST /api/v1/bootcamps
 * @access private
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

/**
 * @desc  Update bootcamps
 * @route PUT /api/v1/bootcamps/:id
 * @access private
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

/**
 * @desc  Delete bootcamps
 * @route DELETE /api/v1/bootcamps/:id
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id}`, 404)
    );
  }

  bootcamp.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @desc  Get bootcamps by radius
 * @route GET /api/v1/bootcamps/radius/:zipcode/:distance
 * @access public
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
exports.getBootcampByRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Radius of earth in Km
  const radiusOfEarch = 6371;
  const radius = distance / radiusOfEarch;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
