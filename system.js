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
        //console.log("New pallet, adding it to array " + iidee);

        if (!initPallet) {
            var initPallet = {
                frame : 0, screen : 0, keyboard : 0,
                fcolor : 0, scolor : 0, kcolor : 0,
                destination: 0, hasPaper : 0,
                rfid: iidee
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
        updatedInfo["rfid"] = iidee;
        console.log("updatedInfo : " + JSON.stringify(updatedInfo));
        palletArray[iidee] = updatedInfo;
    }
}

app.post('/', function(req, res){
    //console.log(req.body.id + " received!");

    // Workcells are asking information about pallets
    if (req.body.id == 'GetPalletInfo') {
        res.write("Hello Workcell");
        //res.write(JSON.stringify(req.body.palletInfo));
        portti = req.body.portti;
        requestedid = palletArray[req.body.palletInfo];
        sendInfo(requestedid, portti);
        logJSON();
        res.write("\n Thank you for asking pallet info");

    } else if (req.body.id == 'PalletLoaded') {
        var key = req.body.payload.PalletID;
        var initPallet = {
            frame : 0, screen : 0, keyboard : 0,
            fcolor : 0, scolor : 0, kcolor : 0,
            destination: 1, hasPaper : 0,
            rfid: key
        };
        updatePalletArray(key, initPallet);
        res.write("\n Thank you for loading a pallet");

    } else if (req.body.id == 'UpdatePalletInformation') {
        var key = req.body.PalletID;
        var information = req.body.Information;
        console.log("updating " + key + " with information " + JSON.stringify(information));
        updatePalletInformation(key, information);
        res.write("\n Thank you for updating pallet information");

    } else if (req.body.id == 'Z1_Changed') {
        //console.log(req.body);
        var key = req.body.payload.PalletID;
        //console.log("Pallet " + key + " is at Zone 1 in " + req.body.senderID);
        try {
            //console.log("hasPaper: " + palletArray[key].hasPaper);
            // jos ei paperi, ajetaan vaan kolmoselle saakka
            // TODO: TESTAA UNLOAD ja käytä eventteja
            if (palletArray[key].hasPaper == 0) {
                movePallet(12);
                setTimeout(function() {
                    movePallet(23);

                    setTimeout(function() {
                        invokePalletUnloading();
                    }, 3000);

                }, 3000);
            }
            // TODO: use events, not timers
            if (palletArray[key].hasPaper == 1) {
                movePallet(12);
                setTimeout(function() {
                    movePallet(23);
                    setTimeout(function() {
                        movePallet(35);
                    }, 3000);
                }, 3000);
            }
        } catch (TypeError) {
            //console.log("PalletID is probably -1");
        }
        res.write("Thank you for updating pallet information");
        // unidentified posts
    } else {
        //console.log("ROOT Unidentifiend post message with body: ");
        //console.log(req.body);
        res.write("oh snap");
    }
    res.end('\n Information Exhange Sequence End');
});

function movePallet(zone) {

    var options = {
        uri: "http://localhost:3000/RTU/SimCNV7/services/TransZone" + zone,
        method: 'POST',
        json: {"destUrl": "http://localhost:" + port}
    };

    request(options, function (error, response, body) {
        if (!error) {
            //console.log(body);
        }
        else{
            //console.log('error');
        }
    });
};

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
        console.log("/order received unidentifiend post message with body: " + req.body);
        res.write("what the fuck? send proper POSTs");
    }
    res.end('\n Order Received');
});

function sendInfo(message, portti) {
    //message = JSON.stringify(message);
    //console.log("Sending information " + message);
    request.post({
        headers: {'content-type' : 'application/json'},
        url: 'http://localhost:' + portti,
        form: message
            }, function(error, response, body){
            //console.log(body);
            if (error) { console.log(error); };
        });
}

function subscribeToEvents() {
    // initialize also the WS7 here
    //WS7.init();

    request.post('http://localhost:3000/RTU/SimROB7/events/PalletLoaded/notifs',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
            if (err) {
                console.log(err);
            } else {
                console.log("Subscribed to PalletLoaded!");
            }
        });

    request.post('http://localhost:3000/RTU/SimCNV7/events/Z1_Changed/notifs',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
            if (err) {
                console.log(err);
            } else {
                console.log("Subscribed to CNV7 Zone1");
            }
        });

    request.post('http://localhost:3000/RTU/SimCNV8/events/Z1_Changed/notifs',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
            if (err) {
                console.log(err);
            } else {
                console.log("Subscribed to CNV8 Z1");
            }
        });
}

function invokePalletLoading(information) {
    console.log("Invoking pallet loading and waiting for 2 seconds");

    request.post('http://localhost:4099',
        {form: {info: information}}, function (err, httpResponse, body) {
            if (err) {
                console.log(err);
            }
        })


    request.post('http://localhost:3000/RTU/SimROB7/services/LoadPallet',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
            if(err) {
                console.log(err);
            } else {
                //console.log(body);

                // waiting for 2 seconds before trying to access palletArray
                setTimeout(function() {
                    var length = Object.keys(palletArray).length;
                    iidee = palletArray[Object.keys(palletArray)[length-1]];
                    try { updatePalletInformation(iidee.rfid, information);
                    } catch (TypeError) {
                        console.log("check simulator events");
                    }
                }, 2000);

                // after two seconds we are also transzoning the loaded pallet from 3 to 5
                setTimeout(function() {
                    request.post('http://localhost:3000/RTU/SimCNV7/services/TransZone35',
                        {form: {destUrl: "http://localhost:" + port}}, function (err, httpResponse, body) {
                            if (err) {
                                console.log(err);
                            }
                        })
                }, 2000);
            }
        });
}

function invokePalletUnloading() {
    request.post('http://localhost:3000/RTU/SimROB7/services/UnloadPallet',
        {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
            if(err) {
                console.log(err);
            }
        });
};

function logJSON() {
    console.log("\n " + Object.keys(palletArray).length + " Pallets in Array");
    console.log(palletArray);
} // end of debugging log
//setInterval(logJSON, 5000);

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