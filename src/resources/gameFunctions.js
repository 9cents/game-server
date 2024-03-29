const { query } = require("express");
/** @module Game_Functions */

// GET /game/worldnames
/**
 * @name getWorldNames
 * @description Returns middleware that retreives names of all worlds and sends as response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {Function} [getWorldNamesMiddleware]{@link module:Game_Functions~getWorldNamesMiddleware} - The middleware function
 */
getWorldNames = (db) =>
  /**
   * @name getWorldNamesMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const queryText = "SELECT * FROM world ORDER BY world_id;";

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows:", err.detail);
        res.status(500).json({ message: err });
      } else {
        worldList = response.rows.map((val) => {
          return val["world_name"];
        });
        res.status(200).json(worldList);
      }
    });
  };

// GET /game/towernames
/**
 * @name getTowerNames
 * @description Returns middleware that retreives names of all towers and sends as response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {Function} [getTowerNamesMiddleware]{@link module:Game_Functions~getTowerNamesMiddleware} - The middleware function
 */
getTowerNames = (db) =>
  /**
   * @name getTowerNamesMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const queryText = `SELECT * FROM tower ORDER BY tower_id;`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error gettings rows: ", err.detail);
        res.status(500).json({ message: err });
      } else {
        worldList = response.rows.map((val) => {
          return val["world_id"];
        });
        worldList = [...new Set(worldList)];
        towerList = worldList.map((world) => {
          return response.rows
            .filter((row) => {
              return row["world_id"] === world;
            })
            .map((val) => val["tower_name"]);
        });
        res.status(200).json(towerList);
      }
    });
  };

//GET /game/worldquestions
/**
 * @name getWorldQuestions
 * @description Returns middleware that retreives all questions and groups them by the worlds they belong to and sends as response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [getWorldQuestionsMiddleware]{@link module:Game_Functions~getWorldQuestionsMiddleware} - The middleware function
 */
getWorldQuestions = (db) =>
  /**
   * @name getWorldQuestionsMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const queryText = `SELECT world.world_id, question.question_body FROM world 
    JOIN tower on world.world_id = tower.world_id
    JOIN level on tower.tower_id = level.tower_id
    JOIN question on level.level_id = question.level_id
    ORDER BY world.world_id, tower.tower_id, level.level_id, question.question_id`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows:", err.detail);
        res.status(500).json({ message: err });
      } else {
        // get list of world ids
        worldList = response.rows.map((val) => {
          return val["world_id"];
        });
        // get unique world ids only
        worldList = [...new Set(worldList)];
        // get questions only
        worldQuestions = worldList.map((world) => {
          return response.rows
            .filter((row) => {
              return row["world_id"] === world;
            })
            .map((val) => val["question_body"]);
        });
        res.status(200).json(worldQuestions);
      }
    });
  };

// GET /game/storydata
/**
 * @name getStoryData
 * @description Returns middleware that retreives questions and answers data of a specified tower
 * and player based on player's current level in that tower, and sends as response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [getStoryDataMiddleware]{@link module:Game_Functions~getStoryDataMiddleware} - The middleware function
 */
getStoryData = (db) =>
  /**
   * @name getStoryDataMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const params = req.query;
    const tower_name = params["tower_name"];
    const player_name = params["player_name"];

    if (!tower_name || !player_name) {
      res.status(422).json({ message: "Missing field in request." });
      return;
    }

    const queryText = `WITH current_level AS
    (SELECT DISTINCT progress.level_id AS level FROM progress, tower, player
    WHERE progress.player_id = player.player_id
    AND progress.tower_id = tower.tower_id
    AND tower.tower_name = '${tower_name}'
    AND player.player_name = '${player_name}'),
    min_level AS
    (SELECT MIN(level.level_id) AS level FROM tower, level
    WHERE tower.tower_id = level.tower_id
    AND tower.tower_name = '${tower_name}'),
    combined AS
    (SELECT * FROM current_level UNION SELECT * FROM min_level),
    questions AS
    (SELECT question_id FROM question
    WHERE level_id = (SELECT MAX(level) FROM combined)
    ORDER BY RANDOM()
    LIMIT 5)
    SELECT level_name, question_body, answer_body, correct FROM level, question, answer
    WHERE level.level_id = question.level_id
    AND question.question_id = answer.question_id
    AND question.question_id IN (SELECT * FROM questions)`;

    // console.log(queryText)
    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows: ", err.detail);
        res.status(500).json({ message: err });
      } else {
        // console.log(response.rows)
        var questionList = response.rows.map((val) => val["question_body"]);
        questionList = [...new Set(questionList)];

        const questionAnswersData = questionList.map((qns) => {
          var correctIndex = -1;
          const answers = response.rows
            .filter((row) => row["question_body"] === qns)
            .map((val, idx) => {
              if (val["correct"]) {
                correctIndex = idx;
              }
              return val["answer_body"];
            });
          return {
            question_body: qns,
            answers: answers,
            correct: correctIndex,
          };
        });

        const toReturn = {
          level_name: response.rows[0].level_name,
          data: questionAnswersData,
        };

        res.status(200).json(toReturn);
      }
    });
  };

//GET /game/challengedata
/**
 * @name getChallengeData
 * @description Returns middleware that retreives challenge questions and answers data of a specified player and sends as response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [getChallengeDataMiddleware]{@link module:Game_Functions~getChallengeDataMiddleware} - The middleware function
 */
