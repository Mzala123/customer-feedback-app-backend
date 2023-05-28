
var mongoose = require('mongoose')

var feedbackSchema = new mongoose.Schema({
    type:{type: String, required:true},
    title:{type: String, required: true},
    description:{type: String, required:true},
    date_submitted:{type: Date, 'default': Date.now()},
    is_responded:{type: Boolean, 'default':'false'},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true}
})

mongoose.model('feedback', feedbackSchema)