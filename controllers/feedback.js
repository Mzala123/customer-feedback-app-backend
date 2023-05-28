var mongoose = require('mongoose')
const { token } = require('morgan')
var Feedback =mongoose.model('feedback')



var sendJSONresponse = function (res, status, content) {
    res.status(status)
    res.json(content)
}


module.exports.create_feedback = (req, res)=>{
       if(!req.body.type || !req.body.title || !req.body.description || !req.body.userId ){
        sendJSONresponse(res, 404, {"message":"Please fill in all required fields"})
       }

       var feedback = new Feedback()
       feedback.type = req.body.type
       feedback.title = req.body.title
       feedback.description = req.body.description
       feedback.userId = req.body.userId

       feedback
        .save((err)=>{
            if(err){
                sendJSONresponse(res, 404, err)

            }else{
                sendJSONresponse(res, 201, {"message":"feedback submitted successfully"});
            }

        })
}

module.exports.feedback_responded_list = (req, res)=>{
    Feedback
     .aggregate([
        {
            $match:{is_responded:{$eq:true}}
        },
        {
            $project:{
                type:1,
                title:1,
                description:1,
                date_submitted: { $dateToString:{format: "%Y-%m-%d", date: "$date_submitted" } },
                userId:1
            }
        },
        {
            $lookup:{
                from: 'users',
                localField:'userId',
                foreignField:'_id',
                as:'feedBackDocs'
            }
        }
     ]).exec((err, data)=>{
        if(err){
            sendJSONresponse(res, 401, err)
        }else{
            sendJSONresponse(res, 200, data[0])
        }
     })

}

module.exports.feedback_unresponded_list = (req, res)=>{
    Feedback
     .aggregate([
        {
            $match:{is_responded:{$eq:false}}
        },
        {
            $project:{
                type:1,
                title:1,
                description:1,
                date_submitted: { $dateToString:{format: "%Y-%m-%d", date: "$date_submitted" } },
                userId:1
            }
        },
        {
            $lookup:{
                from: 'users',
                localField:'userId',
                foreignField:'_id',
                as:'feedBackDocs'
            }
        }
     ]).exec((err, data)=>{
        if(err){
            sendJSONresponse(res, 401, err)
        }else{
            sendJSONresponse(res, 200, data)
        }
     })
    
}

module.exports.my_feedback_list = (req, res)=>{
    const ObjectId = mongoose.Types.ObjectId
    let userId = req.params.userId
    Feedback
     .aggregate([
        {
            $match:{userId:{$eq:ObjectId(userId)}}
        },
        {
            $project:{
                type:1,
                title:1,
                description:1,
                date_submitted: { $dateToString:{format: "%Y-%m-%d", date: "$date_submitted" } },
                userId:1
            }
        }
     ]).exec((err, data)=>{
        if(err){
            sendJSONresponse(res, 401, err)
        }else{
            sendJSONresponse(res, 200, data[0])
        }
     })
}