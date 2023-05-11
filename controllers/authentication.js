var mongoose = require('mongoose')
const { token } = require('morgan')
var User =mongoose.model('User')
var passport = require('passport')
//var {urid} = require('urid')
const { randomBytes } = require('crypto');



var sendJSONresponse = function (res, status, content) {
    res.status(status)
    res.json(content)
}

module.exports.register_user = async(req, res)=>{
    if(!req.body.national_id || !req.body.first_name || !req.body.last_name || !req.body.gender
         || !req.body.dob || !req.body.email){
            sendJSONresponse(res, 404, {"message":"please fill in all required fields"})
    }

    var user = new User()
    password = Math.random().toString(36).slice(-8)

    user.setPassword(password)
   
    user.national_id = req.body.national_id
    user.first_name = req.body.first_name
    user.email = req.body.email
    user.last_name = req.body.last_name
    user.gender = req.body.gender
    user.dob = req.body.dob
    user.phone_number = req.body.phone_number
    user.profile_photo= req.body.profile_photo
    user.address = req.body.address
    user.place_residence = req.body.place_residence
    user.current_city = req.body.current_city
    user.user_type = req.body.user_type
    
    User
      .findOne({email: req.body.email})
      .exec()
      .then(async(user_detail)=>{
        if(user_detail){
            sendJSONresponse(res, 200, {"message":"User or Person wich such email already exists"})
        }else{
            if(req.body.user_type === 'Enquiry Personnel' || req.body.user_type === 'Admin'){
              
               let id =  Math.random(36).toString().toUpperCase().slice(-8) //+ randomBytes(6).toString('hex')+ new Date().getTime();
               let unique = true
               while(unique){
                const emp = await User.findOne({person_no:id})
                if(!emp){
                    unique = false
                }
               }

               var is_employee = true
               user.is_employee = is_employee

               user.person_no = id
              
               user.save(function(err){
                var token
                if(err){
                    sendJSONresponse(res, 400, err)
                }else{
                    token = user.generateJwt()
                    sendJSONresponse(res, 201,{"token":token, "user":user})
                }
               })
                
            }else{
                var is_customer = true
                user.is_customer = is_customer
                var user_type = "Customer"
                user.user_type = user_type

                let id =  Math.random(36).toString().toUpperCase().slice(-8) //+ randomBytes(6).toString('hex')+ new Date().getTime();
                let unique = true
                while(unique){
                 const cus = await User.findOne({person_no:id})
                 if(!cus){
                     unique = false
                 }
                }
               user.person_no = id 
               user.save(function(err){
                    var token
                    if(err){
                        sendJSONresponse(res, 400, err)
                    }else{
                        token = user.generateJwt()
                        sendJSONresponse(res, 201,{"token":token, "user":user})
                    }
                   })
            }
        }
      })


}

module.exports.login = (req, res)=>{
    if(!req.body.email || !req.body.password){
        sendJSONresponse(res, 400, {
            "message": "All fields are required"
        })
        return;
    }
    passport.authenticate('local', function(err, user, info){
        var token
        if(err){
            sendJSONresponse(res, 400, err)
            return;
        }if(user){
            token = user.generateJwt()
            sendJSONresponse(res, 200,{
                "token":token,
                "name":user.first_name+" "+user.last_name, "email":user.email, "_id":user._id
            })
        }else{
            sendJSONresponse(res, 401, {"message":info})
        }
    })(req, res);
    
}


module.exports.employee_list = function(req, res){
    User
      .find({is_employee:true},{
        national_id:1,
        first_name:1,
        last_name:1,
        gender:1,
        age:{ $dateDiff: { startDate: "$dob", endDate: "$$NOW", unit: "year" } },
        dob: { $dateToString:{format: "%Y-%m-%d", date: "$dob" } },
        profile_photo:1,
        address:1,
        current_city:1,
        email:1,
        user_type:1,
        person_no:1
      })
      .exec(function(err, user){
        if(err){
            sendJSONresponse(res, 404, err)
        }else{
            sendJSONresponse(res, 200, user)
        }
      })
}