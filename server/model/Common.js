var mongoose = require('mongoose');
mongoose.model('layout', new mongoose.Schema({
    Module: String,
    LayoutName: String,
    LayoutCriteria: String,
    UserID: {
        type: String,
    default:
        'YL27264'
    },
    IsDefault: {
        type: Number,
    default:
        0
    }
}));
module.exports = mongoose.model('layout'); 