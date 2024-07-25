const Tour = require('./../models/tourModels');
const APIfeatures = require('./../Utils/apiFeatures');
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

exports.GetAllTour = async (req, res) => {
  try {
    //AWAIT QUERY
    const features = new APIfeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours,
      },
    });
    //HANDLE ERROR
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.CreateNewTour = async (req, res) => {
  //method: 1

  // const newTour = new Tour({
  //   name: "bala Tours"
  // })
  // newTour.save()

  //method: 2

  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: { err },
    });
  }
};

exports.GetTour = async (req, res) => {
  // console.log(req.params); //in the url resource separated by ':' are variables
  // const tour = tours.find((el) => el.id === req.params.id);
  // console.log(req.requestTime);

  try {
    const tour = await Tour.findById(req.params.id);

    //exactly similar to
    //Tour.findOne({_id: req.params.id})

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed!!!',
      message: err,
    });
  }
};

exports.UpdateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.DeleteTour = async (req, res) => {
  try {
    //method: 1

    // const del = await Tour.deleteOne({ _id: req.params.id });

    //method: 2

    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.TourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.GetMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
