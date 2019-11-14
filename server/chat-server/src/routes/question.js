var ref = require('../db'), Question = ref[1];
var express = require('express');
var router = express.Router();

var utils = require('../utils');
var APIResult = utils.APIResult;
var ENUM = require('../enum');
var ErrorInfo = ENUM.QuestionError; 


router.post('/add', (req, res, next) => {
    var description = req.body.description,
        groupId = req.body.groupId,
        solution = req.body.solution,
        status = req.body.status;
    return Question.create({
        description: description,
        groupId: groupId,
        solution: solution,
        status: status 
    }).then(() => {
        return res.send(new APIResult(200));
    }).catch(() => {
        next();
    })
})

router.post('/delete', (req, res, next) => {
    var questionId = req.body.id;
    
    return Question.findOne({
        where: {
            id: questionId
        },
        attributes: ['id', 'description', 'solution', 'status']
    }).then((result) => {
        if(!result){
            return res.send(ErrorInfo.NOT_EXIST);
        }
        return Question.destroy({
            where: {
                id: questionId
            }
        }).then(() => {
            return res.send(new APIResult(200));
        }).catch(() => {
            next();
        })
    }).catch(() => {
        next();
    })
})

router.post('/search_all', (req, res, next) => {
    var groupId = req.body.groupId;
    return Question.findAll({
        where: {
            groupId: groupId 
        },
        attributes: ['id','groupId', 'description', 'solution', 'status']
    }).then((result) => {
        console.log('---',result)
        return res.send(new APIResult(200, result));
    }).catch(() => {
        next();
    })
})

router.post('/modify', (req, res, next) => {
    var questionId = req.body.id,
    description = req.body.description,
    solution = req.body.solution,
    status = req.body.status;
    return Question.findOne({
        where: {
            id: questionId
        },
        attributes: ['id', 'description', 'solution', 'status']
    }).then((result) => {
        if(!result){
            return res.send(ErrorInfo.NOT_EXIST);
        }
        return Question.update({
            description: description == undefined ? result.description : description,
            solution: solution == undefined ? result.solution : solution,
            status: status == undefined ? result.status : status
        },{
            where: {
                id: questionId
            }
        }).then(() => {
            return res.send(new APIResult(200));
        })
    }).catch(() => {
        next();
    })
})

module.exports = router;

