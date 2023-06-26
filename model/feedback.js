
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
    How_satisfied_are_you_with_the_accessibility_and_availability_of_the_banks_branch_network_and_ATMs:{type:Number},
    How_satisfied_are_you_with_the_level_of_security_provided_by_the_bank_for_your_transactions_and_personal_information:{type:Number},
    How_likely_are_you_to_recommend_the_National_Bank_of_Malawi_to_family_friends_or_colleagues: {type: Number},
    response: [responseSchema]
})

mongoose.model('feedback', feedbackSchema)