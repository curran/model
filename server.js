// A static file server for development use.
// By Curran Kelleher 4/15/2014
//
// Run in the background with the shell command "node server.js &".
// Install  with "npm install"
var port = 8000,
    express = require('express'),
    app = express();

// Serve files from the parent directory.
app.use('/', express.static(__dirname + '/'));

app.listen(port);
console.log('Now serving http://localhost:'+port+'/index.html');
