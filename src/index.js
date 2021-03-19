require("dotenv").config();

const port = process.env.PORT || 5000;

require("./database/db").init();

const app = require("./app");

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
