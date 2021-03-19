// define table schema here
// for fields, leave out primary key field if id is auto incremented

const worlds = {
  name: "world",
  fields: ["world_name"],
  primaryKey: "world_id",
};

const towers = {
  name: "tower",
  fields: ["tower_name", "lock", "world_id"],
  primaryKey: "tower_id",
};

const levels = {
  name: "level",
  fields: ["level_name", "tower_id"],
  primaryKey: "level_id",
};

const questions = {
  name: "question",
  fields: ["question_body", "level_id"],
  primaryKey: "question_id",
};

const answers = {
  name: "answer",
  fields: ["answer_body", "correct", "question_id"],
  primaryKey: "answer_id",
};

const players = {
  name: "player",
  fields: ["player_name", "character", "password", "level_id"],
  primaryKey: "player_id",
};

const responses = {
  name: "response",
  fields: ["time", "player_id", "answer_id"],
  primaryKey: "response_id",
};

const instructors = {
  name: "instructor",
  fields: [
    "instructor_name",
    "password",
    "question_1",
    "question_2",
    "question_3",
    "question_4",
    "question_5",
    "lock",
  ],
  primaryKey: "instructor_id",
};

const dungeons = {
  name: "dungeon",
  fields: [
    "question_1",
    "question_2",
    "question_3",
    "question_4",
    "question_5",
    "lock",
  ],
  primaryKey: "player_name",
};

const progress = {
  name: "progress",
  fields: ["player_id", "tower_id", "level_id"],
};

module.exports = [
  worlds,
  towers,
  levels,
  questions,
  answers,
  players,
  responses,
  instructors,
  dungeons,
  progress,
];
