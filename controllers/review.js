const Review = require('../models/review');
const Campground = require('../models/compground');


module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }) //deleting specific review from a campground
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Successfully Deleted!');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new Review!');
    res.redirect(`/campgrounds/${campground._id}`);
}