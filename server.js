// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var DEFAULT_PORT   = 8080;

// configuration ===========================================

// set our port
var port = process.env.PORT || DEFAULT_PORT; 

// set the static files location /public/img will be /img for users
app.use('/static', express.static(__dirname + '/public')); 


app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/views/index.html'); // load our public/index.html file
});

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('App sfmuni started\nListeing on port ' + port);

// expose app           
exports = module.exports = app;                         
