const express = require("express");
const app = express();
const axios = require("axios");
const config = require("./config/config");
const bodyParser = require("body-parser");

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to check for a valid token
const tokenCheck = (req, res, next) => {
  const token = req.headers["authorization"]; // Assuming the token is in the Authorization header

  if (!token) {
    return res.status(401).send({ message: "No token provided" });
  }
  console.log(token);
  const isValid = `Bearer ${config.token}` === token;

  if (!isValid) {
    return res.status(403).send({ message: "Invalid token" });
  }

  next(); // Proceed to the next middleware or route handler
};

// Use the token check middleware
app.use(tokenCheck);

app.use("/", async (req, res) => {
  try {
    const method = req.method; // Get the HTTP method
    const data = req.body; // Get any data to send with the request
    const url = `${config.base_url}${req.originalUrl}`; // Construct the full URL
    console.log(req);

    console.log(`Requesting: ${url + method}`);

    // Make the HTTP request using Axios
    const response = await axios({
      method,
      url,
      data,
      headers: {
        Authorization: `Bearer ${config.headerToken}`,
      },
      // Uncomment the following lines if you want to ignore SSL errors (not recommended for production)
      httpsAgent: new (require("https").Agent)({
        rejectUnauthorized: false,
      }),
    });
    // Forward the response from the target server
    res.status(response.status).send(response.data);
  } catch (error) {
    // Handle errors
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      console.error("Error:", error);

      res.status(500).send({ message: "An error occurred", error });
    }
  }
});

app.set("port", process.env.PORT || 5021);

const server = app.listen(app.get("port"), () => {
  console.log("Express server listening on port " + server.address().port);
});
