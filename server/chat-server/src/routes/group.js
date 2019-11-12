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