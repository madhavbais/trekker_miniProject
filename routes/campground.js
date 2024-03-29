const express = require('express')
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const Campground = require('../models/campground');

const { isLoggedin, isAuthor, validateCampground } = require('../middleware.js')


router.get('/', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.get('/new', isLoggedin, (req, res) => {
   
    res.render('campgrounds/new');
})


router.post('/', validateCampground, isLoggedin, wrapAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', wrapAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
              path: 'reviews',
              populate: {
                path: 'author'
              }
            }).populate('author');
    // console.log(campground)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedin, isAuthor, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
     if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', validateCampground, isAuthor, isLoggedin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    // const campground = await Campground.findById(id);
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error', 'You dont have the permission to do that!')
    //     return res.redirect(`/campgrounds/${id}`)
    // }
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', isLoggedin, isAuthor, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error', 'You dont have the permission to do that!')
    //     return res.redirect(`/campgrounds/${id}`)
    // }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}));

module.exports = router;