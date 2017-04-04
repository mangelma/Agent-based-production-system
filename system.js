var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


/*
var Pallet = function Pallet(id, recipe, destination) {

    this._id = id;

    // frame, framecolor, screen, screencolor, keyboard, kbcolor
    this.recipe = recipe;
    this.destination = destination;
    this.port = 1234;
    this.url = "127.0.0.1";
};
*/

// Agentti WS7
var LoadingCell = function LoadingCell() {
    this.place = 7;
    this.job = 4; // 1 screen, 2 keyboard, 3 frame, 4 load/unload, 5 paper in/out
    // PalletID tallennetaan WS7:lle loadin yhteydessä, luodaan olio ja annetaan portti
    // WS7 pitää palleteista kirjaa JSON-muodossa
    // pseudoJSON:  { "1491310731396" : {"port":  "4002", "recipe" : "1, 2, 3", "destination" : "5"}
    //                  "1491310731397" : "4003" }
    this.palletDict = [];
};

var WS7 = new LoadingCell();

// getter
LoadingCell.prototype.getPalletJSON = function () {
    //console.log("printing json from agent json");
    //console.log(this.palletDict);
    return this.palletDict;
};

LoadingCell.prototype.init = function() {
    this.palletDict[0] = 123456;
};

// setter
LoadingCell.prototype.updatePalletJSON = function (iidee) {
    console.log("pushing..." + iidee);
    console.log("index is " + this.palletDict.indexOf(iidee));
    if (this.palletDict.indexOf(iidee) == -1) {
        this.palletDict.push(iidee);
    }
};

// POST message handling
app.post('/', function(req, res){
    console.log("POST received with body of ");
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
        console.log(key);
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

// GET message handling
app.get('/', function(req, res){
    //Handle GET method.
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('yes this is pallet');
    console.log("get received \n");
});

// pallet kuuntelee 3001
http.listen(4007, function(){
    console.log('The Agent WS7 is listening in 4001');
    console.log('\n');
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

    WS7.init();

    /*
    console.log("Subscribed to paperloaded");
    var options = {
        uri: 'http://localhost:3000/RTU/ROB1/events/PaperLoaded/notifs',
        method: 'POST',
        json: {"destUrl":"http://localhost:4001"}
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body.id) // Print the shortened url.
        } else {
            console.log(error);
        }
    }); */

    console.log("Subscribed!");
    request.post('http://localhost:3000/RTU/SimROB7/events/PalletLoaded/notifs',
        {form:{destUrl:"http://localhost:4007"}}, function(err,httpResponse,body){
        //console.log(err);
        console.log(body);
        //console.log(httpResponse);
        });
}

/*
Pallet.prototype.runServer = function (port) {
    this.port = port;
    var ref = this;

    var myServer = http.createServer(function(req, res) {
        var method = req.method;
        //console.log(..your message..) - can be used in many places for the debugging peurposes.
        console.log("Method: " + method);

        // selaindebuggausta varten jotain
        if(method == 'GET'){
            //Handle GET method.
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Pallet ' + ref._id + ' with recipe ' + ref.recipe);

            // POSTilla tilaus sisään
        } else if(method == 'POST'){
            console.log(req.body);
            //Handle POST method.
            var body = []; //Getting data: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
            req.on('data', function(chunk) {
               body.push(chunk);
                //console.log(body.toString());
                console.log(body);
                console.log(body.toString());
                var elem = body.toString().split(";");
                console.log(elem);
                res.end("OK"); //Avoid sender waiting for a reply.

            });
        }
    });

    myServer.listen(port, "127.0.0.1", () => {
        console.log('Agent server ' + ref._name + ' is running at http://127.0.0.1:' + port);
});
};

a.runServer(3001);
*/
/* SUBSCRIBE EVENTTEIHIN TÄLLÄ
Person.prototype.makeRequest = function (whoToAsk, req) {

    var options = {
        method: 'post',
        body: req, // Javascript object
        url: "http://127.0.0.1:" + whoToAsk,
        headers: {
            'Content-Type': 'text/plain'
        }
    };

    //Print the result of the HTTP POST request
    request(options, function (err, res, body) {
        if (err) {
            console.log('Error :', err);
            return;
        }
        console.log(body);
        //Process response
        //res.write("OK");
        //    res.end("OK");
    });

};
*/

subscribeToEvents();

function logJSON() {

    console.log("\n DEBUG JSON FUNCTION IOT IOT IOT DASD DASD");

    var print = WS7.getPalletJSON();

    console.log(print);
    //console.log(print.length);

   // console.log("Stringified: " + JSON.stringify(print));

    //console.log("Whole JSON " + print);

    // "1491319248646"

   // console.log("Only test id: " + print['123456']);
    //console.log("Only 1491319248646: " + JSON.stringify(print['1491319248646']));

    //console.log(JSON.stringify(WS7.getPalletJSON()));
}

setInterval(logJSON, 5000);
// create Workcell 7 which loads the pallets

//setInterval(printRecipe, 15000);
//setInterval(changeRecipe, 5000);