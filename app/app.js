const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');

// Connect to Database
// const mongoUrl = `mongodb://${ process.env.MONGO_INITDB_ROOT_USERNAME }:${ process.env.MONGO_INITDB_ROOT_PASSWORD }@${process.env.DB_URL}`;
const mongoUrl = `mongodb://mongo:27017/madams`;
mongoose.set('useFindAndModify', false);
mongoose
  .connect(
    mongoUrl,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected....'))
  .catch(err => console.log(err));
mongoose.Promise = global.Promise;

// Ignite the App
const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app/public')));

// Allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header(
      'Access-Control-Allowed-Methods',
      'GET, POST, PATCH, PUT, DELETE'
    );
    return res.status(200).json({});
  }
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/projects', require('./routes/projects'));

module.exports = app;
