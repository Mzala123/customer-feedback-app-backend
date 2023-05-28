var express = require('express');
var router = express.Router();

// /* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


const ctrlAuth = require('../controllers/authentication')
const ctrlPerson = require('../controllers/person')
const ctrlFeedBack = require('../controllers/feedback')

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
router.get('/my_feedback_list/:userId', ctrlFeedBack.my_feedback_list)


module.exports = router;