getChallengeData = (db) =>
  /**
   * @name getChallengeDataMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const params = req.query;
    const player_name = params.player_name;

    if (!player_name) {
      res.status(422).json({ message: "Missing player name" });
      return;
    }

    queryText = `SELECT player_name, question_body, answer_body, correct
    FROM (SELECT player_name,
      unnest(array['question_1', 'question_2', 'question_3', 'question_4', 'question_5']) AS "Values",
      unnest(array[question_1, question_2, question_3, question_4, question_5]) AS "question_id"
    FROM dungeon
    ORDER BY player_name) AS d, question, answer
    WHERE d.question_id = question.question_id
    AND question.question_id = answer.question_id
    AND d.player_name = '${player_name}'
    ORDER BY player_name, question_body`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows: ", err.detail);
        res.status(500).json({ message: err });
      } else {
        var questionList = response.rows
          .filter(function (val, idx, self) {
            return idx % 4 == 0;
          })
          .map((val) => val["question_body"]);

        temp = questionList.map((qns) => {
          var correctIndex = -1;
          const answers = response.rows
            .filter((row) => row["question_body"] === qns)
            .filter(
              (val, idx, self) =>
                self
                  .map((v) => JSON.stringify(v))
                  .indexOf(JSON.stringify(val)) === idx
            )
            .map((val, idx) => {
              if (val["correct"]) {
                correctIndex = idx;
              }
              return val["answer_body"];
            });
          return {
            question_body: qns,
            answers: answers,
            correct: correctIndex,
          };
        });
        res.status(200).json(temp);
      }
    });
  };

//GET /game/instructordungeon
/**
 * @name getInstructorDungeon
 * @description Returns middleware that retreives questions and answers data of the Instructor and sends as response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [getInstructorDungeonMiddleware]{@link module:Game_Functions~getInstructorDungeonMiddleware} - The middleware function
 */
getInstructorDungeon = (db) =>
  /**
   * @name getInstructorDungeonMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    queryText = `SELECT instructor_name, question_body, answer_body, correct, lock
    FROM (SELECT instructor_name,
      unnest(array['question_1', 'question_2', 'question_3', 'question_4', 'question_5']) AS "Values",
      unnest(array[question_1, question_2, question_3, question_4, question_5]) AS "question_id",
      lock
    FROM instructor
    ORDER BY instructor_name) AS d, question, answer
    WHERE d.question_id = question.question_id
    AND question.question_id = answer.question_id
    AND d.instructor_name = 'Instructor'
    ORDER BY question_body`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows: ", err.detail);
        res.status(500).json({ message: err });
      } else {
        var questionList = response.rows.map((val) => val["question_body"]);
        questionList = [...new Set(questionList)];

        const questionAnswersData = questionList.map((qns) => {
          var correctIndex = -1;
          const answers = response.rows
            .filter((row) => row["question_body"] === qns)
            .map((val, idx) => {
              if (val["correct"]) {
                correctIndex = idx;
              }
              return val["answer_body"];
            });
          return {
            question_body: qns,
            answers: answers,
            correct: correctIndex,
          };
        });

        const toReturn = {
          lock: response.rows[0].lock,
          data: questionAnswersData,
        };
        res.status(200).json(toReturn);
      }
    });
  };

// GET /game/leaderboardlevel
/**
 * @name getLeaderBoardLevel
 * @description Returns middleware that retreives the level leaderboard information and sends as response.
 * If no player is specified, returns top 10 players leaderboard information.
 * If player is specified, returns that player's leaderboard information.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [getLeaderBoardLevelMiddleware]{@link module:Game_Functions~getLeaderBoardLevelMiddleware} - The middleware function
 */
