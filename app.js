var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');



//Connect to DB
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
    console.log('Connected MongoDB');
});

// Init App
var app = express();

//View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors variable
app.locals.errors = null;

// Get Page Model
var Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get Category Model
var Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});



// Express fileUpload Middleware
app.use(fileUpload());

//Body-parser MiddleWare
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Express Sesison MiddleWare
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    // cookie: { secure: true }
}));

//Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.');
        var root = namespace.shift();
        var formParam = root;
        while (namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension){
                case '.jpg':
                    return '.jpg';
                case '.png':
                    return '.png';
                case '.jpeg':
                    return '.jpeg';
                case '':
                    return '.jpg';
                default :
                    return false;
            }
        }
    }
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

// Set Router
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var users = require('./routes/users.js');
var adminPages = require('./routes/adminPages.js');
var adminCategories = require('./routes/adminCategories.js');
var adminProducts = require('./routes/adminProducts.js');

app.use('/', pages);
app.use('/products/all', products);
app.use('/products/cart', cart);
app.use('/users', users);
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);

//Start the server


var port_number = app.listen(process.env.PORT || 5000);
app.listen(port_number);