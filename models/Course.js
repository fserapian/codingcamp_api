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

CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log(`calculating average cost for bootcamp ${bootcampId}`);
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost * 10) / 10,
    });
  } catch (err) {
    console.err(err);
  }
};

CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
