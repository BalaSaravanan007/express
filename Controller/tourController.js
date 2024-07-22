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
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$ratingAverage',
          numTours: { $sum: 1 },
          numRating: { $sum: '$ratingQuantity' },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
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

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
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
