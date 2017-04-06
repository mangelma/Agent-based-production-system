// Created by Max Angelma on 5.4.2017

var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var port = 4107;
var palletArray = {};

// Agentti WS7
var LoadingCell = function LoadingCell() {
    this.place = 7;
    this.job = 4; // 1 screen, 2 keyboard, 3 frame, 4 load/unload, 5 paper in/out
    //this.palletArray = [];
};
var Pallet = function Pallet(id, port) {
    this.id = id;
    // frame, framecolor, screen, screencolor, keyboard, kbcolor
    //this.recipe = recipe;
    this.port = 4100+port;
};
Pallet.prototype.printAll = function () {
    //console.log("PRINTALL");
    console.log("ID: " + this.id + " Port: " + this.port);
};
var WS7 = new LoadingCell();
LoadingCell.prototype.getPalletJSON = function () {
    //console.log("printing json from agent json");
    //console.log(this.palletArray);
    //return this.palletArray;
};
LoadingCell.prototype.init = function() {
    //console.log("WS7 initialized with 123456 as first id in array");
    //this.palletArray[0] = 123456;
};
LoadingCell.prototype.checkJSON = function (iidee) {
    //console.log("Checking uniquity");
    //var palletArray =  WS7.getPalletJSON();
    //return palletArray.id === 'iidee';
}

function updatePalletArray(iidee) {
    console.log("Updating: " + iidee);
    //console.log("exist " + iidee in palletArray);
    // if we dont yet have this id in our array
    if (!(iidee in palletArray)) {
        console.log("New pallet, adding it to array");
        var initPallet = {
            rfid: iidee,
            port: 4100 + Object.keys(palletArray).length,
            frame : 0,
            screen : 0,
            keyboard : 0,
            fcolor : 0,
            scolor : 0,
            kcolor : 0,
            destination: 0,
            hasPaper : 0
        };
        palletArray[iidee] = initPallet;
        //console.log("updated " + JSON.stringify(palletArray));
    } else {
        console.log("Of fuck, multiple events");
    }
};

function checkJSON(palletId) {

    console.log("Checking uniqueness of: " + palletId);

    for (var i = 0; i < palletArray.length; i++) {

        //var thisId = palletArray[i];
        //console.log("Information about: " + thisId.id + " port " + thisId.port);
        //console.log("Comparing: " + palletArray[i].id + " and " + palletArray[i-1].id);

        if ( i >= 1 && palletArray[i].id == palletArray[i-1].id ) {
            console.log("Comparing: " + palletArray[i].id + " and " + palletArray[i-1].id);
            console.log("CHECK: Oh fuck, duplicate ids");
            return false;
        } else {
            console.log("CHECK: no multiple ids, good!");
            return true;
        }

    /*
    var hasTag = function(palletId) {
        var i = null;
        for (i = 0; palletArray.length > i; i += 1) {
            if (palletArray[i].id === palletId) {
                return true;
            }
        }
        return false; */
    };
}

// POST message handling
app.post('/', function(req, res){
    //console.log("POST received with body of ");
    //console.log(req.body);

    // vastataan antille
    if (req.body.id == 'GetPalletInfo') {
        console.log("GetPalletInfo received, with body of ");
        console.log(req.body);
        console.log("Asked palletID " + req.body.palletInfo);
        //var askedPalletId = req.body.palletInfo;
        //console.log(askedPalletId);
        res.write("Hei ANTTI, ID jolta kysyit: ");
        res.write(JSON.stringify(req.body.palletInfo));
        //console.log("Etsitty pallet: " + palletArray[req.body.palletInfo])

        sendInfo(palletArray[req.body.palletInfo]);

        // Pallet loaded event
    } else if (req.body.id == 'PalletLoaded') {
        console.log("Palletloaded received");
        console.log(req.body);
        var key = req.body.payload.PalletID;
        //console.log("posted " + key);
        updatePalletArray(key);
        updatePalletInformation()
    } else {
        console.log("Unidentifiend post message with body: ");
        console.log(req.body);
        res.write("oh snap");
    }
    res.end('\n Information Exhange Sequence End');
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

function sendInfo(message) {
    //message = JSON.stringify(message);
    console.log("Sending information " + message);
    request.post({
        headers: {'content-type' : 'application/json'},
        url: 'http://localhost:4008',
        form: message
            }, function(error, response, body){
            console.log(body);
            if (error) { console.log(error); };
        });
} // end of subscribe

function subscribeToEvents() {
    // initialize also the WS7 here
    WS7.init();
    console.log("Subscribed to PalletLoaded!");
    request.post('http://localhost:3000/RTU/SimROB7/events/PalletLoaded/notifs',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
        //console.log(err);
        console.log(body);
        //console.log(httpResponse);
        });
} // end of subscribe

function logJSON() {
    console.log("\n DEBUG JSON FUNCTION IOT IOT IOT DASD DASD");
    //console.log("PalletArray: " + JSON.stringify(palletArray));
    console.log(palletArray);
    console.log("Lenght: " + Object.keys(palletArray).length);
    //console.log("Array lenght: " + palletArray.length);

   // for (var i = 0; i < palletArray.length; i++) {
     //   var thisId = palletArray[i];
        //console.log("looping throught the Array");
        //console.log(palletArray[i].toString());
        //var thisId = palletArray[i].toString();
        //console.log(thisId);
        //console.log("Type of thisid " + typeof thisId);
        //console.log("Type of palletarray[i] " + typeof palletArray[i]);
        //console.log("Index of " + thisId + " in palletarray: " + palletArray.indexOf(thisId));

        //console.log("Information about: " + thisId.id + " port " + thisId.port);
        //console.log(palletArray[i]);
        //console.log(palletArray[i+1]);
      //  if (i >= 1 && palletArray[i].id == palletArray[i-1].id) {
            //console.log("Oh fuck, duplicate ids");
       // } else {
            //console.log("no multiple ids, good!");
        //}
        //console.log("Index in palletarray: " + palletArray.indexOf(thisId));
        //thisId.printAll();
        //console.log(Pallet.keys(thisId));
   // }

    //console.log(['123456'].printAll());
   // console.log("Stringified: " + JSON.stringify(print));
    //console.log("Whole JSON " + print);
    // "1491319248646"
    //console.log("Only test id: " + print[0]);
    //console.log("Only 1491319248646: " + JSON.stringify(print['1491319248646']));
    //console.log(JSON.stringify(WS7.getPalletJSON()));
} // end of debugging log


http.listen(port, function(){
    console.log('The Agent WS7 is listening in ' + port);
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
setInterval(logJSON, 15000);