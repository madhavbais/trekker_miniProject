const express = require('express')
const router = express.Router();
const campgrounds = require('../controllers/campground.js')
const wrapAsync = require('../utils/wrapAsync');
const Campground = require('../models/campground');
const multer = require('multer')
const {storage} = require('../cloudinary/index.js')
const upload = multer({ storage })
const { isLoggedin, isAuthor, validateCampground } = require('../middleware.js')

router.route('/')
       .get(wrapAsync(campgrounds.index))
       .post(isLoggedin, upload.array('image'),validateCampground, wrapAsync(campgrounds.createCampground))
        // .post(upload.array('image'), (req,res)=> {
        //         console.log(req.body, req.files );
        //         res.send('IT WORKED')
        // })         



router.get('/new', isLoggedin, campgrounds.renderNewForm)    //should go above /:id or else the browser assumes 'new' to be an id

router.route('/:id')
        .get(wrapAsync(campgrounds.showCampgrounds))
        .put(isLoggedin, isAuthor, upload.array('image'), validateCampground,  wrapAsync(campgrounds.updateCampground))
        .delete(isLoggedin, isAuthor, wrapAsync(campgrounds.deleteCampground))




router.get('/:id/edit', isLoggedin, isAuthor, wrapAsync(campgrounds.editCampground))



module.exports = router;