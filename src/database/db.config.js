module.exports = {
  HOST: "172.21.148.168",
  USER: "admin",
  PASSWORD: "ninecent",
  DB: "Ninecent_DB",
  PORT: 5432,
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
