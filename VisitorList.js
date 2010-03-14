var sys = require('sys');
var cookies = require('./Cookies');
var visitor = require('./Visitor');
var visitors = [];

// Checks if our cookie is set, if it is it is a known visitor
// Returns false if not found, and the GUID otherwise
exports.Exists = function(req)
{
  var guid = cookies.Get(req, global.COOKIE_NAME);
  sys.debug("Looking for GUID on request " + guid + "..." + (visitors[guid]));
  
  return (visitors[guid]);
}

exports.Get = function(req)
{
  var guid = cookies.Get(req, global.COOKIE_NAME);  
  sys.debug("Returning visitor with GUID " + guid);
  
  return visitors[guid];
}

exports.Add = function(res)
{
  // Create a GUID
  var guid = Math.round(Math.random() * 999999);

  sys.debug("Creating new Visitor with GUID: " + guid);
  
  // Set the cookie on the client
  cookies.Set(res, global.COOKIE_NAME, guid);
  
  // Place it in our list
  var newVisitor = visitor.Create(guid);
  visitors[guid] = newVisitor;
  
  return newVisitor;
}