const helpers = require("../utils/helpers");
const AppError = require("../utils/appError");

exports.getAll = (Model) =>
  helpers.catchAsync(async (req, res, next) => {
    const docs = await Model.find();
    helpers.success(res, 200, docs, true);
  });

exports.getOne = (Model) =>
  helpers.catchAsync(async (req, res, next) => {
    const docId = req.params.id;
    const doc = await Model.findById(docId);

    if (!doc) {
      return next(new AppError(404, "No document found with that Id."));
    }

    helpers.success(res, 200, doc);
  });

exports.deleteOne = (Model) =>
  helpers.catchAsync(async (req, res, next) => {
    const docId = req.params.id;
    const doc = Model.findById(docId);

    if (!doc) {
      return next(new AppError(404, "No document found with that Id."));
    }

    await Model.findByIdAndDelete(docId);

    helpers.success(res, 204, null);
  });
