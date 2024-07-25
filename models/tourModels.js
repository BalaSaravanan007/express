const mongoose = require('mongoose');
const slugify = require('slugify');

// creating a schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A name must contain a 40 characters or below'],
      minlength: [10, 'A name must contain a 10 characters or above'],
    },
    slug: String,

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty will be either: easy, medium, difficult',
      },
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'The price ({VALUE}) must be greater than the price discount',
      },
    },

    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    ratingsAverage: {
      type: Number,
      max: [5.0, 'Ratings must be between 1.0 and 5.0'],
      min: [1.0, 'Ratings must be between 1.0 and 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 19,
    },
    discription: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: false,
    },
    images: [String],
    CreatedAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// virtual properties

/*These are properties that 
do not affect the original database
like pipeline aggregation
but we can do alterations
to the specified fields */

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//mongoose middleware

//documentation middleware

//RUNS BEFORE save() or create() functions

/* Here the "this" keyword represents 
the document that is going to save to 
the collections in the db */

tourSchema.pre('save', function (next) {
  //console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

//RUNS AFTER save() or create() functions

/*Here we have no access to the "this" keyword
because the document is already saved to 
the collection 

we only have the access to the saved document */

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// query middleware

//RUNS BEFORE find() method
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

//RUNS AFTER find() method
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query takes ${Date.now() - this.start} milliseconds!`);
  // console.log(docs);
  next();
});

//RUNS BEFORE aggregate()

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

// modelling a schema

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
