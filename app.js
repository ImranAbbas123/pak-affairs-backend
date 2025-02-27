require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const connectTMongo = require("./db");
const port = process.env.PORT || 5000;
const baseUrl = process.env.REACT_APP_BASE_URL;
const fileUpload = require('express-fileupload');
connectTMongo();
const corsOptions = {
  origin: baseUrl, // Replace with your allowed origin
}
app.use(cors(corsOptions));
// app.use(fileUpload({
//   useTempFiles: true,
//   tempFileDir: '/tmp/'
// }));
// const allowedOrigins = baseUrl.split(",");

// // Function to dynamically allow certain origins
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

// Static folder
app.use(express.static('./public'));
// Middlewares
app.use(express.json());
app.use(express.static("build"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));
app.use(cors(corsOptions));

// App Routes
app.use("/api", require("./src/router"));

server.listen(port, () => {
  console.log(`Server started on ports ${port}`);
});
