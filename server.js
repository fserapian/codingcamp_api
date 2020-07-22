const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error-handler');
const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env' });

// Routes
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

connectDB();

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File upload middleware
app.use(fileupload());

// Static files location
app.use(express.static(path.join(__dirname, 'public')));

// Mount the route
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} on port ${process.env.PORT}`
  )
);
