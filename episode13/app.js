var express = require('express'),
    form = require('connect-form'),
    fs = require('fs'),
    util = require('util');

var app = express.createServer(
  form({keepExtensions: true})
);

var MemStore = express.session.MemoryStore;

app.configure(function () {
    app.use(express.logger());
    // renamed bodyDecoder to podyParser from express v2.3.2
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    // staticProvider has gone. we can use static instead of it now.
    app.use(express.static(__dirname + '/static'));

    app.use(express.cookieParser());
    app.use(express.session({secret: 'alessios', store: MemStore({
        reapInterval: 60000 * 10
    })}));
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

function requiresLogin(req, res, next) {
  if(req.session.user) {
    next();
  } else {
    res.redirect('/sessions/new?redir=' + req.url);
  }
}

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: true});

app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  },
  flash: function(req, res){
    return req.flash();
  }
});

app.get('/', function (req, res) {
    res.render('root');
});

app.get('/sessions/new', function(req, res) {
  res.render('sessions/new', {locals: {
    redir: req.query.redir
  }});
});

app.get('/sessions/destroy', function(req, res) {
  delete req.session.user;
  res.redirect('/sessions/new');
});

var users = require('./users');

app.post('/sessions', function(req, res) {
  //console.log('User: ' + req.body.login + '; Pwd: ' + req.body.password);
  users.authenticate(req.body.login, req.body.password, function(user){
    if(user) {
      req.session.user = user;
      res.redirect(req.body.redir || '/');
    } else {
      req.flash('warn', 'Login failed');
      res.render('sessions/new', {locals: {
        redir: req.query.redir
      }});
    }
  });
});

var products = require('./products');
var photos = require('./photos');

app.get('/products', function (req, res) {
    res.render('products/index', {locals: {
        products: products.all
    }});
});

app.get('/products/new', requiresLogin, function(req, res) {
    res.render('products/new', {locals: {
        product: req.body && req.body.product || products.new()
    }});
});

app.post('/products', requiresLogin, function(req, res) {
    var id = products.insert(req.body.product);
    res.redirect('/products/' + id);
});

app.get('/products/:id', function(req, res) {
  var product = products.find(req.params.id);
  if(product !== null) {
    console.log(product);
    res.render('products/show', {locals: {
      product: product
    }});
  } else {
    res.send('404 - Product not found!');
  }
});

app.get('/products/:id/edit', requiresLogin, function (req, res) {
    var product = products.find(req.params.id);

    if(product !== null) {
        photos.list(function(err, photo_list) {
            if(err) {
                throw err;      
            } else {
                res.render('products/edit', {locals: {
                    product: product,
                    photos: photo_list
                }});            
            }
        });
    } 
    else {
        res.send('404 - Product not found!');
    }
});

app.put('/products/:id', requiresLogin, function(req, res) {
    var id = req.params.id;
    // req.body.product comes from bodyParser
    console.log(req.body);
    console.log(req.body.product);
    products.set(id, req.body.product);
    res.redirect('/products/' + id);
});

/* Photos */
app.get('/photos', function(req, res) {
    photos.list(function(err,photo_list) {
        res.render('photos/index', {locals : {
            photos: photo_list
        }});
    });
});

app.get('/photos/new', function(req, res) {
    res.render('photos/new');
});

app.post('/photos', function(req, res) {
    console.log(req.files);

    var ins = fs.createReadStream(req.files.photo.path);
    var ous = fs.createWriteStream(__dirname + '/static/uploads/photos/' + req.files.photo.filename);
    
    util.pump(ins, ous, function(err) {
        if(err) {
            console.log(err);
        }
        else {
            res.redirect('/photos');
        }
    });
});

/* 404 redirect here */
app.get('*', function(req, res) {
    res.send('404 - no such page');
});

app.listen(4000);

console.log('Server listening on port 4000');

