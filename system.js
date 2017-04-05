// Created by Max Angelma on 5.4.2017

var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Agentti WS7
var LoadingCell = function LoadingCell() {
    this.place = 7;
    this.job = 4; // 1 screen, 2 keyboard, 3 frame, 4 load/unload, 5 paper in/out
    this.palletDict = [];
};

var Pallet = function Pallet(id, port) {
    this.id = id;
    // frame, framecolor, screen, screencolor, keyboard, kbcolor
    //this.recipe = recipe;
    this.port = 4100+port;
};

Pallet.prototype.printAll = function () {
    console.log("PRINTALL");
    console.log("ID: " + this.id);
    console.log("Port: " + this.port);
};

var WS7 = new LoadingCell();
var palikka =  new Pallet(1234, 1234);
palikka.printAll();
//var String(1234) = new Pallet(3456, 1232);
//String(1234).printAll();

LoadingCell.prototype.getPalletJSON = function () {
    //console.log("printing json from agent json");
    //console.log(this.palletDict);
    return this.palletDict;
};

LoadingCell.prototype.init = function() {
    //console.log("WS7 initialized with 123456 as first id in array");
    //this.palletDict[0] = 123456;
};

// setter
LoadingCell.prototype.updatePalletJSON = function (iidee) {

    iidee = iidee.toString();

    if (this.palletDict.indexOf(iidee) == -1) {
        console.log("New PalletID " + iidee + ", pushing it to array")

        var print = this.getPalletJSON();
        console.log("Pallet Array: " + print);
        //console.log("Length of array is : " + this.palletDict.length);
        //var newName = "Pallet" + this.palletDict.length;
       // var n = num.toString();
        //n = new Pallet(1234, 10);
        //.printAll();
        var portsuffix = this.palletDict.length;
        //console.log(newName);§
        iidee = new Pallet(iidee, portsuffix);
        console.log(iidee);
        this.palletDict.push(iidee);
        iidee.printAll();
    } else {
        //console.log("Same event received multiple times, not pushing to array");
    }
};

// POST message handling
app.post('/', function(req, res){
    //console.log("POST received with body of ");
    //console.log(req.body);

    // vastataan antille
    if (req.body.id != "PalletLoaded") {

        pallet = req.body.id;

        //res.write("Hei antti");
        //res.write( JSON.stringify( WS7.getPalletJSON() ) );
        //res.write(WS7.getPalletJSON.pallet);

        // Pallet loaded event
    } else if (req.body.payload.PalletID) {

        var key = req.body.payload.PalletID;
        //console.log(key);
        //console.log(req.body.payload.PalletID);
        // format jason here
        //var jason = '{"' + key + '" : {"recipe" : [0, 0, 0, 0, 0, 0], "destination" : "0" }} ';
        //console.log("Text jason: " + jason);
        //var parsed = JSON.parse(jason);
        //console.log("Parsed jason: " + parsed);

        WS7.updatePalletJSON(key);

        //console.log("metodilla palautettu: " + WS7.getPalletJSON());
        //console.log(JSON.stringify( WS7.getPalletJSON() ) ) ;
    } else {
        res.write("oh snap");
    }

    res.end('post ok');
});


function changeRecipe() {
    first++;
    var options = {
        uri: 'http://127.0.0.1:4001/',
        method: 'POST',
        json: {
            "order" : "[" + first + ", 2, 3, 4, 5, 6]"
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body.id) // Print the shortened url.
        }
    });
}

// HUOM
// urlit muotoa http://localhost:3000/RTU/SimROB7/events/PalletLoaded/notifs
// HUOM

function subscribeToEvents() {
    // initialize also the WS7 here
    WS7.init();
    console.log("Subscribed to PalletLoaded!");
    request.post('http://localhost:3000/RTU/SimROB7/events/PalletLoaded/notifs',
        {form:{destUrl:"http://localhost:4007"}}, function(err,httpResponse,body){
        //console.log(err);
        console.log(body);
        //console.log(httpResponse);
        });
} // end of subscribe

function logJSON() {
    console.log("DEBUG JSON FUNCTION IOT IOT IOT DASD DASD");
    var palletArray = WS7.getPalletJSON();

    for (var i = 0; i < palletArray.length; i++) {
        //console.log(palletArray[i].toString());
        //var thisId = palletArray[i].toString();
        var thisId = palletArray[i];
        //console.log(thisId);

        //console.log("Type of thisid " + typeof thisId);
        //console.log("Type of palletarray[i] " + typeof palletArray[i]);

        //console.log("Index of " + thisId + " in palletarray: " + palletArray.indexOf(thisId));
        //console.log(WS7.getPalletJSON());
        //console.log("Testipalikka: " + palikka);
        //console.log("Palikka.printAll: ");
        //palikka.printAll();
        console.log("Information about: " + thisId.id);
        console.log("Index in palletarray: " + palletArray.indexOf(thisId));
        thisId.printAll();
        //console.log(Pallet.keys(thisId));
    }

    //console.log(['123456'].printAll());

   // console.log("Stringified: " + JSON.stringify(print));
    //console.log("Whole JSON " + print);
    // "1491319248646"
    //console.log("Only test id: " + print[0]);
    //console.log("Only 1491319248646: " + JSON.stringify(print['1491319248646']));
    //console.log(JSON.stringify(WS7.getPalletJSON()));
} // end of debugging log


http.listen(4007, function(){
    console.log('The Agent WS7 is listening in 4001');
    console.log('\n');
});

// GET message handling, if we want to show something on the browser
app.get('/', function(req, res){
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('yes this is pallet');
    console.log("get received \n");
});

subscribeToEvents();
setInterval(logJSON, 5000);