getLeaderBoardLevel = (db) =>
  /**
   * @name getLeaderBoardLevelMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const params = req.query;
    const player_name = params["player_name"];

    queryText = `WITH min_level AS
    (SELECT level.tower_id, MIN(level_id)-1 AS nums FROM level, tower
    WHERE level.tower_id=tower.tower_id
    GROUP BY level.tower_id
    ORDER BY level.tower_id),
    total_level AS
    (SELECT player.player_name, SUM(progress.level_id-min_level.nums) AS total FROM player, progress, min_level
    WHERE progress.tower_id = min_level.tower_id
    AND player.player_id = progress.player_id GROUP BY player.player_name)
    SELECT player.player_name, COALESCE(total, 0) AS total FROM player
    LEFT JOIN total_level ON player.player_name = total_level.player_name
    ORDER BY total DESC NULLS LAST`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("error getting rows: ", err.detail);
        res.status(500).json({ message: err });
      } else {
        var targetPlayerData = [];
        const data = response.rows.map((val, idx) => {
          if (player_name && val.player_name === player_name) {
            targetPlayerData = [idx + 1, parseInt(val.total)];
          }
          return [val.player_name, parseInt(val.total)];
        });

        res.status(200).json(player_name ? targetPlayerData : data);
      }
    });
  };

// GET /game/leaderboardaccuracy
/**
 * @name getLeaderBoardAccuracy
 * @description Returns middleware that retreives the accuracy leaderboard information and sends as response.
 * If no player is specified, returns top 10 players leaderboard information.
 * If player is specified, returns that player's leaderboard information.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [getLeaderBoardAccuracyMiddleware]{@link module:Game_Functions~getLeaderBoardAccuracyMiddleware} - The middleware function
 */
getLeaderBoardAccuracy = (db) =>
  /**
   * @name getLeaderBoardAccuracyMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const params = req.query;
    const player_name = params["player_name"];

    queryText = `WITH correct AS
    (SELECT player.player_name, CAST(COUNT(response_id) as FLOAT) AS total FROM player, response, answer
    WHERE player.player_id = response.player_id
    AND response.answer_id = answer.answer_id 
    AND answer.correct = true GROUP BY player.player_name),
    total_response AS
    (SELECT player.player_name, CAST(COUNT(response_id) as FLOAT) AS total FROM player, response
    WHERE player.player_id = response.player_id GROUP BY player.player_name),
    percentage AS
    (SELECT correct.player_name, COALESCE(correct.total/total_response.total*100, 0) AS percentage
    FROM correct, total_response
    WHERE correct.player_name = total_response.player_name)
    SELECT player.player_name, COALESCE(percentage, 0) AS total FROM player
    LEFT JOIN percentage ON player.player_name = percentage.player_name
    ORDER BY percentage DESC NULLS LAST`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("error getting rows: ", err.detail);
        res.status(500).json({ message: err });
      } else {
        var targetPlayerData = [];
        const data = response.rows.map((val, idx) => {
          if (player_name && val.player_name === player_name) {
            targetPlayerData = [idx + 1, val.total];
          }
          return [val.player_name, val.total];
        });

        res.status(200).json(player_name ? targetPlayerData : data);
      }
    });
  };

// PUT /game/dungeon
/**
 * @name putGameDungeon
 * @description Returns middleware that updates the specified player's challenge/dungeon questions and answers data and success/failure response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [putGameDungeonMiddleware]{@link module:Game_Functions~putGameDungeonMiddleware} - The middleware function
 */
