
// Some ES2015 - Babeljs
require("babel-polyfill");
require('babel-register')({
   presets: [ 'es2015' ]
});

// Main crawler app
require('./app');
