var express = require('express');
var router = express.Router();

// Get Product model
var Product = require('../models/product');

/*
 * GET add product to cart
 */
router.get('/', function (req, res) {

    var slug = req.params.product;

    Page.findOne({slug: slug}, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty:1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' +p.image
            })
        } else {
            var cart =req.session.cart;
            var newItem = true;

            for (var i = 0; i< cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }
            if (newItem){
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price)
                })
            }
        }


    });

});


// Exports
module.exports = router;


