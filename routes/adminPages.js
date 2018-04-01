var express = require('express');
var router = express.Router();

/**
 * Get Page Model
 */
var Page = require('../models/pages');

/**
 * Get Pages Index
 */
router.get("/", function (req, res) {
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        res.render('admin/pages', {
            pages: pages
        })
    })
});

/**
 * Get add page
 */
router.get("/add-page", function (req, res) {
    var title = "";
    var slug = "";
    var content = "";
    res.render('admin/add_page',{
        title: title,
        slug: slug,
        content: content
    })
});

/**
 * Post add page
 */
router.post("/add-page", function (req, res) {
    req.checkBody('title', 'Title must have Value.').notEmpty();
    req.checkBody('content', 'Content must have Value.').notEmpty();
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var errors = req.validationErrors();
    if(errors){
        console.log('Validator is Working!');
        res.render('admin/add_page',{
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
    }else{
        Page.findOne({slug: slug}, function (err, page) {
            if(page){
                req.flash('danger', 'Page slug exists, choose another!');
                res.render('admin/add_page',{
                    title: title,
                    slug: slug,
                    content: content
                })
            }else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save(function (err) {
                    if(err)
                        return console.log(err);
                    req.flash('success', 'Page added!');
                    res.redirect('/admin/pages');
                })
            }
        })
    }

});

/**
 * POST reorder pages
 */
router.post("/reorder-pages", function (req, res) {
    var ids = req.body['id[]'];
    var count = 0;
    for(var i = 0; i < ids.length; i++){
        var id = ids[i];
        count++;
        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if(err)
                        return console.log(err);
                });
            });
        })(count);
    }
});



//Exports
module.exports = router;
