exports.Create = function(data)
{
  return new Data(data);
}

exports.Command
{
  REQUEST_LOGIN   1,
  LOGIN:          2
}

// Data format:
// - first four bytes are the command
// - the next four store the length of the message
function Data(data)
{
  this.command = data[0] + data[1] + data[2] + data[3];
  this.msgLength = data[4] + data[5] + data[6] + data[7];
  this.message = data.substring(8, 8 + this.msgLength);
}