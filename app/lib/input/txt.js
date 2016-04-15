
// Get modules
const fs = require('fs');
const readline = require('readline');
const {mUrl} = require('../util');
const urlParse = require('url').parse;

/**
 * Handles a plain text input file of urls
 * @param  {string} file Name of input file
 * @return {promise}     Promise object resolves with array of urls
 */
module.exports = function(file) {

  // Create a promise
  let p = new Promise(
    function (resolve) {

      // Array of urls
      let url_list = [];

      // Create readline
      readline.createInterface({
        // From input file
        input: fs.createReadStream(file)
      })

      // Push each line (site url) to url_list
      .on('line', function(line) {
        let url = mUrl(line);
        let hostname = urlParse(url).hostname;
        let path = urlParse(url).path;

        console.log(` ${hostname+path}`);
        url_list.push(url);
      })

      // Resolve promise with array of urls
      .on('close', function() {
        resolve(url_list);
      });

    });

  // Return the promise
  return p;
}
