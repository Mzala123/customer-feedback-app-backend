var mongoose = require('mongoose')
const { token } = require('morgan')
var User =mongoose.model('User')
var passport = require('passport')

const { randomBytes } = require('crypto');
var nodemailer = require("nodemailer");
const { send } = require('process');



var sendJSONresponse = function (res, status, content) {
    res.status(status)
    res.json(content)
}

var transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        type:'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.CLIENTID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN
    }
})

module.exports.register_user = (req, res)=>{
    if(!req.body.national_id || !req.body.first_name || !req.body.last_name || !req.body.gender
         || !req.body.dob || !req.body.email){
            sendJSONresponse(res, 404, {"message":"please fill in all required fields!"})
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

    let mailOptions = {
        from: 'zackxbaby@gmail.com',
        to: req.body.email,
        subject: "User account credentials",
        text: 'username: '+req.body.email +'\r\nuser password: '+password
    }
    
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
                  
                    transporter.sendMail(mailOptions, function(err, data){
                        if(err){
                            sendJSONresponse(res, 404, err)
                        }else{
                            sendJSONresponse(res, 201, {"message":"User Account created, check your email for credentials", 'user':user})
                        }
                     })
                }

               })
            }
            else{
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
                            transporter.sendMail(mailOptions, function(err, data){
                                if(err){
                                    sendJSONresponse(res, 404, err)
                                }else{
                                    sendJSONresponse(res, 201, {"message":"User Account created check your email for credentials", 'user':user})
                                }
                            })
                        
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
                "user":user
            })
        }else{
            sendJSONresponse(res, 401, {"message":info})
        }
    })(req, res);
    
}