putGameDungeon = (db) =>
  /**
   * @name putGameDungeonMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const params = req.query;
    const player_name = params.player_name;

    if (!player_name) {
      res.status(422).json({ message: "Missing player_name field" });
      return;
    }

    const valuesObject = [...req.body];

    const queryText = `UPDATE dungeon
    SET 
    question_1 = (SELECT question_id FROM question WHERE question_body = '${valuesObject[0]}'), 
    question_2 = (SELECT question_id FROM question WHERE question_body = '${valuesObject[1]}'), 
    question_3 = (SELECT question_id FROM question WHERE question_body = '${valuesObject[2]}'),
    question_4 = (SELECT question_id FROM question WHERE question_body = '${valuesObject[3]}'),
    question_5 = (SELECT question_id FROM question WHERE question_body = '${valuesObject[4]}')
    WHERE player_name = '${player_name}';`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows:", err.detail);
        res.status(500).json({ message: err });
      } else {
        res.status(200).json({
          message: `${response.rowCount} row(s) updated.`,
          data: response.rows,
        });
      }
    });
  };

// PUT /game/response
/**
 * @name putGameResponse
 * @description Returns middleware that logs the specified player's response to a specified question and sends success/failure response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [putGameResponseMiddleware]{@link module:Game_Functions~putGameResponseMiddleware} - The middleware function
 */
putGameResponse = (db) =>
  /**
   * @name putGameResponseMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const params = req.query;
    const player_name = params.player_name;

    const question_body = req.body.question_body;
    const answer_body = req.body.answer_body;

    if (!player_name) {
      res.status(422).json({ message: "Missing player_name field" });
      return;
    }
    if (!question_body) {
      res.status(422).json({ message: "Missing question_body field" });
      return;
    }
    if (!answer_body) {
      res.status(422).json({ message: "Missing answer_body field" });
      return;
    }

    const queryText = `INSERT INTO response(player_id, answer_id)
    SELECT (SELECT player_id FROM player WHERE player_name='${player_name}'),
    (SELECT answer_id FROM answer, question 
      WHERE answer.answer_body='${answer_body}'
      AND question.question_body='${question_body}'
      AND question.question_id = answer.question_id)`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows:", err.detail);
        res.status(500).json({ message: err });
      } else {
        res.status(200).json({
          message: `Response inserted.`,
          data: response.rows,
        });
      }
    });
  };

// PUT /game/increment
/**
 * @name putIncrementLevel
 * @description Returns middleware that increments the specified player's current level in the specified tower and sends success/failure response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [putIncrementLevelMiddleware]{@link module:Game_Functions~putIncrementLevelMiddleware} - The middleware function
 */
putIncrementLevel = (db) =>
  /**
   * @name putIncrementLevelMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const params = req.query;
    const player_name = params.player_name;
    const tower_name = params.tower_name;

    if (!player_name) {
      res.status(422).json({ message: "Missing player_name field" });
      return;
    }

    if (!tower_name) {
      res.status(422).json({ message: "Missing tower_name field" });
      return;
    }

    const queryText = `UPDATE progress
    SET level_id = level_id + 1
    WHERE tower_id IN (SELECT tower_id FROM tower WHERE tower_name = '${tower_name}')
    AND player_id IN (SELECT player_id FROM player WHERE player_name = '${player_name}')
    AND EXISTS (SELECT 1 FROM level, tower 
          WHERE tower.tower_id = level.tower_id
          AND tower_name = '${tower_name}'
          AND level_id = progress.level_id + 1);
    INSERT INTO progress
    SELECT (SELECT player_id FROM player WHERE player_name = '${player_name}'), 
    (SELECT tower_id FROM tower WHERE tower_name = '${tower_name}'), 
    (SELECT MIN(level_id)+1 FROM level WHERE tower_id IN (SELECT tower_id FROM tower
      WHERE tower_name = '${tower_name}'))
    WHERE NOT EXISTS (SELECT 1 FROM progress 
              WHERE tower_id IN (SELECT tower_id FROM tower WHERE tower_name = '${tower_name}')
              AND player_id IN (SELECT player_id FROM player WHERE player_name = '${player_name}'));`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows:", err.detail);
        res.status(500).json({ message: err });
      } else {
        res.status(200).json({
          message: `Level incremented.`,
          data: response.rows,
        });
      }
    });
  };

// PUT /game/decrement
/**
 * @name putDecrementLevel
 * @description Returns middleware that decrements the specified player's current level in the specified tower and sends success/failure response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [putDecrementLevelMiddleware]{@link module:Game_Functions~putDecrementLevelMiddleware} - The middleware function
 */
