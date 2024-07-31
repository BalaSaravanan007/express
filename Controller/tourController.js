const AppError = require('../Utils/appError');
const Tour = require('./../models/tourModels');
const APIfeatures = require('./../Utils/apiFeatures');
const catchAsync = require('./../Utils/catchAsync');
// const fs = require('fs');

// const tours = JSON.parse(
//   fs.readFileSync(`./dev-data/data/tours-simple.json`, 'utf-8')
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`The ID is ${val}`);
//   if (req.params.id > tours.length - 1) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   const newName = req.body.name;
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

exports.topCheapTours = (req, res, next) => {
  req.query.sort = '-ratingAverage,price';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingAverage,difficulty,duration,summary';
  next();
};

exports.GetAllTour = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  //AWAIT QUERY
  const tours = await features.query;
  // console.log(req.query);

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.CreateNewTour = catchAsync(async (req, res, next) => {
  //method: 1

  // const newTour = new Tour({
  //   name: "bala Tours"
  // })
  // newTour.save()

  //method: 2

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.GetTour = catchAsync(async (req, res, next) => {
  // console.log(req.params); //in the url resource separated by ':' are variables/ parameters
  // const tour = tours.find((el) => el.id === req.params.id);
  // console.log(req.requestTime);

  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(
      new AppError(`no tour found with the id ${req.params.id}`, 404)
    );
  }

  //exactly similar to
  //Tour.findOne({_id: req.params.id})

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.UpdateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(
      new AppError(`no tour found with the id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.DeleteTour = catchAsync(async (req, res, next) => {
  //method: 1

  // const del = await Tour.deleteOne({ _id: req.params.id });

  //method: 2

  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(
      new AppError(`no tour found with the id ${req.params.id}`, 404)
    );
  }

  res.status(204).json({
    status: 'success',
  });
});

exports.TourStats = catchAsync(async (req, res, next) => {
  // performing aggregation pipeline methods
  const stats = await Tour.aggregate([
    // stage 1
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    // stage 2
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    // stage 3

    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.GetMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  // Define the start and end dates for the given year
  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);

  const plan = await Tour.aggregate([
    // performing aggregation pipeline

    {
      $addFields: {
        // Convert startDates strings to ISODate
        startDates: {
          $map: {
            input: '$startDates',
            as: 'dateStr',
            in: {
              $dateFromString: {
                dateString: {
                  $concat: [
                    { $arrayElemAt: [{ $split: ['$$dateStr', ','] }, 0] }, // Date part
                    'T', // Separator
                    { $arrayElemAt: [{ $split: ['$$dateStr', ','] }, 1] }, // Time part
                  ],
                },
              },
            },
          },
        },
      },
    },
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'Success',
    result: plan.length,
    data: {
      plan,
    },
  });
});
