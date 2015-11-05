var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var app = express();

var secret = 's3cret1!@#$%asdf';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', expressJwt({secret: secret}));
app.use(express.static(path.join(__dirname, 'src'), {index: false}));

app.get('/', function (req, res) {
	res.sendFile('src/index.html', {root: __dirname});
});

app.post('/auth', function (req, res) {
  if (!(req.body.username === 'john.doe' && req.body.password === 'foobar')) {
    res.send(401, 'Wrong user or password');
    return;
  }

  var profile = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@doe.com',
    id: 123
  };
  
  var token = jwt.sign(profile, secret, {expiresIn: 30});
  res.json({token: token});
});

app.get('/api/restricted', function (req, res) {
  console.log(req.user);
  console.log('user ' + req.user.email + ' is calling /api/restricted');
  res.json({
    info: 'This is some restricted info from the server!'
  });
});

/*
 * Server
 *
 */
app.set('port', process.env.NG_LION_TS_AUTH || 1221);

var server = app.listen(app.get('port'), function () {
	console.log('ng-lion-ts-auth');
});