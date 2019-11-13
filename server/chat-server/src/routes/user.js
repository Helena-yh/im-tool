var express = require('express');
var router = express.Router();

var utils = require('../utils');
var APIResult = utils.APIResult;
var Cache = utils.Cache;

var Enum = require('../enum');
var ErrorInfo = Enum.ErrorInfo;

var moment = require('moment');
var Config = require('../conf');

var RongSDK = require('rongcloud-sdk')({
	appkey: Config.RONGCLOUD_APPKEY,
	secret: Config.RONGCLOUD_SECRET,
	api: Config.RONGCLOUD_SERVER_API || 'http://api.cn.ronghub.com'
});
var User = RongSDK.User;

var getNormalToken = (user) =>  {
  return User.register(user);
};

router.post('/get_token', (req, res, next) => {
	var id = req.body.id;
	var name = 'tester', portrait = 'tester';
	var user = {
		id: id,
		name: name,
		portrait: portrait
	};
	return Promise.resolve().then(() => {
		return getNormalToken(user).then(function (result) {
			var token = result.token;
			if(result.token) {
				return res.send(new APIResult(200, { token: token }));
			}
			return res.send(new APIResult(400, result));
		}).catch(function(err) {
			return res.send(new APIResult(400, { err: err }));
		});
	}).catch(next);
	
});

module.exports = router;