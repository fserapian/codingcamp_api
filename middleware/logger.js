// test middleware
const logger = (req, res, next) => {
  console.log(`${req.method} request`);
  next();
};

module.exports = logger;
