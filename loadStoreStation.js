// Created by Max Angelma on 5.4.2017

var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var port = 4107; // port for listening
var palletArray = {}; // JSON for storing pallets and orders on them
var debugging = false;

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

// this function is used to initialize loaded pallets
function updatePalletArray(iidee, initPallet) {

    // if we dont yet have this id in our array
    if (!(iidee in palletArray)) { if (debugging) { console.log("New pallet, adding it to array " + iidee) }
        if (!initPallet) {
            console.log("Input argument not received, returning...");
            return;
        } else {  palletArray[iidee] = initPallet; }

    // if we already have this id, ignoring
    } else {
        if (debugging) { console.log("Multiple events, ignoring " + iidee) }
    }
}

// this function is used to update pallet information as the order is executed
function updatePalletInformation(iidee, updatedInfo) {
    // if we dont have this id in our array
    if (!(iidee in palletArray)) {
        if (debugging) { console.log(iidee + " not found in palletArray, not updating") }
    } else {
        updatedInfo["rfid"] = iidee;
        if (debugging) { console.log("updatedInfo : " + JSON.stringify(updatedInfo)) }
        palletArray[iidee] = updatedInfo;
    }
}

function sendInfo(message, portti) {
    //message = JSON.stringify(message);
    //console.log("Sending information " + message);
    request.post({
        headers: {'content-type' : 'application/json'},
        url: 'http://localhost:' + portti,
        form: message
    }, function(error, response, body){
        //console.log(body);
        if (error) { console.log(error); }
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
}

function movePallet(zone) {

    var options = {
        uri: "http://localhost:3000/RTU/SimCNV7/services/TransZone" + zone,
        method: 'POST',
        json: {"destUrl": "http://localhost:" + port}
    };

    request(options, function (error, response, body) {
        if (!error) { //console.log(body);
        }
        else { //console.log('error');
        }
    });
}

function logJSON() {
    console.log("\n " + Object.keys(palletArray).length + " Pallets in Array");
    console.log(palletArray);
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
        logJSON(); // log the recipe every time palletInfo is asked
        res.write("\n Thank you for asking pallet info");

        // pallet loaded event
    } else if (req.body.id == 'PalletLoaded') {
        var key = req.body.payload.PalletID;

        // for newborn pallets, we give just zeros
        var initPallet = {
            frame : 0, screen : 0, keyboard : 0, fcolor : 0, scolor : 0, kcolor : 0,
            destination: 1, hasPaper : 0, rfid: key };

        // and add these baby pallets to our "database", which is JSON array
        updatePalletArray(key, initPallet);
        res.write("\n Thank you for loading a pallet");


        // Workcells are updating recipe and destination during the process
    } else if (req.body.id == 'UpdatePalletInformation') {
        var key = req.body.PalletID;
        var information = req.body.Information;
        console.log("updating " + key + " with information " + JSON.stringify(information));
        updatePalletInformation(key, information);
        res.write("\n Thank you for updating pallet information");

        // Zone 1 event handling here
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
       if (debugging) { console.log(req.body); }
        res.write("oh snap");
    }
    res.end('\n Information Exhange Sequence End');
});

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

http.listen(port, function(){
    console.log('The Agent WS7 is listening in ' + port);
    console.log('\n');
});

subscribeToEvents();

if (debugging == true) { setInterval(logJSON, 5000); }