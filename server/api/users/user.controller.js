const {  register,  getAllUsers,  getUserByEmail,  profile,  userById,} = require("./user.service");
const pool = require("../../config/database");
const bcrypt = require("bcryptjs"); //npm i bcryptjs for hiding password which creates the database
const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = {
  createUser: (req, res) => {
    //The user input data (username, first name, last name, email, password) is extracted from req.body.
    const { userName, firstName, lastName, email, password } = req.body;
    // console.log(req.body); will show the data from request that comes from the body
    console.log(req.body);
    console.log("Received request to create user:", req.body);
    // console.log("User Data:", { userName, firstName, lastName, email, password });
    //hulum data kalgeba return res.status(400).json({ msg: "Not all fields have been provided" });
    if (!userName || !firstName || !lastName || !email || !password) {
      console.log(email);
      return res.status(400).json({ msg: "Not all fields have been provided" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 8 characters" });
    }

    //The code starts by executing a SELECT query on the registration table to check if an account with the provided email already exists
    pool.query(
      `SELECT * FROM registration WHERE user_email = ?`,
      [email],
      (err, results) => {
        if (err) {
          return res.status(400).json({ msg: "database connection error" });
        }
        if (results.length > 0) {
          return res
            .status(400)
            .json({ msg: "An account with this email already exists" });
        } else {
          //bcrypt used to hide the password on the database on zamper
          const salt = bcrypt.genSaltSync();
          req.body.password = bcrypt.hashSync(password, salt);
          //The resulting hashed password is then assigned to req.body.password, replacing the original plain-text password

          //The register function is called with req.body as the first argument, which contains the user data (userName, firstName, lastName, email, and password). The second argument is a callback function that will be executed once the registration process is completed
          register(req.body, (err, results) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ msg: "database connection err" });
            }

            pool.query(
              `SELECT * FROM registration WHERE user_email = ?`,
              [email],
              (err, results) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ msg: "database connection err" });
                }
                //If the SELECT query is successful, the user_id from the results is assigned to req.body.userID: req.body.userID = results[0].user_id. This will be used to associate the user profile with the registered user.
                req.body.userId = results[0].user_id;
                console.log(req.body);
                profile(req.body, (err, results) => {
                  if (err) {
                    console.log(err);
                    res.status(500).json({ msg: "database connection err" });
                  }
                  return res.status(200).json({
                    msg: "New user added successfully",
                    results,
                    //this results will showup with" New user added successfully" msg on post man when we insert the data on postman
                  });
                });
              }
            );
          });
        }
      }
    );
  },

  //get info(data) from user.service->getAllUsers->SELECT user_id, user_name, user_email FROM registration datawen yametal
  getUsers: (req, res) => {
    getAllUsers((err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "database connection err" });
      }
      return res.status(200).json({ data: results });
    });
  },
  getUserById: (req, res) => {
    //const id=req.params.id;
    //console.log("id===>",req.id);
    userById(req.id, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "database connection err" });
      }
      if (!results) {
        return res.status(404).json({ msg: "Record not found" });
      }
      return res.status(200).json({ data: results });
    });
  },
  login: (req, res) => {
    const { email, password } = req.body;
    //validation
    if (!email || !password)
      return res
        .status(400)
        .json({ msg: "Not all fields have been provided!" });
    getUserByEmail(email, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ msg: "database connection err" });
      }
      if (!results) {
        return res
          .status(404)
          .json({ msg: "No account with this email has registered" });
      }
      const isMatch = bcrypt.compareSync(password, results.user_password);
      if (!isMatch) return res.status(404).json({ msg: "Invalid Credentials" });
      const token = jwt.sign({ id: results.user_id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.json({
        token,
        user: {
          id: results.user_id,
          display_name: results.user_name,

          },
      });
    });
  },
};

// module.exports = {
//   //This method is used to handle the logic for creating a new user based on the request (req) and response (res) objects
//   createUser: (req, res) => {
//     //The user input data (username, first name, last name, email, password) is extracted from req.body.
//     const { userName, firstName, lastName, email, password } = req.body;

//     console.table(req.body);
//     console.log("Received request to create user:", req.body);
//     // console.log("User Data:", { userName, firstName, lastName, email, password });

//     if (!userName || !firstName || !lastName || !email || !password) {
//       return res.status(400).json({ msg: "Not all fields have been provided" });
//     }

//     if (password.length < 8) {
//       return res
//         .status(400)
//         .json({ msg: "Password must be at least 8 characters" });
//     }

