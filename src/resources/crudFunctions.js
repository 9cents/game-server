// GET /resource
/** @module CreateReadUpdateDelete_Functions */
/**
 * @name getFunc
 * @description Returns middleware function that performs an SQL SELECT * query based on the specified resource and params.
 * @function
 * @param {object} db - The postpresql db instance
 * @param {object} resource - The resource
 * @return {function} [getFuncMiddleware]{@link module:CreateReadUpdateDelete_Functions~getFuncMiddleware} - The middleware function
 */
getFunc = (db, resource) =>
  /**
   * @name getFuncMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const query = req.query;

    var queryText = `SELECT * FROM public.${resource.name} `;

    // if user passed in query
    if (JSON.stringify(query) !== JSON.stringify({})) {
      queryText += "WHERE ";
      // check if there are conditions to form WHERE clause
      fieldPresent = false;
      const allFields = [...resource.fields, resource.primaryKey];
      allFields.forEach((val) => {
        if (query.hasOwnProperty(val)) {
          queryText += `${val}=`;
          queryText += `'${query[val]}' AND `;
          fieldPresent = true;
        }
      });
      if (!fieldPresent) {
        res.status(422).json({ message: "No conditions found." });
        return;
      }
      queryText = queryText.slice(0, -5); // remove extra comma and space
    }
    
    if (resource.primaryKey) {
      queryText += ` ORDER BY ${resource.primaryKey}`;
    }

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows:", err.detail);
        res.status(500).json({ message: err });
      } else {
        // filter out password field
        var returnData = response.rows.map((val) => {
          if (val["password"]) {
            delete val["password"];
          }
          return val;
        });
        res.status(200).json({ message: "Rows returned.", data: returnData });
      }
    });
  };

// to insert one, used with PUT
/**
 * @name insertOne
 * @description Returns middleware function that performs an SQL INSERT INTO query based on the specified resource and params.
 * @function
 * @param {object} db - The postpresql db instance
 * @param {object} resource - The resource
 * @return {function} [insertOneMiddleware]{@link module:CreateReadUpdateDelete_Functions~insertOneMiddleware} - The middleware function
 */
insertOne = (db, resource) =>
  /**
   * @name insertOneMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    // prevent creating player and instructor through this, because password needs to be bcrypted
    if (resource.name === "player" || resource.name === "instructor") {
      res.status(422).send("Not allowed to create through this method.");
      return;
    }
    const valuesObject = { ...req.body };

    // check if every column is found in req
    try {
      valuesList = resource.fields.map((val) => {
        if (valuesObject.hasOwnProperty(val)) {
          return valuesObject[val];
        } else {
          res.status(422).send(`Value for column ${val} not found.`);
          throw `Value for column ${val} not found.`;
        }
      });
    } catch (err) {
      return;
    }

    const queryText =
      "INSERT INTO " +
      `public.${resource.name}(${resource.fields.toString()})` +
      ` VALUES(${resource.fields.map((val, idx) => `$${idx + 1}`).toString()})`;

    db.query(queryText, valuesList, (err, response) => {
      if (err) {
        console.error("Error inserting new row:", err.detail);
        res.status(500).json({ message: err });
      } else {
        res.status(200).json({ message: "Row inserted.", data: response.rows });
      }
    });
  };

// to update one, used with PUT
/**
 * @name updateOne
 * @description Returns middleware function that performs an SQL UPDATE query based on the specified resource and params.
 * @function
 * @param {object} db - The postpresql db instance
 * @param {object} resource - The resource
 * @return {function} [updateOneMiddleware]{@link module:CreateReadUpdateDelete_Functions~updateOneMiddleware} - The middleware function
 */
updateOne = (db, resource) =>
  /**
   * @name updateOneMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const valuesObject = { ...req.body };
    const conditions = valuesObject.conditions;
    delete valuesObject[conditions];

    // queryText to form SQL query
    var queryText = "UPDATE " + `public.${resource.name} ` + "SET ";

    // check if there are values to form SET clause
    var fieldPresent = false;
    var passwordFlag = false;
    resource.fields.forEach((val) => {
      if (valuesObject.hasOwnProperty(val)) {
        // if attempting to change password here, reject
        if (val === "password") {
          passwordFlag = true;
        }
        queryText += `${val}=`;
        queryText += `'${valuesObject[val]}', `;
        fieldPresent = true;
      }
    });
    if (passwordFlag) {
      res.status(422).send("Not allowed to change password.");
      return;
    }
    if (!fieldPresent) {
      res.status(422).json({ message: `No values to set.` });
      return;
    }

    queryText = queryText.slice(0, -2) + " WHERE "; // remove extra comma and space

    // check if there are conditions to form WHERE clause
    fieldPresent = false;
    const allFields = [...resource.fields, resource.primaryKey];
    allFields.forEach((val) => {
      if (conditions.hasOwnProperty(val)) {
        queryText += `${val}=`;
        queryText += `'${conditions[val]}', `;
        fieldPresent = true;
      }
    });
    if (!fieldPresent) {
      res.status(422).json({ message: `No conditions found.` });
      return;
    }

    queryText = queryText.slice(0, -2); // remove extra comma and space

    db.query(queryText, (err, response) => {
      if (err) {
        console.error("Error updating row:", err.detail);
        res.status(500).json({ message: err });
        return;
      }
      res.status(200).json({
        message: `${response.rowCount} row(s) updated.`,
        data: response.rows,
      });
    });
  };

// PUT /resource
/**
 * @name putFunc
 * @description Returns middleware function that performs {@link updateOne} or {@link insertOne} depending on whether conditions are found in the request.
 * @function
 * @param {object} db - The postpresql db instance
 * @param {object} resource - The resource
 * @return {function} [putFuncMiddleware]{@link module:CreateReadUpdateDelete_Functions~putFuncMiddleware} - The middleware function
 */
putFunc = (db, resource) =>
  /**
   * @name putFuncMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    if (req.body.conditions) {
      updateOne(db, resource)(req, res, next);
    } else {
      insertOne(db, resource)(req, res, next);
    }
  };

// DELETE /resource
/**
 * @name deleteFunc
 * @description Returns middleware function that performs an SQL DELETE FROM query based on the specified resource and params.
 * @function
 * @param {object} db - The postpresql db instance
 * @param {object} resource - The resource
 * @return {function} [deleteFuncMiddleware]{@link module:CreateReadUpdateDelete_Functions~deleteFuncMiddleware} - The middleware function
 */
deleteFunc = (db, resource) =>
  /**
   * @name deleteFuncMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const valuesObject = req.body;

    var queryText = "DELETE FROM " + `public.${resource.name} ` + "WHERE ";
    // check if there are values to form WHERE clause
    var fieldPresent = false;
    const allFields = [...resource.fields, resource.primaryKey];
    allFields.forEach((val) => {
      if (valuesObject.hasOwnProperty(val)) {
        queryText += `${val}=`;
        queryText += `'${valuesObject[val]}', `;
        fieldPresent = true;
      }
    });
    if (!fieldPresent) {
      res.status(422).json({ message: `No conditions found.` });
      return;
    }

    queryText = queryText.slice(0, -2); // remove extra comma and space

    db.query(queryText, (err, response) => {
      if (err) {
        console.error("Error updating row:", err.detail);
        res.status(500).json({ message: err });
        return;
      }
      res.status(200).json({ message: "Row(s) deleted.", data: response.rows });
    });
  };

module.exports = {
  getFunc,
  putFunc,
  deleteFunc,
};
