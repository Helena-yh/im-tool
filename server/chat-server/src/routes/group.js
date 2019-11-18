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

// 加入
router.post('/join', (req, res, next) => {
	var groupId = req.body.groupId,
		memberIds = req.body.memberIds,
		groupName = req.body.groupName,
		clientIds = req.body.clientIds,
		members = [];
	memberIds.forEach( (id) => {
		members.push({
			id: id.toString()
		})
	})
	var group = {
		id: groupId,
		name: groupName || 'default',
		members: members
	};
	return Group.findOne({
		where: {
			id: groupId
		}
	}).then((result) => {
		if(!result){
			//没有群组创建
			console.log('c g',group)
			return createGroup(group).then((result) => {
				if(result.code == 200){
					return Group.create({
						id: groupId,
						groupName: groupName || '',
						clientIds: JSON.stringify(clientIds) || '',
					}).then(() => {
						return res.send(new APIResult(200));
					})
				}
			}).catch((err) => {
				console.log('create g err',err)
			})
		}else {
			//有群组加入
			group = {
				id: groupId,
				member: {
					id: memberIds[0]
				}
			}
			console.log('group',group)
			return joinGroup(group).then((result) => {
				console.log('jg',result)
				if(result.code == 200){
					return res.send(new APIResult(200));
				}
			}).catch((error) => {
				console.log('join g err',error)
			})
		}

	}).catch((err) => {
		console.log('g find err',err)
		next();
	})
})

// 设置群信息
router.post('/set_infos', (req, res, next) => {
	var groupId = req.body.groupId,
		minute = req.body.minute,
		groupName = req.body.groupName,
		muteStatus = req.body.muteStatus,
		clientIds = req.body.clientIds;
	var members = [];
	if(clientIds) {
		clientIds.forEach( (id) => {
			members.push({id: id})
		})
	}
	var group = {
		id: groupId,
		members: members,
		minute: minute || 30*24*60

	};
	return Group.findOne({
		where: {
			id: groupId
		},
		attributes: ['muteStatus', 'clientIds', 'groupName']
	}).then( (result) => {
		if(!result) {
			return res.send(ErrorInfo.NOT_EXIST);
		}
		return Group.update({
			muteStatus: muteStatus == undefined ? result.muteStatus:muteStatus,
			groupName: groupName == undefined ? result.groupName:groupName,
			clientIds: clientIds == undefined ? result.clientIds:JSON.stringify(clientIds),
		},{
			where: {
				id: groupId
			}
		}).then(() => {
			console.log('muteStatus', muteStatus)
			if(muteStatus != undefined) {
				if(muteStatus == 1){ //禁言 rc
					return muteMembers(group).then((result)=> {
						if(result.code == 200){
							return res.send(new APIResult(200));
						}
					}).catch((error) => {
						console.log('mute m err:',error)
						next();
					})
				}else {//取消禁言 rc
					console.log('取消禁言')
					return unmuteMembers(group).then((result)=> {
						if(result.code == 200){
							return res.send(new APIResult(200));
						}
					}).catch((error) => {
						console.log('unmute m err:',error)
						next();
					})
				}
			}
			return res.send(new APIResult(200));
		})
	})
})

// 查询群禁言状态
router.post('/get_infos', (req, res, next) => {
	var groupIds = req.body.groupIds,
		ids = [];
	groupIds.forEach( (id) => {
		ids.push({id:id})
	})
	return Group.findAll({
        where: {
			[Op.or]: ids
        },
        attributes: ['id', 'muteStatus', 'groupName', 'clientIds']
    }).then( (infos) => {
		infos.forEach( item => {
			if(item.clientIds){
				item.clientIds = JSON.parse(item.clientIds)
			}
			if(!item.clientIds){
				item.clientIds = [];
			}
		})
		return res.send(new APIResult(200,infos));
	})
})
module.exports = router;