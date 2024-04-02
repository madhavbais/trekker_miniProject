const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const User = require('../models/user');
const users = require('../controllers/user');

router.route('/register')
    .get(users.renderRegister)
    .post(wrapAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

module.exports = router;