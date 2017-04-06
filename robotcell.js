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
var statearr = [];
var onlinecells = 2; //online robotcells miinus 1, ei lasketa 1 ja 7 cell


var Robotcell = function Robotcell(place, job) {
    this.place = place;
    this.job = job;
    this.penColor = 'red';
    this.state = 'idle';
    this.stack = 'false';



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
                data = replaceall("=", ",", data)
                data = replaceall("&", ",", data)
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
                console.log(datatable[11])
                console.log(datatable[12])
                console.log(datatable[13])
                console.log(datatable[14])
                console.log(datatable[15])
                console.log(datatable[16])
                console.log(datatable[17])
                console.log(datatable[18])
                console.log(datatable[19])

                if(datatable[1] == 'Z1_Changed' && parseInt(datatable[8]) > 0 )
                {
                    ref.GetPalletInformation(datatable[8])
                }
                else if(datatable[1] == 'Z2_Changed')
                {
                    console.log('pallet tuli zone2 cell '+this.place)
                    ref.MovePallet('TransZone23')
                }
                else if(datatable[1] == 'Z3_Changed')
                {
                   console.log('robot starts working in '+ this.place)
                }
                else if(datatable[1] == 'Z4_Changed')
                {
                    console.log('pallet tuli zone4 cell '+this.place)
                    ref.MovePallet('TransZone45')
                }
                else if(datatable[0] == 'getCellinfo')
                {
                    var passResepti = datatable[3]+","+datatable[4]+","+datatable[5]+","+datatable[6]+","+datatable[7]+","+datatable[8]
                    console.log(passResepti)
                    var passID = datatable[10]
                    ref.SendCellInfomation(datatable[1],passResepti, passID)
                }
                else if(datatable[4] == 'frame')
                {
                    console.log('meitte tuli tietoa palletista')
                    var resepti = datatable[5]+","+datatable[7]+","+datatable[9]+","+datatable[11]+","+datatable[13]
                        +","+datatable[15]
                    if(datatable[17] == 0)
                    {
                        console.log('pallet on cell '+this.place+'desideNExtDestination')
                        ref.DecideNextPalletDestinaton(resepti, datatable[8])
                    }
                    else if(parseInt(datatable[17]) == this.place)
                    {
                        console.log('pallet on cell '+this.place+'makeJOb')
                        ref.MakeJob(resepti)
                    }
                    else
                    {
                        console.log('pallet on cell '+this.place+'ei kuulu meille skipataan')
                        ref.MovePallet('TransZone14')
                    }
                    console.log(resepti)

                }
                if(datatable[0] == 'sendCellInfo')
                {
                    console.log(statearr)
                    console.log('cell infoa saatu')
                    console.log(datatable[1]+","+datatable[2]+","+datatable[3]+","+datatable[4]+","+datatable[5]+
                    ","+datatable[6]+","+datatable[7]+","+datatable[8]+","+datatable[9]+","+datatable[10]+","+datatable[11]+
                        ","+datatable[12])
                    statearr.push(datatable[1]+","+datatable[2]+","+datatable[3]+","+datatable[4]+","+datatable[5]+
                    ","+datatable[6]+","+datatable[7]+","+datatable[8]+","+datatable[9]+","+datatable[10]+","+datatable[11]+
                    ","+datatable[12])
                    if(statearr.length > onlinecells)
                    {
                        console.log('ny päätetään')
                        console.log(statearr[0])
                        console.log(statearr[1])
                        console.log(statearr[2])
                        console.log(statearr[3])
                        console.log(statearr[4])
                        console.log(statearr[5])
                        var i = 5
                        if(statearr[0].split(",")[5] == '0')
                        {
                            console.log('eka nolla')
                            i=6
                            if(statearr[0].split(",")[6] == '0')
                            {
                                i=7
                                console.log('toka nolla')
                                if(statearr[0].split(",")[7] == '0')
                                {
                                    console.log('kolmas nolla')
                                    console.log('lähetetään paperin vaihtoon cell1')

                                }

                            }

                        }
                        console.log(i)
                        while(true)
                        {
                            if(statearr[0].split(",")[1] == statearr[0].split(",")[i] )
                            {
                                console.log('työtekiä löytynyt')

                                if(statearr[0].split(",")[3] == 'idle')
                                {
                                    console.log('työntekiä vapaana')
                                    var uprecept = statearr[0].split(",")[5]+","+statearr[0].split(",")[6]+","+
                                        statearr[0].split(",")[7]+","+statearr[0].split(",")[8]+","+
                                        statearr[0].split(",")[9]+","+statearr[0].split(",")[10]
                                    var updestination = statearr[0].split(",")[0]
                                    var upID =statearr[0].split(",")[11]
                                    console.log(uprecept)
                                    console.log(updestination)
                                    console.log(upID)
                                    ref.UpdatePalletInformation(uprecept, updestination,upID)

                                    break
                                }
                                else
                                {
                                    console.log('työntekiä kiireinen')
                                    statearr.shift()
                                }
                            }
                            else
                            {
                                statearr.shift()
                                if (statearr.length == 0)
                                {
                                    console.log('ei löytyny sopivaa työntekiää')
                                    this.MovePallet('TransZone14')
                                    break
                                }
                            }
                        }

                    }
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

Robotcell.prototype.GetPalletInformation = function (palletId, resepti)
{
    var ref = this


    var options = {
        uri: fastIP+':4107',
        method: 'POST',
        json: {
            "id" : "GetPalletInfo","palletInfo": ""+palletId+""
        }
    };

    var destination= 0;
    request(options, function (error, response, body){
        console.log('ny pyydetään tietoja palletista');
        if (!error && response.statusCode == 200) {
            console.log("palletin body =" + body); // Print the shortened url.
            //todo body parsetaan ja sieltä saadaan seuraavat tiedot
            var resepti = [1, 1, 1, 1, 1, 1];
             destination = 9;
            console.log('destination =' + destination);
           // ref.MovePallet('TransZone14')
        }
        else
        {
            console.log(error);
        }

    })
    console.log(destination);
}


Robotcell.prototype.CheckDestination = function ()
//vertaa palletdestionation ja cell plasea.
{

}
Robotcell.prototype.CheckOwnState = function ()
//Tarkistaa oman jonon ja staten
{

}
Robotcell.prototype.MakeJob = function (recept)
{

    var reseptTable = recept.split(",")
    console.log(reseptTable[0])
    console.log(reseptTable[1])
    console.log(reseptTable[2])
    console.log(reseptTable[3])
    console.log(reseptTable[4])
    console.log(reseptTable[5])
    if(this.state == 'busy') {
        this.MovePallet('Tranzone14')
    }
    else
    {
        this.MovePallet('TransZone12')

    }



}
//tekee reseptin mukaisen työn, jos vaan soluun mahtuu pallet.


Robotcell.prototype.UpdatePalletInformation = function (recept, destination, ID) {


// muuttaa palletin reseptiä ja destinatiota
    var uprecept =recept.split(",")

    var options = {
        uri: fastIP+':4107',
        method: 'POST',
        json: {
            "id" : "UpdatePalletInformation", "PalletID" : ID, "Information" : {
                "frame" : uprecept[0],
                "screen" : uprecept[1],
                "keyboard" : uprecept[2],
                "fcolor" : uprecept[3],
                "scolor" : uprecept[4],
                "kcolor" : uprecept[5],
                "destination": destination,

            }
        }
              };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body.id) // Print the shortened url.
        }
        console.log(response.body);

        //console.log(error)
//sgfrftiopål
    });
    console.log('perkele')


}
Robotcell.prototype.GetCellStates = function (cellPlace, recept, ID)
{
    console.log('ny pyydetään tietoja palletista');
    var ref = this
    var cellport = serverBasePort+cellPlace

    var options = {
        uri: fastIP+':'+cellport,
        method: 'POST',
        json: {
            "getCellinfo" : ""+cellPlace+"", "resepti": recept, "ID": ID
        }
    };

    var destination= 0;
    request(options, function (error, response, body){

        if (!error && response.statusCode == 200) {
            console.log("palletin body =" + body); // Print the shortened url.
        }
        else
        {
            console.log(error);
        }

    })

}
// kysyy kaikilta soluita (state, stack, pencolor, job

