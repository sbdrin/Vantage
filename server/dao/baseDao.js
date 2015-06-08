module.exports = function(Model){
   if (this.constructer.instance) {
        return this;
    }
    this.constructer.instance = this;
    this.Model = Model;
}
module.exports.prototype =
{
    add: function(item, callback) {
        var newModel = new this.Model();
        for(var i in item){
            item[i] && (newModel[i.replace(/^[a-z]/,function(m){return m.toUpperCase()})] = item[i]);
        }
        newModel.save(function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    },
    delete: function(id, callback) {
        this.Model.findById(id,
        function(err, doc) {
            if (err) callback(err);
            else {
                doc.remove();
                callback(null);
            }
        });
    },
    edit: function(item, callback) {
        this.Model.findById(item.id,
        function(err, doc) {
            if (err) callback(err);
            else {
                doc.post_date = new Date();
                for (var p in doc) {
                    if(item.hasOwnProperty(p)){
                        doc[p] = item[p];
                    }
                }
                doc.save(function(err) {
                    if (err) {
                        callback(err);
                    } else callback(null);
                });
            }
        });
    },
    findAll: function(callback) {
        this.Model.find({},callback);
    },
    findById: function(id, callback) {
        this.Model.findOne({
            _id: id
        },
        function(err, doc) {
            if (err) {
                callback(err, null);
            }
            callback(null, doc);
        });
    }
};