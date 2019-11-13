var express = require('express');
var router = express.Router();

var utils = require('../utils');
var APIResult = utils.APIResult;
var Cache = utils.Cache;

var Enum = require('../enum');
var ErrorInfo = Enum.GroupError;
var moment = require('moment');
var Config = require('../conf');

var RongSDK = require('rongcloud-sdk')({
	appkey: Config.RONGCLOUD_APPKEY,
	secret: Config.RONGCLOUD_SECRET,
	api: Config.RONGCLOUD_SERVER_API || 'http://api.cn.ronghub.com'
});
var Group = RongSDK.Group;
var MuteMembers = Group.Gag;

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
var getGroup = (group) => {
	return new Promise((resolve, reject) => {
		Group.get(group).then(result => {
			console.log(result);
			resolve(result)
		}, error => {
			console.log(error);
			reject(JSON.stringify(error))
		});
	})
}
var joinGroup = (group) => {
	return new Promise((resolve, reject) => {
		Group.get(group).then(result => {
			console.log(result);
			resolve(result)
		}, error => {
			console.log(error);
			reject(JSON.stringify(error))
		});
	})
}
var muteMembers = (group) => {
	return new Promise((resolve, reject) => {
		MuteMembers.add(group).then(result => {
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
		memberId = req.body.memberId;
	var group = {
		id: id,
		member: {
			id: memberId
		}
	}
	console.log(group)
	return getGroup(group).then((result) => {
		if(result.code == 200){
			if(result.members.length == 0){
				return res.send(ErrorInfo.NOT_EXIST);
			}
			return joinGroup(group).then((result) => {
				if(result.code == 200){
					return res.send(new APIResult(200));
				}
			}).catch((error) => {
				console.log('err:',error)
				next();
			})
		}
	})
})

//禁言
router.post('/mute', (req, res, next) => {
	var id = req.body.id,
		minute = req.body.minute,
		memberIds = req.body.memberIds,
		members = [];
	memberIds.forEach( (member) => {
		members.push({id: member})
	})
	var group = {
		id: id,
		members: members,
		minute: minute
	};
	if(minute < 1 || minute > 30 * 24 * 60){
		return res.send(ErrorInfo.MIUTE_ILLEGAL);
	}
	return getGroup(group).then((result) => {
		if(result.code == 200){
			if(result.members.length == 0){
				return res.send(ErrorInfo.NOT_EXIST);
			}
			muteMembers(group).then((result)=> {
				if(result.code == 200){
					return res.send(new APIResult(200));
				}
			}).catch((error) => {
				console.log('err:',error)
				next();
			})
		}
	})
	
})
module.exports = router;