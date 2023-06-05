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

    var person = Person()
    person.nationalId = req.body.nationalId
    person.firstname = req.body.firstname
    person.lastname = req.body.lastname
    person.gender = req.body.gender
    person.phonenumber = req.body.phonenumber
    person.email = req.body.email
    person.dob= req.body.dob

    person.save(function(err){
        if (err) {
            sendJSONresponse(res, 404, { "err": err, "message": "Failed to create patient record" })
          } else {
            sendJSONresponse(res, 201, { "message": "person record created" });
      
          }
    })
    
     
}

module.exports.get_list_person = (req, res)=>{
            Person
            .find({})
            .exec()
            .then(function(person){
                sendJSONresponse(res, 200, person)
            }).catch((err)=>{
                sendJSONresponse(res, 404, err)
            })

}