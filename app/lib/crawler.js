// Import spooky (run casperjs in node)
const fs = require('fs');
const Spooky = require('spooky');
const EventEmitter = require('events');
const spinner = require('char-spinner');
const urlParse = require('url').parse;
const {debug} = require('../../config');

// Create new emitter
class CrawlerEmitter extends EventEmitter {};

// New emitter instance
const ev = new CrawlerEmitter();

// Configure spooky
const spookyCnf = {
  child: {
    transport: 'http'
  },
  casper: {
    logLevel: 'debug',
    verbose: true
  }
};

/**
 * Mocks spooky cookie function from disk
 * @param  {string}   url      URL to crawl for cookies
 * @param  {Function} callback Done callback [callback(err, cookies)]
 */
const _fetchCookiesDevCache = function(url, callback) {

  // Get cache path
  let cache_path = `cache/${urlParse(url).hostname}.json`;

  // Try and get cookies from disk in string format
  fs.readFile(cache_path, 'utf8', (err, data) => {

    // Mock a slight network delay
    setTimeout(function(){

      // Check cache data was found and pass to callback
      if(data) callback(JSON.parse(data));
      else {
        // Else use spooky to get cookies as normal
        _fetchCookies(url, function(cookies) {

          // Write cookies to cache
          fs.writeFileSync(cache_path, JSON.stringify(cookies));

          // Do callback
          callback(cookies);
        });
      }
    }, 1000);
  });
}

/**
 * Creates a spooky instance and gets cookies from url
 * @param  {string}   url      URL to crawl for cookies
 * @param  {Function} callback Done callback [callback(cookies)]
 */
const _fetchCookies = function(url, callback) {

  // Create spooky instance
  var spooky = new Spooky(spookyCnf, function(err) {

    // Throw new exception with err as details if err isset
    if (err) throw (new Error('Failed to initialize SpookyJS').details = err);

    // Set url
    spooky.start(url);

    // Promise next
    spooky.then(function () {

      // Function to check document.readyState (encaps this)
      const _waitForCookies = () => {

        // Get readyState
        let status = this.evaluate(function () {
          return document.readyState;
        });

        // If readyState is 'complete' then emit the cookie data
        if (status === 'complete')
          this.emit('cookies', this.page.cookies);

        // Else wait 2 secs and try again
        else
          this.wait(3000, _waitForCookies);
      };

      // Start waiting for page load
      _waitForCookies();
    });

    // Run spooky
    spooky.run();

    // Listen for cookies event from the spooky evaluator
    spooky.on('cookies', callback);

    // Send all phantom logs to console if debug true (config.json)
    if (debug) spooky.on('console', console.log);

  });
};

// Main public method for receiving url
/**
 * Exported method for crawling urls
 * @param  {array} url_list Urls to crawl
 * @return {obj}            Instance of EventEmitter
 *                            - cookie (cookies returned)
 *                            - end
 */
module.exports = function(url_list) {

  (function _seriesCookies() {

    // Check collection is still populated
    if(url_list.length) {

      // Start a console spinner
      let spin = spinner();

      // Start popping urls off the url_list
      let url = url_list.shift();

      // Get cookies from new spooky instance or cache, depending on debug setting
      (debug ? _fetchCookiesDevCache : _fetchCookies)(url, function(cookies) {

        // Else emit 'cookies' event
        ev.emit('cookies', url, cookies);

        // Stop console spinner
        clearInterval(spin);

        // Call self again
        _seriesCookies();
      });

    // Send 'end' event when collection is empty
  } else ev.emit('end');

  // Start the function
  })();

  // Return event emitter instance
  return ev;
};
