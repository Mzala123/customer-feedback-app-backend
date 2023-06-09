var mongoose = require('mongoose')
const { token } = require('morgan')
var Feedback =mongoose.model('feedback')
var User = mongoose.model('User')



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
       feedback.How_satisfied_are_you_with_the_accessibility_and_availability_of_the_banks_branch_network_and_ATMs = req.body.selectedRating
       feedback.How_satisfied_are_you_with_the_level_of_security_provided_by_the_bank_for_your_transactions_and_personal_information = req.body.selectedRating1
       feedback.How_likely_are_you_to_recommend_the_National_Bank_of_Malawi_to_family_friends_or_colleagues = req.body.selectedRating2 

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
                response:1,
                How_satisfied_are_you_with_the_accessibility_and_availability_of_the_banks_branch_network_and_ATMs:1,
                How_satisfied_are_you_with_the_level_of_security_provided_by_the_bank_for_your_transactions_and_personal_information:1,
                How_likely_are_you_to_recommend_the_National_Bank_of_Malawi_to_family_friends_or_colleagues:1
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
            $match:{is_responded:{$eq:false}
            // $text: { $search: "atm customers transaction" }
            }
          
        },
        {
            $project:{
                type:1,
                title:1,
                description:1,
                date_submitted: { $dateToString:{format: "%Y-%m-%d %H:%M:%S", date: "$date_submitted" } },
                userId:1,
                is_responded:1,
                How_satisfied_are_you_with_the_accessibility_and_availability_of_the_banks_branch_network_and_ATMs:1,
                How_satisfied_are_you_with_the_level_of_security_provided_by_the_bank_for_your_transactions_and_personal_information:1,
                How_likely_are_you_to_recommend_the_National_Bank_of_Malawi_to_family_friends_or_colleagues:1
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
        // {
        //     $limit:7
        // }
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
                is_responded:1,
                response:1,
                How_satisfied_are_you_with_the_accessibility_and_availability_of_the_banks_branch_network_and_ATMs:1,
                How_satisfied_are_you_with_the_level_of_security_provided_by_the_bank_for_your_transactions_and_personal_information:1,
                How_likely_are_you_to_recommend_the_National_Bank_of_Malawi_to_family_friends_or_colleagues:1
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
                is_responded:1,
                How_satisfied_are_you_with_the_accessibility_and_availability_of_the_banks_branch_network_and_ATMs:1,
                How_satisfied_are_you_with_the_level_of_security_provided_by_the_bank_for_your_transactions_and_personal_information:1,
                How_likely_are_you_to_recommend_the_National_Bank_of_Malawi_to_family_friends_or_colleagues:1        
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

module.exports.count_all_feedbacks = (req, res)=>{
       Feedback
         .countDocuments({})
         .exec((err, feedback)=>{
            if(err){
                sendJSONresponse(res, 404, err)
            }else{
                sendJSONresponse(res, 200, {"count":feedback})
            }
         })
}

module.exports.count_feedbacks_by_type = function(req, res){
        Feedback
          .aggregate(
            [
             {$group:{
                    _id:'$type',
                    countBytype: {$count:{}},
                    totalFeedbacks: { $sum: 1 }
               }
             },
             {$sort: {'countBytype':1}}

            ]
           ).exec((err, data)=>{
            if(err){
                sendJSONresponse(res, 404, err)
            }else{
                const totalFeedbacks = data.reduce((total, doc) => total + doc.totalFeedbacks, 0); 
                const resultWithTotal = [...data, { _id: 'total', countByType: totalFeedbacks, totalFeedbacks }];
                sendJSONresponse(res, 200, resultWithTotal)
            }
           })
}

module.exports.total_count_customer_by_gender = (req, res)=>{
        User
          .aggregate(
            [
              {$match:{is_customer:{$eq:true}}},
              {
                $group:{
                    _id:'$gender',
                    countBytype:{$count:{}},
                    totalCustomers: {$sum:1}
                }
              }, {$sort: {'countBytype':1}}
            ]
          ).exec((err, data)=>{
              if(err){
                  sendJSONresponse(res, 401, err)
              }else{
              const totalCustomers = data.reduce((total, doc) => total + doc.totalCustomers, 0); 
              const resultWithTotal = [...data, { _id: 'total', countByType: totalCustomers, totalCustomers }];
              sendJSONresponse(res, 200, resultWithTotal);
               
              }
          })
}



module.exports.count_feedbacks_by_customer_gender = function(req, res){
       Feedback
          .aggregate(
            [
                {
                    $lookup:{
                        from: 'users',
                        localField:'userId',
                        foreignField:'_id',
                        as:'feedBackDocs'
                    }
                },
                {
                    $unwind: "$feedBackDocs"
                },
                {
                 $group:{
                    _id:'$feedBackDocs.gender',
                    countByGender:{ $count:{}},
                    totalFeedbacks: { $sum: 1 }
                 }
                },
                {$sort: {'countByGender':-1}},
               
            ]
          ).exec((err, data)=>{
               if(err){
                sendJSONresponse(res, 401, err)
               }else{
            
                const totalFeedbacks = data.reduce((total, doc) => total + doc.totalFeedbacks, 0); 
                const resultWithTotal = [...data, { _id: 'total', countByGender: totalFeedbacks, totalFeedbacks }];
                sendJSONresponse(res, 200, resultWithTotal);
              
               }
          })
}

module.exports.counts_my_feedbacks_by_type = (req, res)=>{
     const ObjectId = mongoose.Types.ObjectId
     let userId = req.params.userId
     Feedback
       .aggregate(
        [
            {
                $match:{userId:{$eq:ObjectId(userId)}}
            },
            {
                $group:{
                    _id:'$type',
                    countBytype:{$count:{}},
                    totalFeedbacks: { $sum: 1 }
                }
            },
            {$sort: {'countBytype':-1}}
        ]).exec((err, data)=>{
            if(err){
                sendJSONresponse(res, 404, err)
            }else{
                const totalFeedbacks = data.reduce((total, doc) => total + doc.totalFeedbacks, 0); 
                const resultWithTotal = [...data, { _id: 'total', countByType: totalFeedbacks, totalFeedbacks }];
                sendJSONresponse(res, 200, resultWithTotal)
            }
        })
}


module.exports.counts_my_responded_unresponded_feedbacks = (req, res)=>{
     const ObjectId = mongoose.Types.ObjectId
     let userId = req.params.userId
     Feedback
       .aggregate(
        [
            {
                $match:{userId:{$eq:ObjectId(userId)}}
            },
            {
                $group:{
                    _id:{$toString:'$is_responded'},
                    countByIsresponded:{$count:{}},
                    totalFeedbacks: { $sum: 1 }
                }
            },
            {$sort: {'countByIsresponded':-1}}
        ]).exec((err, data)=>{
            if(err){
                sendJSONresponse(res, 404, err)
            }else{
                const totalFeedbacks = data.reduce((total, doc) => total + doc.totalFeedbacks, 0); 
                const resultWithTotal = [...data, { _id: 'total', countByType: totalFeedbacks, totalFeedbacks }];
                sendJSONresponse(res, 200, resultWithTotal)
            }
        })
}

module.exports.read_one_feedback_by_pk = (req, res)=>{
      const feedback_id = req.params.feedback_id
      const ObjectId = mongoose.Types.ObjectId
      Feedback
        .aggregate([
            {
                $match:{_id: {$eq:ObjectId(feedback_id)}}
            },
          
            {
                $project:{
                    type:1,
                    title:1,
                    description:1,
                    date_submitted: { $dateToString:{format: "%Y-%m-%d %H:%M:%S", date: "$date_submitted" } },
                    userId:1,
                    is_responded:1,
                    response:1,
                    How_satisfied_are_you_with_the_accessibility_and_availability_of_the_banks_branch_network_and_ATMs:1,
                    How_satisfied_are_you_with_the_level_of_security_provided_by_the_bank_for_your_transactions_and_personal_information:1,
                    How_likely_are_you_to_recommend_the_National_Bank_of_Malawi_to_family_friends_or_colleagues:1
                }
            },
             {
               $lookup:{
                from:'users',
                localField:'userId',
                foreignField:'_id',
                as:'feedbackDocs'
               }
            },
            {
                $unwind:"$feedbackDocs"
            }
        ]).exec((error, data)=>{
            if(error){
                sendJSONresponse(res, 401, error)
            }else{
                sendJSONresponse(res, 200, data[0])
            }
        })
}