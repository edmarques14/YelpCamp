const express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const Campground = require('../models/compground');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campground')
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage })

// /campgrounds/index
router.get('/', catchAsync(campgrounds.index));

//Create new Campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.post('/', isLoggedIn, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.createNewCampground))

//show route
router.get('/:id', catchAsync(campgrounds.showCampground))

//Edit route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.editCampground))

//DELETE  CAMP ROUTE
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;