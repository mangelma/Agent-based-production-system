/**
* Created by Antti on 4.4.2017.
*/
var replaceall = require('replaceall');
var http = require('http')
var request = require('request');
var express = require('express');
var app = require('express')();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var fastIP = 'http://localhost'
var myIP = 'http://localhost' // komentoriville ipconfig
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
                var data = body.toString()
                data = replaceall("{", "", data)
                data = replaceall("}", "", data)
                data = replaceall('"', "", data)
                data = replaceall(":", ",", data)
                data = replaceall("{", "", data)
                data = replaceall("{", "", data)
                var datatable = data.split(",")
                console.log(datatable[0])
                console.log(datatable[1])
                console.log(datatable[2])
                console.log(datatable[3])
                console.log(datatable[4])
                console.log(datatable[5])
                console.log(datatable[6])
                console.log(datatable[7])
                console.log(datatable[8])
                console.log(datatable[9])
                console.log(datatable[10])

                if(datatable[1] == 'Z1_Changed' && parseInt(datatable[8]) > 0 )
                {
                    console.log('ennen getpalletinformation')
                    ref.GetPalletInformation(datatable[8])
                    console.log('jälkeen getpalletinformation')
                }
                else if(datatable[1] == 'Z4_Changed')
                {
                    ref.MovePallet('TransZone45')
                }


                //Handle request.
                //... ref.makeRequest(...);
                //Parse the body
                //1. Separate three elements of cap., whoAsked and path

                res.end("OK"); //Avoid sender waiting for a reply.


            });

        }
    });

    myServer.listen(port, "127.0.0.1", () => {
    console.log('Agent server is running at http://127.0.0.1:' + port);
});

}
Robotcell.prototype.SubscribeToCell = function (robcon,funktion)
{

    port = this.place+serverBasePort

    var options = {
        uri: fastIP + ':3000/RTU/Sim'+robcon+ this.place + '/events/'+funktion+'/notifs',
        method: 'POST',
        json: {"destUrl": myIP+':'+port}
    };
    console.log(fastIP + ':3000/RTU/'+robcon+ this.place + '/events/'+funktion+'/notifs')
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

Robotcell.prototype.GetPalletInformation = function (palletId)
{
    var ref = this


    var options = {
        uri: fastIP+':4107',
        method: 'POST',
        json: {
            "palletInfo" : ""+palletId+""
        }
    };


var resbody = request(options, function (error, response, body){
        console.log('ny pyydetään tietoja palletista')
        if (!error && response.statusCode == 200) {
            console.log("palletin body =" + body) // Print the shortened url.
            //todo body parsetaan ja sieltä saadaan seuraavat tiedot
            var resepti = [1, 1, 1, 1, 1, 1]
             var destination = 9
            console.log('destination =' + destination)
        }
        else
        {
            console.log(error)
        }

    })
}


Robotcell.prototype.CheckDestination = function ()
//vertaa palletdestionation ja cell plasea.
{

}
Robotcell.prototype.CheckOwnState = function ()
//Tarkistaa oman jonon ja staten
{

}
Robotcell.prototype.MakeJob = function () {

}
//tekee reseptin mukaisen työn, jos vaan soluun mahtuu pallet.


Robotcell.prototype.UpdatePalletInformation = function () {


// muuttaa palletin reseptiä ja destinatiota

    var options = {
        uri: fastIP+':4107',
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


Robotcell.prototype.MovePallet = function (zone)
{

    port = this.place+serverBasePort

    var options = {
        uri: fastIP + ':3000/RTU/SimCNV'+ this.place + '/services/'+zone,
        method: 'POST',
        json: {"destUrl": myIP+':'+port}
    };
    //http://localhost:3000/RTU/CNV*/services/TransZone14
    console.log(fastIP + ':3000/RTU/SimCNV'+ this.place + '/services/TransZone14')
    console.log("destUrl :"+ myIP+':'+port)
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body.id) // Print the shortened url.
            console.log(body)
        }
        else{
            console.log('error ='+error)
            console.log('statuscode ='+response.statusCode)
        }


        console.log('pallet Skipped')
    });



}

// lähettää palletin haluamallasi tavalla

Robotcell.prototype.SendCellInfomation = function () {

}
//lähetä cell information pyydettäessä(state stack pencolor job)




//*** Class definition done. We can start with objects

var john = new Robotcell(8,'1');

//john.UpdatePalletInformation();
//john.GetPalletInformation();
john.RunServer();
john.SubscribeToCell('CNV','Z1_Changed')
john.SubscribeToCell('CNV','Z4_Changed')
john.MovePallet('TransZone14')

// Stating computations
//var theResult = g.find("green", []);
//console.log("Result: ", theResult);

//console.log("Connections for e:" + e.getConnections());