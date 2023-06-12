
var mongoose = require('mongoose')

var responseSchema = new mongoose.Schema({
    response_description : {type: String, required:true},
    userId:{type:mongoose.Schema.Types.ObjectId, required:true},
    submission_date:{type:Date, "default":Date.now()}
})

var feedbackSchema = new mongoose.Schema({
    type:{type: String, required:true},
    title:{type: String, required: true},
    description:{type: String, required:true},
    date_submitted:{type: Date, 'default': Date.now()},
    is_responded:{type: Boolean, 'default':'false'},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true},
    response: [responseSchema]
})

mongoose.model('feedback', feedbackSchema)