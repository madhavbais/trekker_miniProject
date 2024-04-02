const express = require('express')
const router = express.Router({mergeParams: true});     //mergeParams: true to access the params in our route
const ExpressError = require('../utils/ExpressError')
const wrapAsync = require('../utils/wrapAsync');
const Review  = require('../models/reviews.js')
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews.js')
const {validateReview, isLoggedin, isReviewAuthor} = require('../middleware.js')


router.post('/', validateReview, isLoggedin, wrapAsync(reviews.createReviews))

router.delete('/:reviewId', isLoggedin, isReviewAuthor, wrapAsync(reviews.deleteReview))

module.exports = router;