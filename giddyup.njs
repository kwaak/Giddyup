<hr>
<script>
var ws;
function conn() {
  if ("WebSocket" in window) {
    ws = new WebSocket("ws://192.168.1.103:8080");
    ws.onopen = function() {
      alert("We're connected!");
    };
    ws.onmessage = function (evt) { 
      var received_msg = evt.data; 
      alert("Received: " + received_msg); 
      alert(stringToBytes(received_msg));
    };
    ws.onclose = function() { 
      //alert("We're closed!");
    };
  } 
  else 
  {
    alert('Your browser does not support websockets');
  }
}
function echo() {
  var msg = prompt("Enter your echo message: ");
  ws.send(msg);
}

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
</script>
<input type="button" value="Connect" onclick="conn();">
<input type="button" value="Echo" onclick="echo();">
<hr>
<a href="/Kill">Kill</a>