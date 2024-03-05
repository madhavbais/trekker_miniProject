const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const { default: mongoose } = require('mongoose');
const {campgroundSchema, reviewSchema} = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground');
const wrapAsync = require('./utils/wrapAsync');
const { wrap } = require('module');
const { error } = require('console');
const Review  = require('./models/reviews.js')

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp');
  console.log('Connection Established!')
 
}

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {

    const result = campgroundSchema.validate(req.body);
    
    if(result.error){  // Fixed: Change 'error' to 'result.error'
        const msg = result.error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);  // Fix: Change 'result' to 'error'
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req,res) =>{
    res.render('home')
})

app.get('/campgrounds', wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, wrapAsync(async(req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
   
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));


app.get('/campgrounds/:id', wrapAsync(async (req, res, next) => {                   //ordering get reqs matters. everything after second slah will be considered a id
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground })
}))

app.get('/campgrounds/:id/edit', wrapAsync(async (req, res, next) => {                   //ordering get reqs matters. everything after second slah will be considered a id
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', validateCampground, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', wrapAsync( async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.post('/campgrounds/:id/reviews', validateReview, wrapAsync(async(req,res) => { 
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`);

}))

app.delete('/campgrounds/:id/reviews/:reviewId', wrapAsync(async(req,res) => {
       const {reviewId, id} = req.params;
      await Campground.findByIdAndUpdate(id, {$pull: {review: reviewId}});
      await Review.findByIdAndDelete(reviewId)
      res.redirect(`/campgrounds/${id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no, Something went wrong -_- '
    res.status(statusCode).render('error', {err})
})


app.listen(3000, () =>{
    console.log("LISTENING ON PORT 3000!!!")
})
