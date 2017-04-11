// Created by Max Angelma on 5.4.2017
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var port = 4099;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var tilaus;

// JSON-order is sent here
function send(order) {
    request.post({
        headers: { "content-type" : "application/json" },
        url: 'http://localhost:4107/order',
        json: order
    }, function(error, response, body){
        //console.log(body);
        if (error) { console.log(error); }
    });
}

// listening to port 4099
http.listen(port, function(){
    console.log('The order gateway is listening to ' + port);
    console.log('\n');
});

// GET sends index.html
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// Socket.io magic happens here
io.on('connection', function(socket){
    socket.on('chat message', function(order){
        if (order != "0") { send(order); console.log("Order: "); console.log(order); }
    });
});

// POSTs handled here, no functionality yet
app.post('/', function(req, res){
    //console.log(req.body);
    tilaus = req.body;
    console.log(tilaus);
    res.end('\n ordering system received information');
});


function subscribeToEvents() {

    request.post('http://localhost:3000/RTU/SimCNV8/events/Z1_Changed/notifs',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
            if (err) {
                console.log(err);
            } else {
                console.log("Subscribed to CNV8 Zone1");
            }
        });

    request.post('http://localhost:3000/RTU/SimCNV8/events/Z2_Changed/notifs',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
            if (err) {
                console.log(err);
            } else {
                console.log("Subscribed to CNV8 Zone2!");
            }
        });

    request.post('http://localhost:3000/RTU/SimCNV8/events/Z3_Changed/notifs',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
            if (err) {
                console.log(err);
            } else {
                console.log("Subscribed to CNV8 Zone3");
            }
        });
}

subscribeToEvents();