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

    console.log("sending:");
    console.log(order);

    request.post({
        headers: { "content-type" : "application/json" },
        url: 'http://localhost:4107/order',
        json: order
    }, function(error, response, body){
        //console.log(body);
        if (error) { console.log(error); }
    });
}

function pollSimulator() {
    request.get({
        url: 'http://localhost:3000/RTU/CNV7/data/S1'
    }, function(error, response, body){
        //console.log(body);
        if (error) {
            var fault = error.code;
            console.log(fault);
            io.emit('simulatorState', fault);
            //throw TypeError ("Simulator is offline, please come next year");
        } else {
            //console.log("simulator is alive");
            io.emit('simulatorState', "OK");
        }
    });
}

setInterval(pollSimulator, 5000);

// listening to port 4099
http.listen(port, function(){
    console.log('The order gateway is listening to ' + port);
    console.log('\n');
});

// GET sends index.html
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var i = 0;

// Socket.io magic happens here
io.on('connection', function(socket){

    socket.on('moveToProd', function(order){

        console.log("MovetoProd socket io received");
        console.log(order);

        if (order != "0") {
            i++;
            send(order);
            console.log("Order: " + i);
            //io.emit('emitOrder', order);

        }
    });

    socket.on('queue', function(order){

        console.log("Queue socket io received, not executing anything. Should I do something?");
        //console.log(order);
/*
        if (order != "0") {
            i++;
            send(order);
            console.log("Order: " + i);

            setTimeout(function() {
                io.emit('emitOrder', order);
            },1000);

        } */
    });

});

// POSTs handled here, no functionality yet
app.post('/', function(req, res){
    console.log("order ready?");
    console.log(req.body);

    var finished = req.body.rfid +
            ", " +
        req.body.fcolor +
            " " +
        req.body.frame +
            ", " +
        req.body.scolor +
        " " +
        req.body.screen +
            ", " +
        req.body.kcolor +
            " " +
        req.body.keyboard;

    console.log(finished);

    io.emit('finishedOrder', finished);

    //tilaus = req.body;
    //console.log(tilaus);
    res.end('\n ordering system received information');
});


// for debugging, not actually needed
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

//subscribeToEvents();