"use strict";

var db = require('../dao/CommonDao');

module.exports = {
    get:[],
    post:[],
    index: function(item, req, res, next) {
        db.findAll(function(err, layouts) {
            if (err) {
                return next(err);
            }
            res.render('VantageSearch/index', {
                ViewBag: {layouts:JSON.stringify(layouts)},
                layout: 'layout_empty'
            });
        });
    },

    add: function(item, req, res, next) {
        var title = item.title || '';
        title = title.trim();
        if (!title) {
            return res.render('error.html', {
                message: '标题是必须的'
            });
        }
        db.add(item,
        function(err, row) {
            if (err) {
                return next(err);
            }
            res.redirect('/todo/index');
        });
    },
    view: function(item, req, res, next) {
        res.redirect('/todo/index');

    },
    edit: function(item, req, res, next) {
        db.findById(item.id,
        function(err, row) {
            if (err) {
                return next(err);
            }
            if (!row) {
                return next();
            }
            res.render('todo/edit.html', {
                todo: row
            });
        });
    },
    save: function(item, req, res, next) {
        item.title = (item.title || '').trim();
        if (!item.title) {
            return res.render('error.html', {
                message: '标题是必须的'
            });
        }
        db.edit(item,
        function(err, result) {
            if (err) {
                return next(err);
            }
            res.redirect('/todo/index');
        });
    },
    delete: function(item, req, res, next) {
        db.delete(item.id,
        function(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/todo/index');
        });
    },
    finish: function(item, req, res, next) {
        item.finished = item.status === 'yes' ? true: false;
        db.edit(item,
        function(err, result) {
            if (err) {
                return next(err);
            }
            res.redirect('/todo/index');
        });
    }
}