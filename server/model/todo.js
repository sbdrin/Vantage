var mongoose = require('mongoose');
mongoose.model('todo', new mongoose.Schema({
    title: String,
    finished: {
        type: Boolean,
    default:
        false
    },
    post_date: {
        type: Date,
    default:
        Date.now
    }
}));
module.exports = mongoose.model('todo'); 