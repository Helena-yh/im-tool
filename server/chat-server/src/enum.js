var ErrorInfo = {
  SUCCESS: {
    code: 200
  },
  ERROR: {
    code: 400
  },
  PARAMS_ILLEGAL: {
    code: 4000,
    msg: '参数非法'
  },
  EXCEEDED: {
    code: 4001,
    msg: '调用频率过快'
  }
}

var QuestionError = {
  NOT_EXIST: {
    code: 50000,
    msg: 'Question id not exist'
  }
}

var GroupError = {
  NOT_EXIST: {
    code: 50100,
    msg: 'Group not exist'
  },
  MIUTE_ILLEGAL: {
    code: 50100,
    msg: 'Illegal parameter minute'
  }
}

module.exports = {
  ErrorInfo,
  QuestionError,
  GroupError
};