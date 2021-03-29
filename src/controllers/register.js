const bcrypt = require("bcrypt-nodejs");
/** @module Game_Registration*/
/**
 * @name registerHandler
 * @description Returns middleware function that registers a new player sends success/failure as response.
 * @function
 * @param {object} db - The postpresql db instance
 * @return {function}  [registerHandlerMiddleware]{@link module:CreateReadUpdateDelete_Functions~registerHandlerMiddleware} - The middleware function
 */
const registerHandler = (db) =>
  /**
   * @name registerHandlerMiddleware
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

    // Hashing the password input
    var salt = bcrypt.genSaltSync(10);
    bcrypt.hash(query.password, salt, null, function (err, hash) {
      var queryText =
        "INSERT INTO player(player_name, password) " +
        "VALUES('" +
        query.name +
        "','" +
        hash +
        "'); \
      INSERT INTO dungeon(player_name, lock) VALUES('" +
        query.name +
        "', True);";

      db.query(queryText, (err, response) => {
        if (err) {
          res.status(500).json(err);
        } else {
          res.status(200).json({ message: "Player added." });
        }
      });
    });
  };

module.exports = {
  registerHandler,
};
