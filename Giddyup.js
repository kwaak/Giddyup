// System
var sys = require('sys');
var http = require('http');
var tcp = require('tcp');
var fs = require("fs");
var io = require('../Socket.IO-node.git/socket.io.js'
    
// Giddyup
var visitorList = require('./VisitorList');
var tools = require('./Tools');

// Constants
global.COOKIE_NAME = "Giddyup_GUID";

// HTTP Server
var httpServer = http.createServer(function (req, res) {
  res.myHeaders = {
    'Content-Type': 'text/html'
  };
  
  var url = require("url").parse(req.url, true);
  if(url.pathname.toLowerCase() == "/kill")
  {
    sys.log("Shutting down server");
    
    this.close();
    tcpServer.close();
    
    process.exit();
  }
  res.write(req.url);
  res.write(url.pathname);
  
  var visitor;
  var isNew = true;
  if(visitorList.Exists(req))
  {
    visitor = visitorList.Get(req);
    isNew = false;
  }
  else
    visitor = visitorList.Add(res);

  res.writeHead(200, res.myHeaders);
  if(isNew)
  {
    res.write("you are new!");
    res.close();
  }
  else 
  {
    visitor.visits++;
    
    res.write("Welcome back! You've visited this page " + visitor.visits + " times.");
    
    fs.readFile("./giddyup.njs", function(err, data) {
      res.write(data);
      res.close();
    });
  }
});

// what the request headers should match
var requestHeaders = [
  /^GET (\/[^\s]*) HTTP\/1\.1$/,
  /^Upgrade: WebSocket$/,
  /^Connection: Upgrade$/,
  /^Host: (.+)$/,
  /^Origin: (.+)$/
];
// what the response headers should be
var responseHeaders = [
  'HTTP/1.1 101 Web Socket Protocol Handshake', 
  'Upgrade: WebSocket', 
  'Connection: Upgrade',
  'WebSocket-Origin: {origin}',
  'WebSocket-Location: {protocol}://{host}{resource}',
  '',
  ''
];

// Start the servers
httpServer.listen(80);
sys.log('HTTP Server running at port 80');

// Start the socket server (websockets)
io.listen(httpServer);