const bcrypt = require("bcrypt-nodejs");
/** @module Game_Login*/

/**
 * @name loginHandler
 * @description Returns middleware function that authenticates a player's credentials and sends success/failure as response.
 * @function
 * @param {object} db - The postpresql db instance
 * @return {function}  [loginHandlerMiddleware]{@link module:CreateReadUpdateDelete_Functions~loginHandlerMiddleware} - The middleware function
 */
const loginHandler = (db) =>
  /**
   * @name loginHandlerMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res) => {
    const query = {
      name: req.body.name,
      password: req.body.password,
    };

    if (!query.name || !query.password) {
      return res.status(422).json({ message: "Entries must not be empty!" });
    }

    var queryText =
      "SELECT * FROM player WHERE player_name = '" + query.name + "'";

    // Database SQL query goes here
    db.query(queryText, (err, response) => {
      if (err) {
        res.status(500).json(err);
      } else {
        if (response.rows[0]) {
          bcrypt.compare(
            query.password,
            response.rows[0].password,
            function (err, isMatch) {
              if (!isMatch) {
                res.status(401).json({ message: "Passwords do not match" });
              } else {
                toReturn = response.rows[0];
                delete toReturn.password;
                res
                  .status(200)
                  .json({ message: "Passwords match", data: toReturn });
              }
            }
          );
        } else {
          res.status(401).json({ message: "Player not found." });
        }
      }
    });
  };

module.exports = {
  loginHandler,
};
