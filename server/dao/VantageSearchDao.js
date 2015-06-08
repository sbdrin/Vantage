var util = require('util');
var Todo = require('../model/todo');
var baseDao = require('./baseDao.js');
//exports.emptyNote = { "_id": "", author: "", note: "" };
var Dao = function() {
    baseDao.call(this, Todo);
}
Dao.prototype = util._extend({},baseDao.prototype);
util._extend(Dao.prototype,{
    constructer:Dao
    //custom method
});
module.exports = new Dao();