var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);



let harry = {
  name: "Harry Potter",
  house: "Gryffindor"
}
let remus = {
  name: "Remus Lupin",
  house: "Gryffindor"
}
let salazar = {
  name : "Salazar Slytherin",
  house: "Slytherin"
}

let wizards = [ harry, remus, salazar]


app.get('/', (req, res, next) => {
  res.render(    'wizardProfile'   ,    {  wizards: wizards  }     );
});


// *****************************************************************************
// db Operations
// *****************************************************************************
const { MongoClient } = require('mongodb');

const url = 'mongodb://mongo:27017/';
//const url = 'mongodb://myuser:mypassword@mongo:27017/'; 
//  GET THE HOSTNAME, username & password & the DB name from environment vars. 
// Example: console.log(process.env.NODE_ENV);

const dbName = 'magicWorld';
const client = new MongoClient(url);

app.get('/db', async function(req, res, next) {
  try {
    
    const wizardsCopy = JSON.parse(JSON.stringify(wizards));
    // Try removing this! Can you answer why a deep copy is required here? 
    // What happens if same wizards array is used?

    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('wizards');
    
    const insertResult = await collection.insertMany(wizardsCopy);
  
    console.log('Inserted documents =>', insertResult);

    const findResult = await collection.find({}).toArray();
    res.send(findResult);

  } catch (error) {
    console.log(error);
    next(error)
  } finally {
    client.close()
  }
  
});

// *****************************************************************************
// *****************************************************************************

// catch 404 and forward to error handler
app.use(function(req, res, next) {
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
