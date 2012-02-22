var http = require('http');
var fs = require('fs');
var util = require('util');
var step = require('step');

var file_path = __dirname + '/cat.jpg';
var file_size, file_content;

step(
    function get_file_size() {
        fs.stat(file_path, this);
    },
    function store_file_size(err, stat) {
        file_size = stat.size;
        this();
    },
    function read_file_into_memory() {
        fs.readFile(file_path, this);
    },
    function create_server(err, file_content) {

        http.createServer(function (request, response) {
            
            response.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Lenth': file_size
            });
    
            response.end(file_content);
    
        }).listen(4000);

    }
);



