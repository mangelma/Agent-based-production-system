// Created by Max Angelma on 5.4.2017

var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var port = 4099;
var indeksi = 0;

function sendOrder() {
    indeksi++;
    request.post({
        headers: { "content-type" : "application/json" },
        url: 'http://localhost:4107/order',
        json: { "id" : "PlaceOrder",
                    "Information" :
                        {
                            "frame" : "testitilaus",
                            "screen" : "selaimesta",
                            "keyboard" : indeksi,
                            "fcolor" : indeksi,
                            "scolor" : indeksi,
                            "kcolor" : indeksi,
                            "destination": indeksi,
                            "hasPaper" : indeksi,
                            "rfid" : 0
                        }
                }
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
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write("<form method='get' action='/'>");
    res.write("<button type='submit' value='Order phone'><h1>Order phone</h1></button>");
    res.write("</form>");
    sendOrder();
    res.end('yes this is is ordering system, make GET request to /order');
    console.log("get received \n");
});

/*
 <form action="/checkXML" method="POST" enctype="multipart/form-data">
 <p> Select an XML file to upload: </p>
 <input type="file" name="xmlFile">
 <input type="submit" value="Validate!">
 </form>
 */

app.get('/order', function(req, res){
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('thank you for ordering a test phone');
    sendOrder();
    console.log("get received \n");
});
