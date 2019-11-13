var ref = require('../db'), Question = ref[1];
var express = require('express');
var router = express.Router();

var utils = require('../utils');
var APIResult = utils.APIResult;
var ENUM = require('../enum');
var ErrorInfo = ENUM.QuestionError; 


router.post('/add', (req, res, next) => {
    var description = req.body.description,
        solution = req.body.solution,
        status = req.body.status;
    return Question.create({
        description: description,
        solution: solution,
        status: status 
    }).then(() => {
        return res.send(new APIResult(200));
    }).catch(() => {
        next();
    })
})

router.post('/delete', (req, res, next) => {
    var questionId = req.body.questionId;
    
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

router.get('/search_all', (req, res, next) => {
    var questionId = req.body.questionId;
    return Question.findAll({
        attributes: ['id', 'description', 'solution', 'status']
    }).then((result) => {
        return res.send(new APIResult(200, result));
    }).catch(() => {
        next();
    })
})

router.post('/modify', (req, res, next) => {
    var questionId = req.body.questionId,
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

