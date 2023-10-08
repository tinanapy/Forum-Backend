//chcking the data if the user is valid or not
const jwt = require("jsonwebtoken");
require('dotenv').config();

const auth = (req, res, next) => {
    try {
      //token from postman  when we give email and password on posstman and login using post metod, we will write z token on header value part n x-auth-token on z key part on http://localhost:4000/api/users/ using get metod
      const token = req.header("x-auth-token");
      if (!token)
        return res
          .status(401)
          .json({ msg: "no authentication token, aythorization denied." });
      const verfied = jwt.verify(token, process.env.JWT_SECRET);
      console.log(verfied);
      if (!verfied)
        return res
          .status(401)
          .json({ msg: "token verification failed, authorization denied." });

      req.id = verfied.id;
      next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
module.exports = auth;