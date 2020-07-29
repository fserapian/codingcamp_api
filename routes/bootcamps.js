const express = require('express');
const router = express.Router();
const advancedResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp');

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampByRadius,
  uploadBootcampPhoto,
} = require('../controllers/bootcamps');

// courses router
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

// Re-route course router to other resources
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampByRadius);

router.route('/:id/photo').put(protect, uploadBootcampPhoto);

module.exports = router;
