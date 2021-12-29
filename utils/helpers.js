exports.catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

exports.success = (res, statusCode, data, results) => {
  if (results) {
    return res.status(statusCode).json({
      status: "success",
      results: data.length,
      data: { data },
    });
  }
  return res.status(statusCode).json({
    status: "success",
    data: { data },
  });
};

exports.docNotFound = (res, doc) => {
  if (!doc) {
    return res.status(404).json({
      status: "failed",
      message: "No document found with that Id.",
    });
  }
};
