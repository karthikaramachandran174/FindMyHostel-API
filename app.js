const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const pino = require('pino');
const path = require('path');
const app = express();

global.appRoot = path.resolve(__dirname);


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use(cors());

app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :date[web]'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
    mixin() {
        return { timeStamp: new Date() };
    },
});

app.use((req, res, next) => {
    req.pinoLogger = logger;
    next();
});

app.use('/api/profile', require('./routes/web/user'));
app.use('/api/profilelogin',require('./routes/web/login.js'));

module.exports = app;
