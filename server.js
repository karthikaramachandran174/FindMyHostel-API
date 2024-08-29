const http = require('http');
const mongoose = require('mongoose');

const app = require('./app'); // Import the app from app.js

const port = process.env.PORT || 8080;

const server = http.createServer(app);

// Connect to MongoDB

const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/findmyhostel';

mongoose.connect(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// Start the server
server.listen(port, () => {
    console.log('Server running on port ' + port);
});
