// Dependencies
const express = require('express'),
	methodOverride = require('method-override'),
	bodyParser = require('body-parser');

// Create App
const app = express();


// Middleware for REST API 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
 
// CORS Support
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Use Public folder to host static files
app.use(express.static('public'));
app.disable('x-powered-by');

 
// Load the routes
app.routes = require('./routes/index');

app.use('/stock', app.routes.stock);

// Error Handle 404 and 500
app.use((req,res,next) => {
	res.status(404).send('404 Error: Route Does NOT exist!');
});
app.use((err,req,res,next) => {
	console.log(err);
	res.status(500).send('500 Error');
});

// Listen on Port 3000
app.listen(3000);


 
module.exports = app;
