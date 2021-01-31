if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const app = express();
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./helpers/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport'); // it allows us to plugin multiple strategies for authentication
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize'); // avoid tricky queries

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');

const MongoStore = require('connect-mongo')(session);

//const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//const secret = process.env.SECRET || 'thisshouldbeabettersecret';
const dbUrl = 'mongodb://localhost:27017/yelp-camp';
const mongoose = require('mongoose');
//mongodb://localhost:27017/yelp-camp
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const store = new MongoStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret',
    touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
const sessionConfig = {
    //it is just temporary, for now: just testing purpose
    //nothing usedul
    store,
    secret: 'thisshouldbeabettersecret',
    name: 'session1',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true, undo when deploying
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7

    }

}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session(sessionConfig))
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dbu0swtvl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(express.urlencoded({ extended: true })); // it parse the req.body/ making availablr to see
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session()); //make sure / app.use(session(sessionConfig)) iss running before it! line34

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//how store user in the session
passport.deserializeUser(User.deserializeUser());//the opposite

//I have access to this in every single template. it is global.
app.use((req, res, next) => {
    // console.log(req.session);
    // if (!['/login', '/', '/register'].includes(req.originalUrl)) {
    //     req.session.returnTo = req.originalUrl;
    // }
    res.locals.currentUser = req.user; // makes sure that exist a user logged in and pass it to my templates
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
}) // make sure flash render before  any route as below

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes); // by default i dont have access to this Id
app.use('/', usersRoutes);
app.use(express.static(path.join(__dirname, 'public')))
// To remove data, use:
app.use(mongoSanitize());

app.get('/', (req, res) => {
    res.render('home')
});



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err })
})
app.listen(4000, () => {
    console.log('Serving on port 4000')
})