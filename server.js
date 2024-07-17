const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// connecting to the database
mongoose
  .connect(DB, {
    // returns a promise
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    //so we use .then method to configure the resolved promise
    console.log('DB connected Successfully');
  });

// creating a schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A tour must have a name'],
    unique: true,
  },
  price: {
    type: Number,
    require: [true, 'A tour must have a price'],
  },
  rating: {
    type: Number,
    default: 4.5,
  },
});

// modelling a schema
const Tour = mongoose.model('Tour', tourSchema);

// using the modeled schema to create a test tour
const testTour = new Tour({
  name: 'The Sea Explorer',
  price: 767,
  rating: 4.8,
});

// saving it to the mongodb database
testTour
  .save()
  // performing asynchronous operation
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('Error: 💥', err);
  });

// Starting The Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on the port ${port}`);
});
