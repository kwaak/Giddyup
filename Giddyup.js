// System
var sys = require('sys');
var http = require('http');
var tcp = require('tcp');
var fs = require("fs");

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

// TCP (Websockets) Server
var tcpServer = tcp.createServer(function(socket) {
  socket.setEncoding("utf8");
  socket.setNoDelay(true);
  
  this.handshaked = false;
  this.data = "";
  
  socket.addListener("connect", function () {
    sys.debug("New TCP connection");
  });
  socket.addListener("data", function (data) {

    // Perform a proper handshake
    if(!this.handshaked)
    {
      sys.debug("Performing handshake");
      
      var headers = data.split('\r\n');
      var matches = [];

      // Check for suitable headers
      for(var i = 0, l = headers.length, match; i < l; i++)
      {
        if (i === requestHeaders.length) break; // handle empty lines that UA send 
        match = headers[i].match(requestHeaders[i]);
        if (match && match.length > 1)
        {
          // if there's a capture group, push it into the matches          
          matches.push(match[1]);
        } 
        else if (!match) 
        {
          sys.debug('Handshake aborted. Bad header ' + headers[i]);          
          this.socket.close()
          return false;
        }
      }
      
      // Write a proper succesfull handshake response
      this.write(tools.substitute(responseHeaders.join('\r\n'), {
        resource: matches[0],
        host: matches[1],
        origin: matches[2],
        protocol: 'ws'
      }));
      
      this.handshaked = true;
      sys.debug('Handshake sent', 'info');
      return true;
    }
    else
    {
      sys.debug("Receiving data: ");
      
      // Handle the data
      this.data += data;
      var self = this;
      
      // Split the data out of the chunks
      chunks = data.split('\ufffd');
      sys.debug(sys.inspect(chunks));
      chunks.pop();
      chunks.forEach(function (chunk) {
        sys.debug(chunk[1]);
        if (chunk[0] != '\u0000') {
          sys.debug("Invalid chunk received");
          self.close();
          return false;
        }

        self.write('\u0000' + chunk.substr(1, chunk.length) + '\uffff');
      });
        
      return true;
    }
  });
  socket.addListener("end", function () {
    sys.debug("TCP connection closed");
    this.close();
  });
});


function stringToBytes ( str ) {
  var ch, st, re = [];
  for (var i = 0; i < str.length; i++ ) {
    ch = str.charCodeAt(i);  // get char 
    st = [];                 // set up "stack"
    do {
      st.push( ch & 0xFF );  // push byte to stack
      ch = ch >> 8;          // shift value down by 1 byte
    }  
    while ( ch );
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat( st.reverse() );
  }
  // return an array of bytes
  return re;
}

// Start the servers
httpServer.listen(80);
sys.log('HTTP Server running at port 80');

tcpServer.listen(8080);
sys.log("TCP Server running at port 8080");