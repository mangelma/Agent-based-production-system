/**
 * Created by Weckström on 8.4.2017.
 */

var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser');
var replaceall = require('replaceall');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var port = 4101;
var fastIP = 'http://localhost'

http.listen(port, function(){
  console.log('The Agent WS1 is listening in ' + port);
  console.log('\n');
});

// Aika kauheen näkönen, jäi alkucopypasteista... Voin muokata, jos tarvitsee
function subscribeToEvents() {

  console.log("Subscribed to PaperLoaded!");
  request.post('http://localhost:3000/RTU/SimROB1/events/PaperLoaded/notifs',
    {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
    });
  console.log("Subscribed to PaperUnloaded!");
  request.post('http://localhost:3000/RTU/SimROB1/events/PaperUnloaded/notifs',
    {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
      //console.log(err);
      //console.log(body);
      //console.log(httpResponse);
    });
  console.log("Subscribed to Z1_Changed!");
  request.post('	http://localhost:3000/RTU/SimCNV1/events/Z1_Changed/notifs',
    {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
      //console.log(err);
      //console.log(body);
      //console.log(httpResponse);
    });
  console.log("Subscribed to Z2_Changed!");
  request.post('	http://localhost:3000/RTU/SimCNV1/events/Z2_Changed/notifs',
    {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
      //console.log(err);
      //console.log(body);
      //console.log(httpResponse);
    });
  console.log("Subscribed to Z3_Changed!");
  request.post('	http://localhost:3000/RTU/SimCNV1/events/Z3_Changed/notifs',
    {form:{destUrl:"http://localhost:" + port}}, function(err,httpResponse,body){
      //console.log(err);
      //console.log(body);
      //console.log(httpResponse);
    });
}

function TransZone(route){
  var options = {
    uri: 'http://localhost:3000/RTU/SimCNV1/services/TransZone'+route,
    method: 'POST',
    json: {"destUrl": 'http://localhost:4101'}
  };
  console.log("Moving pallet "+route);
  request.post(options);
}

function GetPalletInformation(PalletID){
  var options = {
    uri: fastIP+':4107',
    method: 'POST',
    json: {
      "id" : "GetPalletInfo","palletInfo":PalletID, "portti": '4101'
    }
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log("palletin body =" + body); // Print the shortened url.
    } else {
      console.log(error);
    }
  });
}

function LoadPaper(){
  var options = {
    uri: 'http://localhost:3000/RTU/SimROB1/services/LoadPaper',
    method: 'POST',
    json: {"destUrl": 'http://localhost:4101'}
  };
  console.log('Loading paper.');
  request.post(options);
}

function UnloadPaper(){
  var options = {
    uri: 'http://localhost:3000/RTU/SimROB1/services/UnloadPaper',
    method: 'POST',
    json: {"destUrl": 'http://localhost:4101'}
  };
  console.log('Removing paper.');
  request.post(options);
}

// muuttaa palletin reseptiä ja destinatiota
function UpdatePalletInformation (recipe, paperBool, destination, ID) {
  var uprecept =recipe.split(",")
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
        "hasPaper" : paperBool,
      }
    }
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body.id) // Print the shortened url.
    }
    console.log(response.body);
  });
};

// POST message handling
app.post('/', function(req, res) {
    //console.log(req.body.id + " received!");

    // Parse incoming POST message body
    var data = JSON.stringify(req.body)
    console.log(data);
    data = replaceall("{", "", data)
    data = replaceall("}", "", data)
    data = replaceall('"', "", data)
    data = replaceall(":", ",", data)
    data = replaceall("{", "", data)
    data = replaceall("=", ",", data)
    data = replaceall("&", ",", data)
    var datatable = data.split(",")

    // Gather recipe values used in UpdatePalletInformation
    var recipe = datatable[1]+","+datatable[3]+","+datatable[5]+","+datatable[7]+","+datatable[9]+","+datatable[11];

    // Let's move the pallet straight to Z3 where pallet details will be checked
    if ((req.body.id == 'Z1_Changed') && (req.body.payload.PalletID != -1)) {
      TransZone("12");
    }
    else if ((req.body.id == 'Z2_Changed') && (req.body.payload.PalletID != -1)) {
      TransZone("23");
    }
    else if ((req.body.id == 'Z3_Changed') && (req.body.payload.PalletID != -1)) {
      GetPalletInformation(req.body.payload.PalletID); // Pallet status?
      console.log("Pallet without paper, loading a piece...");
      LoadPaper();
      UpdatePalletInformation(recipe,'1','2',datatable[17]); // Update pallet information, destination always 2
    }
    // Check if product on pallet is finished
    else if() {
      if ((datatable[1] == '0') && (datatable[3] == '0') && (datatable[5] == '0')) {
        console.log('Product ready, removing...');
        UnloadPaper();
        UpdatePalletInformation(recipe, '0', '2', datatable[17]);
      } else {
        TransZone('35');
      }
    }
    // Transfer pallet from WS1 to WS2 after loading/unloading
    else if((req.body.id == 'PaperLoaded') || (req.body.id == 'PaperUnloaded')){
      TransZone('35');
    }
    res.end('\n Information Exhange Sequence End');
  });

subscribeToEvents();
