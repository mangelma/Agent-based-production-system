/**
 * Created by Antti on 4.4.2017.
 */
var http = require('http');
var request = require('request');
var express = require('express');
var app = require('express')();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var fastIP = 'http://192.168.1.150'
var myIP = 'http://192.168.1.129' // komentoriville ipconfig
var serverBasePort = 4000 // Base port plus cellnumber



var Robotcell = function Robotcell(place, job) {
    this.place = place;
    this.job = job;
    this.penColor = 'unknown';
    this.state = 'idle';
    this.stack = false;

    this.port = 1234;
    this.url = "127.0.0.1";
};
Robotcell.prototype.RunServer = function()
{
    port = this.place+serverBasePort
    console.log(port)
    var ref = this;

    var myServer = http.createServer(function(req, res) {
        var method = req.method;
        //console.log(..your message..) - can be used in many places for the debugging peurposes.
        console.log("Method: " + method);

        if(method == 'GET'){
            //Handle GET method.
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Agent ' + ref._name + ' is running.');
        } else if(method == 'POST'){
            //Handle POST method.
            var body = []; //Getting data: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
            req.on('data', function(chunk) {
                body.push(chunk);
                console.log("Body???: " + body.toString());
                //Handle request.
                //... ref.makeRequest(...);
                //Parse the body
                //1. Separate three elements of cap., whoAsked and path

                res.end("OK"); //Avoid sender waiting for a reply.


            });

        }
    });

    myServer.listen(port, "127.0.0.1", () => {
        console.log('Agent server ' + ref._name + ' is running at http://127.0.0.1:' + port);
});
}
Robotcell.prototype.SubscribeToCell = function (robcon,funktion)
{

    port = this.place+serverBasePort

    var options = {
        uri: fastIP + ':3000/RTU/Sim'+robcon+ this.place + '/events/Z1_Changed/notifs',
        method: 'POST',
        json: {"destUrl": myIP+':'+port}
    };
    console.log(fastIP + ':3000/RTU/'+robcon+ this.place + '/events/Z1_Changed/notifs')
    console.log("destUrl :"+ myIP+':'+port)
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body.id) // Print the shortened url.
        }
        console.log('error ='+error)
        console.log(body)
        console.log('subscriped to '+funktion)
    });



}

Robotcell.prototype.GetPalletInformation = function ()
{


    var options = {
        uri: fastIP+':4007',
        method: 'POST',
        json: {
            "id" : "123456"
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body.id) // Print the shortened url.
        }
        console.log(error)

    });
    console.log('perkele')
}
//takaisin resepti ja destination

Robotcell.prototype.CheckDestination = function () {

}
//vertaa palletdestionation ja cell plasea.
{

}
Robotcell.prototype.CheckOwnState = function () {

}
//Tarkistaa oman jonon ja staten
{

}
Robotcell.prototype.MakeJob = function () {

}
//tekee reseptin mukaisen työn, jos vaan soluun mahtuu pallet.


Robotcell.prototype.UpdatePalletInformation = function () {


// muuttaa palletin reseptiä ja destinatiota

        var options = {
            uri: fastIP+':4007',
            method: 'POST',
            json: {
                "order": "[10 , 2, 3, 4, 5, 6]"
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log(body.id) // Print the shortened url.
            }
            console.log(response.body);
            //console.log(error)

        });
        console.log('perkele')


}
Robotcell.prototype.GetCellStates = function () {

}
// kysyy kaikilta soluita (state, stack, pencolor, job

Robotcell.prototype.DecideNextPalletDestinaton = function () {

}
//päätä getcellstate tietojen pohjalta mihin pallet menee seuraavaksi

Robotcell.prototype.SimulatePalletArrivesToCON1 = function () {

}


Robotcell.prototype.SkipPallet = function () {

}
// lähettää palletin 1to4 ja 4 to 5

Robotcell.prototype.SendCellInfomation = function () {

}
//lähetä cell information pyydettäessä(state stack pencolor job)




//*** Class definition done. We can start with objects

var john = new Robotcell(8,'1');

//john.UpdatePalletInformation();
//john.GetPalletInformation();
john.RunServer();
john.SubscribeToCell('CNV','Z1_Changed')


// Stating computations
//var theResult = g.find("green", []);
//console.log("Result: ", theResult);

//console.log("Connections for e:" + e.getConnections());
