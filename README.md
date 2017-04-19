# Agent-based control of a production system
NodeJS based assignment work for the TUT course Distributed Automation Systems

Use:
* Start the FASTory simulator first
* runTheSystem.bat 
* open http://localhost:4099/ to make orders

```javascript
// orderInterface.js can be used to send this message
// Using only parts and colors should work, but better to send also destination, hasPaper and rfid
{ "id" : "PlaceOrder",
      "Information" :
           {
               "frame" : "1",
               "screen" : "2",
               "keyboard" : "3",
               "fcolor" : "red",
               "scolor" : "green",
               "kcolor" : "blue",
               "destination": 0,
               "hasPaper" : 0,
               "rfid" : 0 // will be initialized once the pallet is loaded
            }
       }
                
// Asking for pallet information, portti is for the request which is sent as response
{ "id" : "GetPalletInfo",  
    "palletInfo" : "1491566693767",
        "portti" : "4107"
}

// Updating pallet information, almost same message as ordering but with PalletID attached
// updating only necessary fields should work, but not tested
{ "id" : "UpdatePalletInformation", 
    "PalletID" : "1491491639368", 
          "Information" : 
            {
              "frame" : 1,
              "screen" : 2,
              "keyboard" : 3,
              "fcolor" : "green",
              "scolor" : "red",
              "kcolor" : "blue",
              "destination": 3,
              "hasPaper" : 1,
              "rfid" : 0
        }
    }
                
                
```
