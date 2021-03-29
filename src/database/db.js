// PostgreSQL connection set up
const conf = require("./db.config");
const { Pool } = require("pg");

// singleton of database object
const pgSingleton = (() => {
  var instance;
  init = async () => {
    instance = new Pool({
      user: conf.USER,
      host: conf.HOST,
      database: conf.DB,
      password: conf.PASSWORD,
      port: conf.PORT,
      dialect: conf.dialect,
      pool: {
        max: conf.pool.max,
        min: conf.pool.min,
        acquire: conf.pool.acquire,
        idle: conf.pool.idle,
      },
    });
  };
  getInstance = () => {
    if (!instance) {
      init();
    }

    return instance;
  };
  return {
    init: init,
    getInstance: getInstance,
  };
})();

module.exports = pgSingleton;
