// Modules
const fs = require('fs');
const moment = require('moment');
const {steplog} = require('./lib/util');
const crawler = require('./lib/crawler');
const output = require('./lib/output');

// Get required config vars
const {input_file, output_file} = require('../config.json');

// Starting
console.log('--- Starting cookie crawler ---');

// Get sites list
steplog('Getting list of sites from text file\n');

// Check input file type is supported TODO: Add support for more types
let input_parser;
try { input_parser = require(`./lib/input/${input_file.type}`); }

// Else exit with nice error
catch (e) {
  console.error(`\n EXITING - Input file of type '${input_file.type}' not supported.`);
  process.exit();
}

// Pass input file name to input parser and handle resolve from promise
input_parser(input_file.name)
  .then(function(url_list) {

    // Keep node running - done so we can keep listening for cookie data
    process.stdin.resume();

    // Remove old cookie file (if exists)
    try { fs.unlinkSync(output_file); } catch (e) {}

    // Create new csv writer instance
    const csv = output.create(output_file);

    // Steps
    steplog('Successfully parsed input file');

    steplog('Passing urls to crawler');
    console.log('Please be patient. This may take a while...\n');

    // Iterate urls and pass to crawler
    crawler(url_list)

    // Cookies sent
    .on('cookies', function(url, cookies){

      // Log number of cookies found
      console.log(` ${cookies.length} cookies found for: ${url}`);

      // Write cookies to file
      if (cookies.length) {
        for (let cookie of cookies) {

          // Get expiry as time from now
          let expiry = cookie.expiry ? moment.unix(cookie.expiry).fromNow(true) : '';

          csv.write({
            'Site': url,
            'Name': cookie.name,
            'Value': cookie.value,
            'Expires': expiry
          })
        }
      }
    })

    // All cookies received
    .on('end', function(){
      console.log('\n--- Crawler Complete ---');
      process.stdin.pause();
    });

  });
