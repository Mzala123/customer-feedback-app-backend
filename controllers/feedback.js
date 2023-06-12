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

module.exports.create_response = (req, res)=>{
         var feedbackId = req.params.feedbackId
         if(feedbackId){
            Feedback
             .findById(feedbackId)
             .select('response')
             .exec(
                function(err, feedback){
                    if(err){
                        sendJSONresponse(res, 404, err)
                    }else{
                        addResponse(req, res, feedback)
                        if(feedback){
                            Feedback
                            .updateOne({_id:feedbackId},{
                               $set:{
                                   is_responded:true
                               }
                           }).exec((err, feedback)=>{
                               if(err){
                                 sendJSONresponse(res, 401, err)
                               }else{
                                 sendJSONresponse(res, 201, {"message":" response created, feedback updated!"})
                               }
                           })
                        }
                    }
                }
             )
         }
}

const addResponse = (req, res, feedback)=>{
       if(!feedback){
        sendJSONresponse(res, 404, {'message':"feedback not found!"});
       }else{
           feedback.response.push({
            response_description: req.body.response_description,
            userId: req.body.userId
           })
           feedback
            .save(function(err, feedback){
                var thisFeedback
                if(err){
                    sendJSONresponse(res, 400, err)
                }else{
                    thisFeedback = feedback.response[feedback.response.length-1]
                    //sendJSONresponse(res, 201, thisFeedback)
                }
            })
       }
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
                date_submitted: { $dateToString:{format: "%Y-%m-%d %H:%M:%S", date: "$date_submitted" } },
                userId:1,
                is_responded:1,
                response:1
            }
        },
        {
            $lookup:{
                from: 'users',
                localField:'userId',
                foreignField:'_id',
                as:'feedBackDocs'
            }
        },
        {
            $unwind:"$feedBackDocs"
        }
     ]).exec((err, data)=>{
        if(err){
            sendJSONresponse(res, 401, err)
        }else{
            sendJSONresponse(res, 200, data)
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
                date_submitted: { $dateToString:{format: "%Y-%m-%d %H:%M:%S", date: "$date_submitted" } },
                userId:1,
                is_responded:1
            }
        },
        {
            $lookup:{
                from: 'users',
                localField:'userId',
                foreignField:'_id',
                as:'feedBackDocs'
            }
        },
        {
            $unwind:"$feedBackDocs"
        }
     ]).exec((err, data)=>{
        if(err){
            sendJSONresponse(res, 401, err)
        }else{
            sendJSONresponse(res, 200, data)
        }
     })
    
}

module.exports.my_responded_queries_list = (req, res)=>{
    const ObjectId = mongoose.Types.ObjectId
    let userId = req.params.userId
    Feedback
     .aggregate([
        {
            $match:{userId:{$eq:ObjectId(userId)}, is_responded:true}
        },
        {
            $project:{
                type:1,
                title:1,
                description:1,
                date_submitted: { $dateToString:{format: "%Y-%m-%d %H:%M:%S", date: "$date_submitted" } },
                userId:1,
                is_responded:1
            }
        },
        {
            $unwind:"$feedBackDocs"
        }
     ]).exec((err, data)=>{
        if(err){
            sendJSONresponse(res, 401, err)
        }else{
            sendJSONresponse(res, 200, data[0])
        }
     })
}

module.exports.my_unresponded_queries_list = (req, res)=>{
    const ObjectId = mongoose.Types.ObjectId
    let userId = req.params.userId
    Feedback
     .aggregate([
        {
            $match:{userId:{$eq:ObjectId(userId)}, is_responded:false}
        },
        {
            $project:{
                type:1,
                title:1,
                description:1,
                date_submitted: { $dateToString:{format: "%Y-%m-%d %H:%M:%S", date: "$date_submitted" } },
                userId:1,
                is_responded:1
                 
            }
        },
        {
            $lookup:{
                from: 'users',
                localField:'userId',
                foreignField:'_id',
                as:'feedBackDocs'
            }
        },
        {
            $unwind:"$feedBackDocs"
        }
     ]).exec((err, data)=>{
        if(err){
            sendJSONresponse(res, 401, err)
        }else{
            sendJSONresponse(res, 200, data)
        }
     })
}