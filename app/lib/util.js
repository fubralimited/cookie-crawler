
// Modules
const colors = require('colors');

// Simple step generator
var _stepGen = function *() {
  var i = 1;
  while(i) yield i++;
}();

// Public function for loggin next step
module.exports.steplog = function(msg) {
  console.log(`\n\r${_stepGen.next().value}. ${msg}`.underline.green);
};

/**
 * Attempts to clean a dtring and format into a proper url
 * @param  {string} url URL to format
 * @return {string}     New formatted url
 */
module.exports.mUrl = function(url) {

  // Trim
  url = url.trim();

  // Add protocol
  if (!/^(f|ht)tps?:\/\//i.test(url)) url = "http://" + url;

  return url;
};
