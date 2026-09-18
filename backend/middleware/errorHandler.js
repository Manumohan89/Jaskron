export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error('Error:', {
    status,
    message,
    error: err
  });
  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack
      })
    }
  });
}