//     //The code starts by executing a SELECT query on the registration table to check if an account with the provided email already exists
//     pool.query(
//       `SELECT * FROM registration WHERE user_email = ?`,
//       [email],
//       (err, results) => {
//         if (err) {
//           return res.status(400).json({ msg: "database connection error" });
//         }
//         if (results.length > 0) {
//           return res
//             .status(400)
//             .json({ msg: "An account with this email already exists" });
//         } else {
//           const salt = bcrypt.genSaltSync();
//           req.body.password = bcrypt.hashSync(password, salt);
//           //The resulting hashed password is then assigned to req.body.password, replacing the original plain-text password

//           //The register function is called with req.body as the first argument, which contains the user data (userName, firstName, lastName, email, and password). The second argument is a callback function that will be executed once the registration process is completed
//           register(req.body, (err, results) => {
//             if (err) {
//               console.log(err);
//               return res.status(500).json({ msg: "database connection err" });
//             }

//             pool.query(
//               `SELECT * FROM registration WHERE user_email = ?`,
//               [email],
//               (err, results) => {
//                 if (err) {
//                   return res
//                     .status(500)
//                     .json({ msg: "database connection err" });
//                 }
//                 //If the SELECT query is successful, the user_id from the results is assigned to req.body.userID: req.body.userID = results[0].user_id. This will be used to associate the user profile with the registered user.
//                 req.body.userId = results[0].user_id;
//                 console.log(req.body);
//                 profile(req.body, (err, results) => {
//                   if (err) {
//                     console.log(err);
//                     res.status(500).json({ msg: "database connection err" });
//                   }
//                   return res.status(200).json({
//                     msg: "New user added successfully",
//                     results,
//                   });
//                 });
//               }
//             );
//           });
//         }
//       }
//     );
//   },

//   getUsers: (req, res) => {
//     getAllUsers((err, results) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).json({ msg: "database connection error" });
//       }
//       return res.status(200).json({ data: results });
//     });
//   },

//   getUserByID: (req, res) => {
//     userById(req.id, (err, results) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).json({ msg: "database connection err" });
//       }
//       if (!results) {
//         return res.status(404).json({ msg: "Record not found" });
//       }
//       return res.status(200).json({ data: results });
//     });
//   },

//   login: (req, res) => {
//     const { email, password } = req.body;
//     //validation
//     if (!email || !password) {
//       return res.status(400).send("Not all fields have been provided");
//     }

//     getUserByEmail(email, (err, results) => {
//       if (err) {
//         console.log(err);
//         res.status(500).json({ msg: "database connection err" });
//       }
//       if (!results) {
//         return res
//           .status(404)
//           .json({ msg: "No account with this email has been registered" });
//       }
//       const isMatch = bcrypt.compareSync(password, results.user_password);
//       if (!isMatch) {
//         return res.status(404).json({ msg: "Invalid Credentials" });
//       }

//       const token = jwt.sign({ id: results.user_id }, process.env.JWT_SECRET, {
//         expiresIn: "1h",
//       });

//       return res.json({
//         token: token,
//         user: {
//           id: results.user_id,
//           display_name: results.user_name,
//         },
//       });
//     });
//   },
// };
//.........tina..............//
//createUser have req and res bec we r talking with frontend
// createUser: (req, res) => {
//     const { userName, firstName, lastName, email, password } = req.body;
//     if (!userName || !firstName || !lastName || !email || !password)
//         return res.status(400).json({ msg: 'Not all fields have been provided!' })
//     if (password.length < 8)
//         return res
//             .status(400)
//             .json({ msg: 'password must be at least 8 characters!' })
//     pool.query(
//   `SELECT * FROM registration WHERE user_email=?`,
//   [email],
//         (err, results) => {
//             if (err) {
//                 return res
//                     .status(err)
//                     .json({ msg: 'database connection err' });
//             }
//             if (results.length > 0) {
//                 return res
//                     .status(400)
//                     .json({ msg: 'An account with this email already exists!' })
//             } else {
//                 const salt = bcrypt.genSaltSync();
//                 req.body.password = bcrypt.hashSync(password, salt)

//                 register(req.body, (err, results) => {
//                     if (err) {
//                         console.log(err);
//                         return res
//                             .status(500)
//                             .json({ msg: 'database connection err' })
//                     }
//                     pool.query('SELECT * FROM registration WHERE user_email=?',
//                         [email],
//                         (err, results) => {
//                             if (err) {
//                                 return res
//                                     .status(err)
//                                     .json({ msg: "database connection err" });
//                             }
//                             req.body.userId = results[0].user_id;
//                             console.log(req.body);
//                             profile(req.body, (err, results) => {
//                                 if (err) {
//                                     console.log(err)
//                                     return res
//                                         .status(500)
//                                         .json({ msg: 'database connection err' })

//                                 }
//                                 return res.status(200).json({
//                                     msg: 'New user aded successfully',
//                                     data: results
//                                 })
//                             })
//                         }
//                     );
//                 })
//             }

//         })

// },
