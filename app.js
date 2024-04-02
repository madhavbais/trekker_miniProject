if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const flash = require('connect-flash');
const { default: mongoose } = require('mongoose');
const {campgroundSchema, reviewSchema} = require('./schemas.js')
const session = require('express-session');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const ExpressError = require('./utils/ExpressError')
const wrapAsync = require('./utils/wrapAsync');
const { wrap } = require('module');
const { error } = require('console');
const Campground = require('./models/campground');
const Review  = require('./models/reviews.js')
const User = require('./models/user.js')

const userRoutes = require('./routes/user.js')
const campgroundRoutes = require('./routes/campground.js')
const reviewsRoutes = require('./routes/review.js')




main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp');
  console.log('Connection Established!')
 
}

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(__dirname + '/public'));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})