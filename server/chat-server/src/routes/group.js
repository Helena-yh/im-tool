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
var Group = RongSDK.Group;

//创建
var createGroup = (group) => {
	return new Promise((resolve, reject) => {
		Group.create(group).then(result => {
			console.log(result);
			resolve(result)
		}, error => {
			console.log(error);
			reject(JSON.stringify(error))
		});
	})
}
router.post('/create', (req, res, next) =>{
	var id = req.body.id,
		name = req.body.name,
		memberIds = req.body.memberIds,
		members = [];
		console.log(memberIds,typeof memberIds)
		memberIds.forEach(id => {
			members.push({
				id: id.toString()
			})
		})
	var group = {
		id: id,
		name: name,
		members: members
	};
	createGroup(group).then((result) => {
		if(result.code == 200){
			return res.send(new APIResult(200));
		}
	}).catch((error) => {
		return res.send(new APIResult(400, error));
	})
	
})

//加入
router.post('/join', (req, res, next) => {
	var id = req.body.id,
		name = req.body.name,
		memberId = req.body.memberId;
	var group = {
		id: id,
		name: name,
		memberId: memberId
	}
	return Group.join(group).then((result) => {
		if(result.code == 200){
			return res.send(new APIResult(200));
		}
	}).catch((error) => {
		next(error)
	})
})

//禁言
router.post('/mute', (req, res, next) => {
	var id = req.body.id,
		name = req.body.name,
		memberIds = req.body.memberIds,
		members = [];
		memberIds.forEach(id => {
			members.push({
				id: id.toString()
			})
		})
	var group = {
		id: id,
		name: name,
		members: members
	};
	return Group.join(group).then((result) => {
		return res.send(new APIResult(200, result));
	}).catch((error) => {
		next(error)
	})
})
module.exports = router;