module.exports.employee_list = function(req, res){
    User
      .find({is_deleted:false, user_type:{$ne:'Admin'}},{
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

module.exports.list_archived_accounts = (req, res)=>{
    User
     .find({is_deleted:true, user_type:{$ne:'Admin'} },
     {
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
        person_no:1,
        is_deleted:1
     }).exec(function(err, user){
        if(err){
            sendJSONresponse(res, 404, err)
        }else{
            sendJSONresponse(res, 200, user)
        }
     })
     
}

module.exports.read_one_user = (req, res)=>{
    if(!req.params.userid){
        sendJSONresponse(res, 404,{"message":"user id required"})
    }else if(req.params && req.params.userid){
        User
         .aggregate([
            {$match: {_id: mongoose.Types.ObjectId(req.params.userid)}},
            {
                $project:{
                    national_id:1,
                    first_name:1,
                    last_name:1,
                    gender:1,
                    age: { $dateDiff: { startDate: "$dob", endDate: "$$NOW", unit: "year" } },
                    dob: { $dateToString: { format: "%Y-%m-%d", date: "$dob" } },
                    profile_photo:1,
                    current_city:1,
                    phone_number:1,
                    place_residence:1,
                    email:1,
                    user_type:1,
                    person_no:1,
                    address:1
                }
            }
         ]).exec(function(err, user){
            if(!user){
             sendJSONresponse(res, 404, {"message":"user not found"})
            }else if(err){
               sendJSONresponse(res, 404, err)
            }else{
                sendJSONresponse(res, 200, user[0])
            }
         })
    }else{
       sendJSONresponse(res, 404, {"message":"not found, user id required"})
    }
}

module.exports.update_user =(req, res)=>{

    if(!req.body.national_id || !req.body.first_name || !req.body.last_name || !req.body.gender
        || !req.body.dob || !req.body.email){
           sendJSONresponse(res, 404, {"message":"please fill in all required fields!"})
   }

   let national_id = req.body.national_id
   let first_name = req.body.first_name
   let email = req.body.email
   let last_name = req.body.last_name
   let gender = req.body.gender
   let dob = req.body.dob
   let phone_number = req.body.phone_number
   let profile_photo= req.body.profile_photo
   let address = req.body.address
   let place_residence = req.body.place_residence
   let current_city = req.body.current_city
  

    if(!req.params.userid){
      sendJSONresponse(res, 404, {"message":"User id is required"})
    }else if(req.params && req.params.userid){

        User.updateOne({_id: req.params.userid},
            {
                $set:{
                    national_id: national_id,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    gender: gender,
                    dob: dob,
                    phone_number: phone_number,
                    profile_photo: profile_photo,
                    address: address,
                    place_residence: place_residence,
                    current_city: current_city
                }

            }
            ).exec(function(err){
                 if(err){
                    sendJSONresponse(res, 404, err)
                 }else{
                    sendJSONresponse(res, 200, {"message":"user record updated!"})
                 }
            })

    }
}

module.exports.update_usertype = (req, res)=>{
    let user_type = req.body.user_type
    if(!req.params.userid){
        sendJSONresponse(res, 404, {"message":"Not found, user id is required"})
        return
    }else if(req.params && req.params.userid){
        User
         .updateOne({_id:req.params.userid},
            {
                $set:{
                    user_type: user_type
                }
            }
        ).exec(function(err){
            if(err){
                sendJSONresponse(res, 404, err)
            }else{
                sendJSONresponse(res, 200, {"message":"User record updated successfully!"})
            }
        })
    } 
    
}

module.exports.update_user_password = (req, res)=>{
    if(!req.params.userid){
        sendJSONresponse(res, 404, {"message":"Not found, user id is required"})
        return
    }
    User
     .findById(req.params.userid)
     .exec(function(err, user){
         if(err){
             sendJSONresponse(res, 404, err)
             return
         }else if(!user){
             sendJSONresponse(res, 404, {"message":"userid not found"})
             return
         }else{
            user.setPassword(req.body.password)
         }
       user.save(function(err){
           if(err){
               sendJSONresponse(res, 404, err)
           }else{
              sendJSONresponse(res, 200, {"message":"password updated successfully"})
           }
       })
     })
}

module.exports.remove_user_via_update = (req, res)=>{
    
    if(!req.params.userid){
        sendJSONresponse(res, 404, {"message":"Not found, user id is required"})
        return
    }else if(req.params && req.params.userid){
        User
         .updateOne({_id:req.params.userid},
            {
                $set:{
                    is_deleted: true
                } 
            }).exec((err, user)=>{
                if(err){
                    sendJSONresponse(res, 404, err)
                }else{
                    sendJSONresponse(res, 200, {"message":"is deleted is false now!"})
                }
            })    
    }
}

module.exports.remove_user = (req, res)=>{
      let userid = req.params.userid
      if(userid){
        User
         .findByIdAndRemove(userid)
         .exec(function(err, user){
            if(err){
                sendJSONresponse(res, 404, err)
            }else{
                sendJSONresponse(res, 204, null)
            }
         })
      }else{
        sendJSONresponse(res, 404, {"message":"userid is required"})
      }
}

module.exports.read_users_count_by_userrole = (req, res)=>{
    User
     .aggregate([
        {$unwind:'$user_type'},
        {
            $group:{
                _id:'$user_type',
                user_type_count:{$count:{}}
            }
        },
        {$sort:{'user_type_count':1}}
     ]).exec(function(err, user){
        if(err){
            sendJSONresponse(res, 404, err)
        }else{
            sendJSONresponse(res, 200, user)
        }
     })
}

module.exports.read_count_all_users_in_system = (req,res)=>{
     User
     .countDocuments({})
     .exec((err,user)=>{
       if(err){
         sendJSONresponse(res, 401, err)
       }else if(user){
          sendJSONresponse(res, 200, {"count":user})
       }
     })
}

module.exports.read_users_by_gender = (req, res)=>{
    User
     .aggregate([
        {$group:{
             _id:'$gender',
             countByGender: {$count:{}}
        }
       },
       {$sort: {'countByGender':1}}
     ]).exec(function(err, userGender){
        if(err){
            sendJSONresponse(res, 404, err)
        }else{
            sendJSONresponse(res, 200, userGender)
        }
     })
}

module.exports.unarchive_user_accounts=(req, res)=>{
          
}