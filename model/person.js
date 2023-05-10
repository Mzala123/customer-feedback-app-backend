const mongoose = require('mongoose')

var personSchema = new mongoose.Schema({
   nationalId: {type: String, required: true},
   firstname: {type: String, required: true},
   lastname: {type: String, required: true},
   gender: {type: String, required: true},
   email: {type: String, required:true},
   phonenumber: {type: String, required:true},
   dob: {type: Date, required: true},
   age: {type: Number, required: false},
   profile_photo: {type:String, 'default': 'null photo'},
   address: {type:String, 'default':'N/A'},
   place_residence: {type: String, 'default':'N/A'},
   current_city: {type: String, 'default':'N/A'}
})

mongoose.model("person", personSchema)