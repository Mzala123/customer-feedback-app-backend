var express = require('express');
var router = express.Router();

// /* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


const ctrlAuth = require('../controllers/authentication')
const ctrlPerson = require('../controllers/person')

//create users from personal information and login end points

router.post('/register', ctrlAuth.register_user)
router.post('/login', ctrlAuth.login)
router.get('/employee_list', ctrlAuth.employee_list)

// end of auth end points

// create person end points 
router.post('/person', ctrlPerson.create_person_details)
router.get('/person', ctrlPerson.get_list_person);

module.exports = router;
