const express = require('express');
const router = express.Router({ mergeParams: true });// it makes possible has access to id in params
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const Review = require('../models/review');
const Campground = require('../models/compground');
const ExpressError = require('../helpers/ExpressError');
const catchAsync = require('../helpers/catchAsync');
const { reviewSchema } = require('../schemas.js'); // Joi schema
const reviews = require('../controllers/review');

//validateReview moved to middleware file

//DELETE REVIEW ROUTE
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

//Post REVIEW
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

module.exports = router;