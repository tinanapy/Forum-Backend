const router = require('express').Router();
const auth = require('../middleware/auth');

const { createUser, getUsers, getUserById, login } = require('./user.controller');

router.post("/", createUser);
router.get("/all", getUsers); //use get coz we r taking the data from the database and it tells how many users are there
router.get("/",auth, getUserById);
router.post("/login", login);
// "firstName": "tina", 
//    "lastName": "Anbesu",
//     "userName": "tina_AB",
//     " email": "tenananbessu1@gmail.com",
//      "password":10807339
module.exports = router;