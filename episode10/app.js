var express = require('express');

var app = express.createServer();

app.configure(function () {
    app.use(express.logger());
    // staticProvider has gone. we can use static instead of it now.
    app.use(express.static(__dirname + '/static'));
});

app.configure('development', function () {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function () {
    app.use(express.errorHandler({}));
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: true});

app.get('/', function (req, res) {
    res.render('root');
});

var products = require('./products');

app.get('/products', function (req, res) {
    res.render('products/index', {locals: {
        products: products.all
    }});
});

app.listen(4000);
