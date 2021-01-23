const mongoose = require('mongoose');

let tweetScheme = new mongoose.Schema({
    input : {
        type : String,
        required : true
    },
    user : String
})

module.exports = mongoose.model('Tweet', tweetScheme);