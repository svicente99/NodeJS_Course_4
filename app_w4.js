const mongoose = require("mongoose");
const config = require("./config");

const url = config.mongoURL;
const connect = mongoose.connect(url);

connect.then((db) => {
    console.log("------> Connected correctly to server <------");
}, (err) => { console.log(err); });

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/userRouter');
var dishRouter = require('./routes/dishRouter');
var leadRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');
var uploadRouter = require('./routes/uploadRouter');

var session = require('express-session');
var FileStore = require('session-file-store')(session);

var passport = require('passport');
var authenticate = require('./authenticate');

var app = express();

app.use(session({
	name: 'session-id',
	secret: '12345-67890-09876-54321',
	saveUninitialized: false,
	resave: false,
    store: new FileStore()
}));

app.use(passport.initialize());
app.use(passport.session());

//  WEEK 4 - HTTPS and Secure Communication:
app.all('*', (req,res,next) => {
    if (req.secure) {
        return next();
    } 
    else {
        res.redirect(307, 'https://'+ req.hostname + ':' + app.get('secPort') + req.url);
    }
 });

app.use('/', indexRouter);
app.use('/users', userRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leadRouter);
app.use('/imageUpload',uploadRouter);

app.use(cookieParser('12345-67890-09876-54321'));
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("Page not found");
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
