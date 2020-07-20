const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please enter title'],
  },
  description: {
    type: String,
    required: [true, 'Please enter desciption'],
  },
  weeks: {
    type: Number,
    required: [true, 'Please enter number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please enter tuition cost'],
  },
  minimumSkill: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Please enter tuition cost'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Bootcamp',
  },
});

module.exports = mongoose.model('Course', CourseSchema);
