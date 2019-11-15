var ref = require('../db'), Group = ref[2];
var Sequelize =  require('sequelize');
var express = require('express');
var router = express.Router();
var Op = Sequelize.Op;

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
var RongGroup = RongSDK.Group;
var MuteMembers = RongGroup.Gag;

//创建
var createGroup = (group) => {
	return new Promise((resolve, reject) => {
		RongGroup.create(group).then(result => {
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
		RongGroup.get(group).then(result => {
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
		RongGroup.join(group).then(result => {
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
var unmuteMembers = (group) => {
	console.log('unmuteMembers',group)
	return new Promise((resolve, reject) => {
		MuteMembers.remove(group).then(result => {
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
					return Group.findOne({
						where: {
							id: id
						}
					}).then((group) => {
						if(group){
							return res.send(ErrorInfo.EXISTED);
						}
						return Group.create({
							id: id,
							muteStatus: 1
						}).then(() => {
							return res.send(new APIResult(200));
						})
					})
				}
			}).catch((error) => {
				console.log('err:',error)
				next();
			})
		}
	})
	
})

//设置禁言状态
router.post('/set_mute_status', (req, res, next) => {
	var id = req.body.id,
		memberIds = req.body.memberIds,
		muteStatus = req.body.muteStatus;
	var members = [];
	memberIds.forEach( (member) => {
		members.push({id: member})
	})

	var group = {
		id: id,
		members: members,
	};
	return getGroup(group).then((result) => {
		if(result.code == 200){
			if(result.members.length == 0){
				return res.send(ErrorInfo.NOT_EXIST);
			}
			if(muteStatus == 0){
				unmuteMembers(group).then((result)=> {
					if(result.code == 200){
						return Group.update({
							muteStatus: muteStatus
						},{
							where: {
								id: id
							}
						}).then(() => {
							return res.send(new APIResult(200));
						})
					}
				}).catch((error) => {
					console.log('err:',error)
					next();
				})
			}else {
				return Group.update({
					muteStatus: muteStatus
				},{
					where: {
						id: id
					}
				}).then(() => {
					return res.send(new APIResult(200));
				})
			}
			
		}
	})
})

//查询群禁言状态
router.post('/get_infos', (req, res, next) => {
	var ids = req.body.ids,
		groupIds = [];
	console.log(typeof groupIds)
	ids.forEach( (id) => {
		groupIds.push({id:id})
	})
	return Group.findAll({
        where: {
			[Op.or]: groupIds
        },
        attributes: ['id', 'muteStatus']
    }).then( (infos) => {
		var arrId = [];
		infos.forEach( (infos) => {
			arrId.push(infos.id)
		})
		ids.forEach( (id) => {
			if(arrId.indexOf(id) == -1){
				infos.push({
					"id": id,
					"muteStatus": 0
				})
			}
		})
		return res.send(new APIResult(200,infos));
	})
})
module.exports = router;