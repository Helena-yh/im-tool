var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var userRouter = require('./routes/user');
var Config = require('./conf');
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/user', userRouter);

var server = app.listen(Config.SERVER_PORT, function () {
  return console.log('SealRTC Server listening at http://%s:%s in %s mode.', server.address().address, server.address().port, app.get('env'));
});
module.exports = app;