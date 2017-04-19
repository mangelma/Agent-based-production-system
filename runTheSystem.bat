start node loadStoreStation.js
ECHO waiting for simulator to reset...
ping -n 3 127.0.0.1 > nul
start node paperStation.js
start node orderGateway.js
start node robotcell.js