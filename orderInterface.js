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

function send(order) {
    request.post({
        headers: { "content-type" : "application/json" },
        url: 'http://localhost:4107/order',
        json: order
    }, function(error, response, body){
        console.log(body);
        if (error) { console.log(error); };
    });
}

http.listen(port, function(){
    console.log('The order machine is listening to ' + port);
    console.log('\n');
});

// GET message handling, if we want to show something on the browser
app.get('/', function(req, res){
    /*res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write("<form method='get' action='/'>");
    res.write("<button type='submit' value='Order phone'><h1>Order phone</h1></button>");
    res.write("</form>");
    res.write("<h1>PHONE ORDERING SYSTEM</h1>");
    res.write(tilaus.toString());
    sendOrder();
    res.end('GET /, push button or F5');
    console.log("get received \n"); */
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.on('chat message', function(order){
        console.log('order: ' + JSON.stringify(order));
        send(order);
    });
});

app.post('/', function(req, res){
    console.log(req.body);
    tilaus = req.body;
    res.end('\n ordering system received information');
});