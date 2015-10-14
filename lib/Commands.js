var _ = require('underscore');
var linq = require('linq');

var commands = {
  BRIGHTNESS: {
    page: "00",
    code: "10"
  },



  VOLUME: {
    page: "00",
    code: "62"
  }


};

module.exports.fromKey = function(key){
  key = key.toUpperCase();
  var command = commands[key];

  if(command === undefined)
    return null;

  if(command.page === undefined || command.code === undefined){
    console.log("Command '" + key + "' is missing values")
    return null;
  }

  return command;
};

module.exports.fromCodes = function(page, code){
  if(page === undefined || code === undefined)
    return null;

  return linq.from(commands).firstOrDefault(function(t){ return t.value.page == page && t.value.code == code; });
};