Robotcell.prototype.DecideNextPalletDestinaton = function (recept, ID) {
    console.log('ny päätetään seuraava pallet destination')
    this.GetCellStates(9,recept,ID)
    this.GetCellStates(8,recept,ID)
    this.GetCellStates(10,recept,ID)


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
    console.log(fastIP + ':3000/RTU/SimCNV'+ this.place + '/services/'+zone)
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

Robotcell.prototype.SendCellInfomation = function (cellPlace, resepti, ID)
{
    console.log('ny pitäisi lähettää pallet informaatiota')
    var ref = this
    var cellport = serverBasePort+parseInt(cellPlace)

    var options = {
        uri: fastIP+':'+cellport,
        method: 'POST',
        json: {
            "sendCellInfo" : ""+this.place+","+this.job+","+this.penColor+","+this.state+","+this.stack+","+resepti+","+ID
        }
    };

    var destination= 0;
    request(options, function (error, response, body){
        if (!error && response.statusCode == 200) {
            console.log("palletin body =" + body); // Print the shortened url.
        }
        else
        {
            console.log(error);
        }

    })

}
//lähetä cell information pyydettäessä(state stack pencolor job)




//*** Class definition done. We can start with objects

var john = new Robotcell(8,'1');
var max = new Robotcell(9,'2');
var joonas = new Robotcell(10,'3')

//john.UpdatePalletInformation();
//john.GetPalletInformation();
//john.RunServer();
//john.SubscribeToCell('CNV','Z1_Changed')
//john.SubscribeToCell('CNV','Z2_Changed')
//john.SubscribeToCell('CNV','Z3_Changed')
//john.SubscribeToCell('CNV','Z4_Changed')


//john.MovePallet('TransZone12')
//john.MakeJob('0,0,0,0,0,0')
//john.GetCellStates(8,'3,0,0,0,0,0','213123212')
//john.GetCellStates(9,'3,0,0,0,0,0','213123212')
//john.GetCellStates(10,'3,0,0,0,0,0','213123212')
//john.UpdatePalletInformation()


//joonas.RunServer();
max.RunServer();
max.SubscribeToCell('CNV','Z1_Changed')
max.SubscribeToCell('CNV','Z2_Changed')
max.SubscribeToCell('CNV','Z3_Changed')
max.SubscribeToCell('CNV','Z4_Changed')
// Stating computations
//var theResult = g.find("green", []);
//console.log("Result: ", theResult);

//console.log("Connections for e:" + e.getConnections());