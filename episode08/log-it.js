var util = require('util');

module.exports = function () {

    var counter = 0;

    return function (req, res, next) {
        var writeHead = res.writeHead; // Store the original function
        
        counter++;
        
        res.writeHead = function (code, headers) {
            res.writeHead = writeHead; // Put the original back 
            console.log("Response #" + counter + ": " + code + ' ' + util.inspect(headers));
        };
    
        // Pass through to the next layer
        next();
    };
};
