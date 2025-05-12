const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const app = express();
const db = require('./models');

// Configure CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true // Allow credentials
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const routes = require("./routes");
app.use("/api", routes);

async function initialize(req, res, next) {
  await db.sequelize.sync({});
  app.listen(config.PORT, () => {
    console.log("Listening on port " + config.PORT);
  });
}

initialize();
