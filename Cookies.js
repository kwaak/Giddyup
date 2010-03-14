var sys = require('sys');

// Returns a cookie value based on its name. Returns false when not found
exports.Get = function(req, searchName)
{
  if(!req.headers || !req.headers.cookie)
  {
    sys.debug("headers not found, or cookies not found");
    return false;
  }
  
  if(req.headers.cookie.indexOf(";") == -1)
    req.headers.cookie += ";";

  var cookies = req.headers.cookie.split(";");
  sys.debug("Cookie dump: (" + req.headers.cookie + " - " + cookies.length + ")");
  for(var i = 0; i < cookies.length; i++)
  {
    var nameValuePair = cookies[i].split("=");
    var name = nameValuePair[0];
    var value = nameValuePair[1];

    sys.debug("- " + name + " = " + value);
    
    if(nameValuePair.length != 2)
      continue;
      
    // Found our cookie
    if(name == searchName)
    {
      sys.debug("Found cookie '" + searchName + "' with value '" + value + "'");
      return value;
    }
  }
  
  sys.debug("Failed to find cookie '" + searchName + "'");
  // Our cookie not found
  return false;
}

// Sets the proper header for setting a new cookie, will overwrite previous Set() calls
exports.Set = function(res, name, value)
{
  sys.debug("Setting cookie '"+name+"' with value '"+value+"'");
  var cookieString = name + "=" + value;
  res.myHeaders['Set-Cookie'] = cookieString;  
}

