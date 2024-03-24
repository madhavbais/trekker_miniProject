const express = require('express')
const router = express.Router({mergeParams: true});     //mergeParams: true to access the params in our route
const ExpressError = require('../utils/ExpressError')
const wrapAsync = require('../utils/wrapAsync');
const Review  = require('../models/reviews.js')
const Campground = require('../models/campground');
const {validateReview, isLoggedin, isReviewAuthor} = require('../middleware.js')





router.post('/', validateReview, isLoggedin, wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedin, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;