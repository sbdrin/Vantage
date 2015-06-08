var util = require('util');
var Common = require('../model/Common');
var baseDao = require('./baseDao.js');
//exports.emptyNote = { "_id": "", author: "", note: "" };
var Dao = function() {
    baseDao.call(this, Common);
}
Dao.prototype = util._extend({},baseDao.prototype);
util._extend(Dao.prototype,{
    constructer:Dao,
    deleteByName: function(name, callback) {
        this.Model.findOne({LayoutName:name},
        function(err, doc) {
            if (err) callback(err);
            else {
                doc.remove();
                callback(null);
            }
        });
    },
});
module.exports = new Dao();