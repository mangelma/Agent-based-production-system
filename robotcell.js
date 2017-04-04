/**
 * Created by Antti on 4.4.2017.
 */
/**
 * Created by Andrei Lobov on 15/02/2017.
 *
 * Communicating persons example...
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
var serverBacePort = 4000 // bace port plus cellnumber



var Robotcell = function Robotcell(place, job) {
    this._place = place;
    this.job = job;
    this.penColor = 'unknown';
    this.state = 'idle';
    this.stack = false;

    this.port = 1234;
    this.url = "127.0.0.1";
};
Robotcell.prototype.CreateServer = function(place)
{
    /*
    app.post('/', function(req, res){
        console.log("POST received with body of ");
        console.log(req.body);
        res.write("oh snap");
        res.end('post ok');
    });

    app.get('/', function(req, res){
        //Handle GET method.
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('yes this is ANTTI');
        console.log("get received \n");
    });
*/
    var server = http.createServer(handleRequest);

    http.listen(serverBacePort+place, function(){
        console.log('The ANTTI is listening in 4001');
        console.log('\n');
    });

}
Robotcell.prototype.SubscribeToCell = function (place)
{
    var options = {
        uri: fastIP+':3000/RTU/CNV8/events/Z1_Changed/notifs',
        method: 'POST',
        json: {"destUrl":"192.168.1.129"}
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body.id) // Print the shortened url.
        }
        console.log(error)

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

Robotcell.prototype.DesideNextPalletDestinaton = function () {

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
var john = new Robotcell(1,'1');

//john.UpdatePalletInformation();
//john.GetPalletInformation();
john.CreateServer();

// Stating computations
//var theResult = g.find("green", []);
//console.log("Result: ", theResult);

//console.log("Connections for e:" + e.getConnections());
