const express = require('express')
const router = express.Router({mergeParams: true}); 
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const { route } = require('./campground');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

router.get('/register', (req,res) => {
    res.render('users/register')
})

router.post('/register', wrapAsync (async (req,res, next) => {
    try{
    const {username, email, password} = req.body;
    const user = new User({username, email})
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
        if(err) return next(err);
        req.flash('success', 'WELCOME TO TREKKER!')
        res.redirect('/campgrounds')
    })
   
    } catch(e){
        req.flash('error', e.message);
        res.redirect('register')
    }
})) 

router.get('/login', (req,res) => {
    res.render('users/login')
})

// router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), async (req,res) => {
//       req.flash('success', 'Welcome Back to Trekker!')
//       const redirectURL = req.locals.returnTo || '/campgrounds';
//       delete req.session.returnTo;
//       res.redirect(redirectURL)
// })

router.post('/login',
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    // Now we can use res.locals.returnTo to redirect the user after login
    (req, res) => {
        req.flash('success', 'Welcome back!');
        const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
        res.redirect(redirectUrl);
    });

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {                            //req#logout requires a callback function
        if (err) {
            return next(err);
        }
        req.flash('success', 'See you again!');
        res.redirect('/campgrounds');
    });
}); 
module.exports = router;