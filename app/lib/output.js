
// Modules
const fs = require('fs');
const csvWriter = require('csv-write-stream');

// CSV options
const csvOpts = {
  separator: ',',
  newline: '\n',
  headers: undefined,
  sendHeaders: true
};

// Public method for creating csv
module.exports.create = function(csv, row) {
  // New writer
  const writer = csvWriter();
  writer.pipe(fs.createWriteStream(csv));
  return writer;
}
