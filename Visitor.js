exports.create = function(guid) 
{
  return new Visitor(guid);
}

function Visitor(guid)
{
  this.guid = guid;
  this.visits = 0;
}