putDecrementLevel = (db) =>
  /**
   * @name putDecrementLevelMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const params = req.query;
    const player_name = params.player_name;
    const tower_name = params.tower_name;

    if (!player_name) {
      res.status(422).json({ message: "Missing player_name field" });
      return;
    }

    if (!tower_name) {
      res.status(422).json({ message: "Missing tower_name field" });
      return;
    }

    const queryText = `UPDATE progress
    SET level_id = level_id - 1
    WHERE tower_id IN (SELECT tower_id FROM tower WHERE tower_name = '${tower_name}')
    AND player_id IN (SELECT player_id FROM player WHERE player_name = '${player_name}')
    AND EXISTS (SELECT 1 FROM level, tower 
          WHERE tower.tower_id = level.tower_id
          AND tower_name = '${tower_name}'
          AND level_id = progress.level_id - 1);
    INSERT INTO progress
    SELECT (SELECT player_id FROM player WHERE player_name = '${player_name}'), 
    (SELECT tower_id FROM tower WHERE tower_name = '${tower_name}'), 
    (SELECT MIN(level_id) FROM level WHERE tower_id IN (SELECT tower_id FROM tower
      WHERE tower_name = '${tower_name}'))
    WHERE NOT EXISTS (SELECT 1 FROM progress 
              WHERE tower_id IN (SELECT tower_id FROM tower WHERE tower_name = '${tower_name}')
              AND player_id IN (SELECT player_id FROM player WHERE player_name = '${player_name}'));`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows:", err.detail);
        res.status(500).json({ message: err });
      } else {
        res.status(200).json({
          message: `Level decremented.`,
          data: response.rows,
        });
      }
    });
  };

/**
 * @name getPossibleChallengeQuestions
 * @description Returns middleware that retreives all questions
 * that the player has answered correctly
 * and groups them by the worlds they belong to and sends as response.
 * @function
 * @param {Object} db - The postpresql db instance
 * @return {function} [getPossibleChallengeQuestionsMiddleware]{@link module:Game_Functions~getPossibleChallengeQuestionsMiddleware} - The middleware function
 */
getPossibleChallengeQuestions = (db) =>
  /**
   * @name getPossibleChallengeQuestionsMiddleware
   * @function
   * @param req {Object} The request
   * @param res {Object} The response
   * @param {Function} next The next middleware
   *
   */
  (req, res, next) => {
    const params = req.query;
    const player_name = params["player_name"];

    if (!player_name) {
      res.status(422).json({ message: "Missing field in request." });
      return;
    }

    const queryText = `WITH ans AS
    (SELECT DISTINCT response.answer_id, answer.question_id 
    FROM response, answer, player
    WHERE response.answer_id = answer.answer_id
    AND answer.correct = True
    AND response.player_id = player.player_id
    AND player.player_name = '${player_name}')
    
    SELECT world.world_id, question_body FROM tower 
    JOIN level
    ON level.tower_id = tower.tower_id
    JOIN question
    on question.level_id = level.level_id
    JOIN ans 
    ON question.question_id = ans.question_id
    RIGHT JOIN world
    ON tower.world_id = world.world_id
    ORDER BY world_id;`;

    db.query(queryText, (err, response) => {
      if (err) {
        console.log("Error getting rows:", err.detail);
        res.status(500).json({ message: err });
      } else {
        // get list of world ids
        worldList = response.rows.map((val) => {
          return val["world_id"];
        });
        // get unique world ids only
        worldList = [...new Set(worldList)];
        // get questions only
        worldQuestions = worldList.map((world) => {
          return response.rows
            .filter((row) => {
              return row["world_id"] === world;
            })
            .map((val) => {
              // console.log(val);
              if (val["question_body"] !== null) {
                return val["question_body"];
              } else {
                return;
              }
            });
        });
        worldQuestions = worldQuestions.map((val) => {
          if (JSON.stringify(val) === "[null]") {
            return [];
          }
          return val;
        });
        res.status(200).json(worldQuestions);
      }
    });
  };

module.exports = {
  getWorldNames,
  getTowerNames,
  getWorldQuestions,
  getStoryData,
  getChallengeData,
  getInstructorDungeon,
  getLeaderBoardLevel,
  getLeaderBoardAccuracy,
  putGameDungeon,
  putGameResponse,
  putIncrementLevel,
  putDecrementLevel,
  getPossibleChallengeQuestions,
};
