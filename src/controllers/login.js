const bcrypt = require("bcrypt-nodejs");

const loginHandler = (db) => (req, res) => {
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
  loginHandler
};
