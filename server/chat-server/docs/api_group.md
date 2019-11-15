### 群组相关接口

| 接口地址 | 说明 |
|---------|-----|
| [/group/create](#post-groupcreate) | 创建群组 |
| [/group/join](#post-groupjoin) | 加入群组 |
| [/group/mute](#post-groupmute) | 禁言群成员 |
| [/group/set_mute_status](#post-groupmuteset_mute_status) | 设置禁言状态 |
| [/group/get_infos](#post-getinfos) | 查询群信息 |


## API 说明

### 创建群组

### POST /group/create

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|id|群 id|String| 是|
|name|群名称 |String| 是|
|memberIds|成员 Id |Array| 是|

```js
{
    "id": "1234",
    "name": "一个群名字",
    "memberIds": ["user1","user2"]
}
```

#### 返回结果

```js
{
    "code":200
}
```

### 加入群组

### POST /group/join

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|id|群 id|String| 是|
|memberId|成员 Id |String| 是|

```js
{
    "id": "1234",
    "memberId": "user1"
}
```

#### 返回结果

```js
{
    "code":200 
}
```

#### 状态码说明

```js
200: 成功
50100: 群组未创建或不存在
```

### 禁言群成员

### POST /group/mute

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|id|群 id|String| 是|
|memberIds|成员 Id |Array| 是|
|minute|禁言时长 1 - 1 * 30 * 24 * 60 （单位： 分钟） |Number| 是|

```js
{
	"id": "test11",
	"memberIds": ["1001","1002"],
	"minute": 2
}
```

#### 返回结果

```js
{
    "code":200 
}
```

#### 状态码说明

```js
200:   成功
50100: 融云群组未创建或不存在
50101: 禁言时长范围错误
50102: 已设置群禁言
```

### 设置群禁言状态

### POST /group/set_mute_status

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|id|群 id|String| 是|
|memberIds|成员 Id |Array| 是|
|muteStatus| 0 关闭、1 开启 |Number| 是|

```js
{
	"id": "test11",
	"memberIds": ["1001","1002"],
	"minute": 2
}
```

#### 返回结果

```js
{
    "code":200 
}
```

#### 状态码说明

```js
200:   成功
50100: 群组未创建或不存在
```


### 查询群信息

### POST /group/get_infos

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|ids|群 id |Array| 是|

```js
{
	"ids": ["test1","1233"]
}
```

#### 返回结果

```js
{
    "code":200,
    "result": [
        {
            "id": "1233",
            "muteStatus": 0
        },
        {
            "id": "test1",
            "muteStatus": 0
        }
    ]
}
```

#### 状态码说明

```js
200:   成功
```