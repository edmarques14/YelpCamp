const Campground = require('../models/compground'); // two points because compgrouns is in another directory
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

//when this file run; it first remove the data and then add the the data. To avoid duplications
const seedDB = async () => {
    await Campground.deleteMany({}); // {} means all
    for (let i = 0; i <= 300; i++) { //50 because I want just 50 campgrounds; but I have much more
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        //making a campground and setting the location
        const camp = new Campground({
            author: '6008b232c6dbb4021899b844',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,//cities come from cities.js 
            title: `${sample(descriptors)} ${sample(places)}`,
            //image: 'https://source.unsplash.com/collection/483251', //483251 is the number collection
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {

                    url: 'https://res.cloudinary.com/dbu0swtvl/image/upload/v1611686343/YelpCamp/fa3z1g3kwnqhgsg50br5.jpg',
                    filename: 'YelpCamp/fa3z1g3kwnqhgsg50br5'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero earum omnis corrupti ipsam, dolorem consectetur ipsum fugiat officia debitis velit quo illum atque expedita provident mollitia dicta modi odio non.',
            price //shorthand price: price
        })
        await camp.save(); // at the end of loop; it shoulde saved me 50 camps
    }
}
seedDB().then(() => {
    db.close(); // rememember: const db = mongoose.connection; line 11
})