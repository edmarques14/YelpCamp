const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');
const Schema = mongoose.Schema; //shortcut 


const ImageSchema = new Schema({

    url: String,
    filename: String

})
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200/h_200')
});


const opts = { toJSON: { virtuals: true } }
//define schema
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User' //User model
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review' //review model
        }
    ]
}, opts);

// CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
//     return `<a href="/campgrounds/${this._id}">${this.title}</a>`
// });
CampgroundSchema.virtual('properties').get(function () {
    return {
        id: this._id,
        title: this.title
    }
});

CampgroundSchema.post('findOneAndDelete', async function (doc) { //doc is the camp deleted
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema); //exports it