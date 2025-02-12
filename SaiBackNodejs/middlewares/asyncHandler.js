// middlewares/asyncHandler.js
const asyncHandler = (fn) => {
  if (typeof fn !== 'function') {
    throw new TypeError('asyncHandler requires a function');
  }
  
  return function(req, res, next) {
    return Promise.resolve(fn.call(this, req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
  