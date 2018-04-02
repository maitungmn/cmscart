var express = require('express');
var router = express.Router();

/**
 * Get Category Model
 */
var Category = require('../models/category');

/**
 * Get Categories Index
 */
router.get("/", function (req, res) {
    Category.find(function (err, categories) {
        if(err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        })
    });
});

/**
 * Get add Category
 */
router.get("/add-category", function (req, res) {
    var title = "";

    res.render('admin/add_category',{
        title: title
    })
});

/**
 * Post add Category
 */
router.post("/add-category", function (req, res) {
    req.checkBody('title', 'Title must have Value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();
    if(errors){
        console.log('Validator is Working!');
        res.render('admin/add_category',{
            errors: errors,
            title: title
        })
    }else{
        Category.findOne({slug: slug}, function (err, category) {
            if(category){
                req.flash('danger', 'Category title exists, choose another!');
                res.render('admin/add_category',{
                    title: title
                })
            }else {
                var category = new Category({
                    title: title,
                    slug: slug,
                });
                category.save(function (err) {
                    if(err)
                        return console.log(err);
                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories');
                })
            }
        })
    }

});

/**
 * POST reorder Categories
 */
router.post("/reorder-Categories", function (req, res) {
    var ids = req.body['id[]'];
    var count = 0;
    for(var i = 0; i < ids.length; i++){
        var id = ids[i];
        count++;
        (function (count) {
            Category.findById(id, function (err, Category) {
                Category.sorting = count;
                Category.save(function (err) {
                    if(err)
                        return console.log(err);
                });
            });
        })(count);
    }
});

/**
 * Get edit Category
 */
router.get("/edit-Category/:slug", function (req, res) {
    Category.findOne({slug: req.params.slug},function (err, Category) {
        if (err)
            return console.log(err);
        res.render('admin/edit_Category',{
            title: Category.title,
            slug: Category.slug,
            content: Category.content,
            id: Category._id
        })
    });
});

/**
 * Post edit Category
 */
router.post("/edit-Category/:slug", function (req, res) {
    req.checkBody('title', 'Title must have Value.').notEmpty();
    req.checkBody('content', 'Content must have Value.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.body.id;

    var errors = req.validationErrors();
    if(errors){
        console.log('Validator is Working!');
        res.render('admin/edit_Category',{
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
    }else{
        // $ne = not equal
        Category.findOne({slug: slug, _id:{'$ne':id}}, function (err, Category) {
            if(Category){
                req.flash('danger', 'Category slug exists, choose another!');
                res.render('admin/edit_Category',{
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                })
            }else {
                Category.findById(id, function (err, Category) {
                    if(err)
                        return console.log(err);
                    Category.title = title;
                    Category.slug = slug;
                    Category.content = content;

                    Category.save(function (err) {
                        if(err)
                            return console.log(err);
                        req.flash('success', 'Category Edited!');
                        res.redirect('/admin/Categories/edit-Category/'+Category.slug);
                    });
                });


            }
        })
    }

});

/**
 * Get Delete Category
 */
// Category.finBy... : Mongoose Function
router.get("/delete-Category/:id", function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err) {
        if(err)
            return console.log(err);
        req.flash('success', 'Category deleted!');
        res.redirect('/admin/Categories/');
    })
});

//Exports
module.exports = router;
