const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`./dev-data/data/tours-simple.json`, 'utf-8')
);

exports.checkID = (req, res, next, val) => {
  console.log(`The ID is ${val}`);
  if (req.params.id > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  const newName = req.body.name;
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

exports.GetAllTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.CreateNewTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour); // implement to the original data : tours
  fs.writeFile(
    // Write to the file asynchronously
    `./dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) throw err;
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.GetTour = (req, res) => {
  console.log(req.params); //in the url resource separated by ':' are variables
  const tour = tours.find((el) => el.id === req.params.id);
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tours,
    },
  });
};

exports.UpdateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated Data Here...>',
    },
  });
};

exports.DeleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
