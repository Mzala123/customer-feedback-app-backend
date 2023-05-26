var mongoose = require('mongoose')
var crypto = require('crypto')
var jwt = require('jsonwebtoken')

var userSchema = new mongoose.Schema({
   national_id: {type: String, required: true},
   first_name: {type: String, required: true},
   last_name: {type: String, required: true},
   gender: {type: String, required: true},
   email: {type: String,
           required:true,
           unique:true
        },
   phone_number: {type: String},
   dob: {type: Date, required: true},
   age: {type: Number, required: false},
   profile_photo: {type:String, 'default': 'null photo'},
   address: {type:String, 'default':'N/A'},
   place_residence: {type: String, 'default':'N/A'},
   current_city: {type: String, 'default':'N/A'},
   is_customer: {type: Boolean, 'default':'false'},
   is_employee: {type: Boolean, 'default':'false'},
   created_at: {type: Date, 'default': Date.now()},
   user_type: {type: String},
   last_login: {type: Date},
   person_no:{type:String, required:true},
   is_deleted:{type: Boolean, 'default':false},
   hash: String,
   salt: String
   
})

userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex')
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('base64'); 
}

userSchema.methods.validPassword = function(password){
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('base64');
    return this.hash === hash
}

userSchema.methods.generateJwt = function(){
    var expiry = new Date()
    expiry.setDate(expiry.getDate()+7);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        first_name: this.first_name,
        last_name:this.last_name,
        exp: parseInt(expiry.getTime()/1000),
    }, process.env.JWT_SECRET)
}

mongoose.model('User', userSchema)