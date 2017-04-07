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

// this function is used to initialize loaded pallets
function updatePalletArray(iidee, initPallet) {
    //console.log("Updating: " + iidee);
    //console.log("exist " + iidee in palletArray);
    // if we dont yet have this id in our array
    if (!(iidee in palletArray)) {
        console.log("New pallet, adding it to array " + iidee);

        if (!initPallet) {
            var initPallet = {
                rfid: iidee,
                port: 4100 + Object.keys(palletArray).length,
                frame : 0, screen : 0, keyboard : 0,
                fcolor : 0, scolor : 0, kcolor : 0,
                destination: 0, hasPaper : 0
            };
        }

        palletArray[iidee] = initPallet;
        //console.log("updated " + JSON.stringify(palletArray));
    } else {
        //console.log("Multiple events, ignoring " + iidee);
    }
};

// this function is used to update pallet information as the order is executed
function updatePalletInformation(iidee, updatedInfo) {
    // if we dont have this id in our array
    if (!(iidee in palletArray)) {
        console.log(iidee + " not found in palletArray, not updating");
    } else {
        palletArray[iidee] = updatedInfo;
    }
}

function checkJSON(palletId) {
    console.log("Checking uniqueness of: " + palletId);
    for (var i = 0; i < palletArray.length; i++) {
        if ( i >= 1 && palletArray[i].id == palletArray[i-1].id ) {
            console.log("Comparing: " + palletArray[i].id + " and " + palletArray[i-1].id);
            console.log("CHECK: Oh fuck, duplicate ids");
            return false;
        } else {
            console.log("CHECK: no multiple ids, good!");
            return true;
        }
    };
}

// POST message handling
app.post('/', function(req, res){
    //console.log(req.body.id + " received!");

    // vastataan antille
    if (req.body.id == 'GetPalletInfo') {
        console.log("GetPalletInfo received, with body of ");
        console.log(req.body);
        console.log("Asked palletID " + req.body.palletInfo);
        //var askedPalletId = req.body.palletInfo;
        //console.log(askedPalletId);
        res.write("Hei ANTTI, ID jolta kysyit: ");
        res.write(JSON.stringify(req.body.palletInfo));
        portti = req.body.portti;
        sendInfo(palletArray[req.body.palletInfo], portti);
        res.write("\n Thank you for asking pallet info");

        // Pallet loaded event
    } else if (req.body.id == 'PalletLoaded') {
        var key = req.body.payload.PalletID;

        var initPallet = {
            rfid: key,
            port: 4100 + Object.keys(palletArray).length,
            frame : 0, screen : 0, keyboard : 0,
            fcolor : 0, scolor : 0, kcolor : 0,
            destination: 1, hasPaper : 0
        };

        updatePalletArray(key, initPallet);
        res.write("Thank you for loading a pallet");

    } else if (req.body.id == 'UpdatePalletInformation') {
        var key = req.body.PalletID;
        var information = req.body.Information;
        console.log("updating " + key + " with information " + JSON.stringify(information));
        updatePalletInformation(key, information);
        res.write("Thank you for updating pallet information");

        // unidentified posts
    } else {
        console.log("Unidentifiend post message with body: ");
        console.log(req.body);
        res.write("oh snap");
    }
    res.end('\n Information Exhange Sequence End');
});

// Order message handling
app.post('/order', function(req, res){
    console.log(req.body.id + " received!");

    if (req.body.id == 'PlaceOrder') {
        var information = req.body.Information;
        console.log("Making order with information " + JSON.stringify(information));
        //updatePalletInformation(key, information);
        invokePalletLoading(information);
        res.write("Thank you for placing order");

    } else {
        console.log("Unidentifiend post message with body: ");
        console.log(req.body);
        res.write("oh snap");
    }
    res.end('\n Order Received');
});

function sendInfo(message, portti) {
    //message = JSON.stringify(message);
    console.log("Sending information " + message);
    request.post({
        headers: {'content-type' : 'application/json'},
        url: 'http://localhost:' + portti,
        form: message
            }, function(error, response, body){
            console.log(body);
            if (error) { console.log(error); };
        });
} // end of subscribe
function subscribeToEvents() {
    // initialize also the WS7 here
    //WS7.init();
    console.log("Subscribed to PalletLoaded!");
    request.post('http://localhost:3000/RTU/SimROB7/events/PalletLoaded/notifs',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
        //console.log(err);
        //console.log(body);
        //console.log(httpResponse);
        });
} // end of subscribe

function invokePalletLoading(information) {

    //console.log("Invoking pallet loading...");
    request.post('http://localhost:3000/RTU/SimROB7/services/LoadPallet',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
            if(err) {
                console.log(err);
            } else {
                //console.log(body);

                setTimeout(function() {
                    //console.log("Invoked palletarray:");
                    //console.log(palletArray);
                    var length = Object.keys(palletArray).length;
                    console.log("lenght: " + length);
                    iidee = palletArray[Object.keys(palletArray)[length-1]];
                    console.log(Object.keys(palletArray)[length-1]);
                    //console.log("iidee: " + iidee);
                    //console.log(JSON.stringify(iidee));
                    console.log("iidee.rfid: " + iidee.rfid);
                    updatePalletInformation(iidee.rfid, information);
                }, 5000);



                //updatePalletInformation(iidee, information);
            }
        });
}

function logJSON() {
    console.log("\n " + Object.keys(palletArray).length + " Pallets in Array");
    console.log(palletArray);
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