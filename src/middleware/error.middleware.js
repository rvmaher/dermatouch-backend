export const errorMiddleware = (err, req, res, next) => {
  console.error(err); 
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message,
  });
};
