export const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

export const sendError = (res, message = "Something went wrong", statusCode = 500) => {
  return res.status(statusCode).json({
    status: "error",
    message,
  });
};

export const sendPaginatedSuccess = (res, data, pagination, message = "Success") => {
  return res.status(200).json({
    status: "success",
    message,
    data,
    pagination,
  });
};
