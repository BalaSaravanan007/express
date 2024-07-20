const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModels');
const fs = require('fs');

dotenv.config({ path: './../../config.env' });

console.log(process.env.DATABASE);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const tour = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const DeleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Deleted Successfully!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const ImportData = async () => {
  try {
    await Tour.create(tour);
    console.log('Data Imported Successfully!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// connecting to the database
mongoose
  .connect(DB, {
    // returns a promise
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    //so we use .then method to configure the resolved promise
    console.log('DB connected Successfully');
  });

if (process.argv[2] === '--import') {
  ImportData();
} else if (process.argv[2] === '--delete') {
  DeleteData();
}
