var mongoose = require('mongoose')
var Person = mongoose.model('person')


var sendJSONresponse = function (res, status, content) {
    res.status(status)
    res.json(content)
}
  

module.exports.create_person_details = async (req, res)=>{
    if(!req.body.nationalId || !req.body.firstname || !req.body.lastname || !req.body.gender
        || !req.body.phonenumber || !req.body.dob || !req.body.email){
            sendJSONresponse(res, 404, {"message":"please fill in all required fields"})
    }

    Person.insertMany({
        nationalId : req.body.nationalId,
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        gender : req.body.gender,
        email : req.body.email,
        phonenumber : req.body.phonenumber,
        dob : req.body.dob,
        //person.age = 
        profile_photo : req.body.profile_photo,
        address : req.body.address,
        place_residence : req.body.place_residence,
        current_city : req.body.current_city
    }
    ).then((person)=>{
        sendJSONresponse(res, 201, {"message":"Person record created", person})
    }).catch((error)=>{
        sendJSONresponse(res, 404, {"err":error, "message":"Failed to create a person record"})
    })
     
}

module.exports.get_list_person = (req, res)=>{

}