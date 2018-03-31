var express = require('express');
var router = express.Router();

/**
 * Get Pages Index
 */
router.get("/", function (req, res) {
    res.send('admin area');
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
    var slug = req.body.slug;
    var content = req.body.content;
    var errors = req.validationErrors();
    if(errors){
        res.render('admin/add_page',{
            title: title,
            slug: slug,
            content: content
        })
    }else{
        console.log('success!');
    }

});

//Exports
module.exports = router;
