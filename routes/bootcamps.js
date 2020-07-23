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

// Re-route course router to other resources
router.use('/:bootcampId/courses', courseRouter);

const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampByRadius);

router.route('/:id/photo').put(uploadBootcampPhoto);

module.exports = router;
