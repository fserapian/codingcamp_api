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

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampByRadius);

router.route('/:id/photo').put(uploadBootcampPhoto);

module.exports = router;
