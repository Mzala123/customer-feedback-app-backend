var express = require('express');
var router = express.Router();

// /* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


const upload = require('../services/upload')

const ctrlAuth = require('../controllers/authentication')
const ctrlPerson = require('../controllers/person')
const ctrlFeedBack = require('../controllers/feedback')
const ctrlImage = require('../controllers/image')


//create users from personal information and login end points

router.post('/register', ctrlAuth.register_user)
router.post('/login', ctrlAuth.login)
router.get('/employee_list', ctrlAuth.employee_list)
router.get('/list_archived_accounts',ctrlAuth.list_archived_accounts)
router.get('/read_one_user/:userid', ctrlAuth.read_one_user)

router.put('/update_user/:userid', ctrlAuth.update_user)
router.put('/update_usertype/:userid', ctrlAuth.update_usertype)

router.put('/update_user_password/:userid', ctrlAuth.update_user_password)

router.delete('/remove_user/:userid', ctrlAuth.remove_user)
router.put('/remove_user_via_update/:userid', ctrlAuth.remove_user_via_update)
router.put('/unarchive_user_accounts/:userid', ctrlAuth.unarchive_user_accounts)


router.get('/read_users_count_by_userrole', ctrlAuth.read_users_count_by_userrole)
router.get('/read_users_by_gender', ctrlAuth.read_users_by_gender)
router.get('/read_count_all_users_in_system', ctrlAuth.read_count_all_users_in_system)

// end of auth end points

// create person end points 
router.post('/person', ctrlPerson.create_person_details)
router.get('/person', ctrlPerson.get_list_person);


// Feedback end points
router.post('/feedback', ctrlFeedBack.create_feedback)
router.get('/feedback_unresponded_list', ctrlFeedBack.feedback_unresponded_list)
router.get('/feedback_responded_list', ctrlFeedBack.feedback_responded_list)

router.get('/my_responded_queries_list/:userId', ctrlFeedBack.my_responded_queries_list)
router.get('/my_unresponded_queries_list/:userId', ctrlFeedBack.my_unresponded_queries_list)

router.get('/read_one_feedback_by_pk/:feedback_id', ctrlFeedBack.read_one_feedback_by_pk)

router.post('/feedback/:feedbackId/create_response', ctrlFeedBack.create_response)

router.get('/count_all_feedbacks', ctrlFeedBack.count_all_feedbacks)
router.get('/count_feedbacks_by_type', ctrlFeedBack.count_feedbacks_by_type)
router.get('/count_feedbacks_by_customer_gender', ctrlFeedBack.count_feedbacks_by_customer_gender)
router.get('/total_count_customer_by_gender', ctrlFeedBack.total_count_customer_by_gender)

router.get('/counts_my_feedbacks_by_type/:userId', ctrlFeedBack.counts_my_feedbacks_by_type)
router.get('/counts_my_responded_unresponded_feedbacks/:userId',ctrlFeedBack.counts_my_responded_unresponded_feedbacks)

router.post('/upload_image',upload.single("picture"), ctrlImage.uploadImage)



module.exports = router;
