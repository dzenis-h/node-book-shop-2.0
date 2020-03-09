const advancedResults = (model, query) => async (req, res, next) => {
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 2;
  let criteria = query ? { userId: req.user._id } : undefined;
  const total = await model.find(criteria).countDocuments();
  const result = await model
    .find(criteria)
    .skip((page - 1) * limit)
    .limit(limit);

  const pagination = {
    currentPage: page,
    hasNextPage: limit * page < total,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(total / limit)
  };

  res.advancedResults = {
    success: true,
    count: result.length,
    pagination,
    data: result
  };

  next();
};
module.exports = advancedResults;
