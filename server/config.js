"use strict";

module.exports = {
    debug: true,
    port: process.env.PORT,
    db: 'mongodb://' + process.env.IP + ':27017/vision',
    routes:{
    	VantageSearch: require('./controllers/VantageSearchController'),
    	Common: require('./controllers/CommonController')
    }
}