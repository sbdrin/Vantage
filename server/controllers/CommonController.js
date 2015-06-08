"use strict";

var db = require('../dao/CommonDao');

module.exports = {
    get:[],
    post:[],
    saveLayout:function(item, req, res, next){
        var layout = JSON.parse(new Buffer(item.LayOutEntity, 'base64').toString());
        layout.layoutCriteria = JSON.stringify(layout.layoutCriteria);
        db.add(layout,
        function(err, row) {
            if (err) {
                return next(err);
            }
            res.send(true);
        });
    },
    deleteLayout:function(item, req, res, next){
        var layouts = JSON.parse(new Buffer(item.LayOutEntity, 'base64').toString());
        for (var layoutName in layouts.layoutNames) {
            db.deleteByName(layouts.layoutNames[layoutName],
                function(err, row) {
                if (err) {
                    return next(err);
                }
            });
        }
         res.send(true);
    }
}