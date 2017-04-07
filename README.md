# Agent-based control of a production system
NodeJS based assignment work for the TUT course Distributed Automation Systems

```javascript
// Ordering:
{ "id" : "PlaceOrder",
                    "Information" :
                        {
                            "frame" : "testitilaus",
                            "screen" : "selaimesta",
                            "keyboard" : indeksi,
                            "fcolor" : indeksi,
                            "scolor" : indeksi,
                            "kcolor" : indeksi,
                            "destination": indeksi,
                            "hasPaper" : indeksi,
                            "rfid" : 0
                        }
                }
                
// Asking for pallet information:
{ "id" : "GetPalletInfo",  
    "palletInfo" : "1491566693767",
        "portti" : "4107"
}

// Updating pallet information
{"id" : "UpdatePalletInformation", 
  "PalletID" : "1491491639368", 
  "Information" : {
            "frame" : 1,
            "screen" : 2,
            "keyboard" : 3,
            "fcolor" : 3,
            "scolor" : 3,
            "kcolor" : 3,
            "destination": 3,
            "hasPaper" : 1
        }}
                
                
```
