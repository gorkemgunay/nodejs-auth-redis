require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/dbConfig");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const client = require("./config/redisConfig");
const userRoute = require("./routes/userRoute");

(async () => {
  await sequelize.sync();
  await client.connect();

  const app = express();

  app.use(express.json());

  app.use(cors({ credentials: true, origin: "http://localhost:4000" }));

  app.use(helmet());

  app.use(cookieParser());

  app.use("/user", userRoute);

  app.listen(process.env.PORT, () =>
    console.log(`Server started at port ${process.env.PORT}`)
  );
})();
