const Tour = require('./../models/tourModels');
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
    //BUILD QUERY

    //FILTER

    //method 1 using mongoDB filters

    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy',
    // });

    //method 2 using advanced mongoose filters

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    const queryObj = { ...req.query }; // make shallow copy obj using `...` so making changes here not disturb the req.query
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]); // iterates over each el in exFields and deletes if exFields present in queryObj

    //ADVANCED FILTERING

    //{ duration : { $gte: 5} }  What we want
    //{ duration: { gte: '5' } }  What we got
    // so using regex to replace gte with $gte

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lte|gte|lt|gt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    //SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('CreatedAt');
    }

    //LIMITING

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //PAGINATION

    let page = req.query.page * 1 || 1;
    let limit = req.query.limit * 1 || 100;
    let skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTour = await Tour.countDocuments();
      // throwing a error inside the try block immediately call the catch block
      if (skip >= numTour) throw new Error('This Page Does Not Exist');
    }

    //AWAIT QUERY
    const tours = await query;
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
