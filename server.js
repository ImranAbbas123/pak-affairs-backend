require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const expressWs = require('express-ws');
const server = http.createServer(app);
const socketIo = require('socket.io');
const port = process.env.PORT || 5000;
const baseUrl = process.env.REACT_APP_BASE_URL;
const bodyParser = require('body-parser');
const { proxy, scriptUrl } = require('rtsp-relay')(app);


// Middleware
app.use(express.json());
app.use(express.static('build'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));
const corsOptions = {
  origin: baseUrl
};
app.use(cors(corsOptions));



app.listen(port + 1, () => {
  console.log(`Server started on ports ${port + 1}`);
});
app.ws('/stream/url/:chID', (ws, req) =>
  proxy({
    url: `rtsp://admin:troiano10!@47.21.4.147:3057/chID=5&streamType=main&linkType=tcp`,
    // url: `rtsp://68.195.234.210:3057/chID=${req.params.chID}&streamType=sub&linkType=tcp`,
    // if your RTSP stream need credentials, include them in the URL as above
    verbose: false,
    transport: 'tcp',
    additionalFlags: ['-q', '10']
  })(ws),
);
// this is an example html page to view the stream
app.get('/streaming/:chID', (req, res) =>
  res.send(`
    <canvas id='canvas' style="width:100%;height:100%"></canvas>
    <script src='${scriptUrl}'></script>
    <script>
        loadPlayer({
        url: '${socketUrl}/api/stream/${req.params.chID}',
        canvas: document.getElementById('canvas')
        });
    </script>
    `),
);
