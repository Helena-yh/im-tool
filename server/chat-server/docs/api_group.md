### 群组相关接口

| 接口地址 | 说明 |
|---------|-----|
| [/group/create](#post-groupcreate) | 创建群组 |
| [/group/join](#post-groupjoin) | 加入群组 |
| [/group/set_infos](#post-groupset_infos) | 设置群信息 |
| [/group/get_infos](#post-groupget_infos) | 获取群信息 |


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

群组不存在创建群组，群组存在加入群组

#### 请求参数


|参数|说明|数据类型|是否必填|
|---|----|------|------|
|groupId|群 id |String| 是|
|memberIds|群成员 ids |Array| 是|
|clientIds|客户 ids |Array| 否|
|groupName|群名称 |String| 否|

```js
{
	"groupId":"testjoin",
    "memberIds": ["1001","1002"],
    "clientIds": ["1001","1002"],
    "groupName": "群组"
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
```

### 设置群信息

### POST /group/set_infos

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|groupId|群 id |String| 是|
|muteStatus|禁言状态|Number| 否|
|clientIds|客户 ids |Array| 否|
|groupName|群名称 |String| 否|

修改哪个传哪个，不传为不修改

```js
{
	"ids": ["test1","1233"]
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
```

### 获取群信息

### POST /group/get_infos

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|groupIds|群 id |Array| 是|


```js
{
	"ids": ["test1","1233"]
}
```

#### 返回结果

```js
{
   {
    "code": 200,
    "result": [
        {
            "id": "newjoin",
            "muteStatus": 0,
            "groupName": "群名字",
            "clientIds": [
                "1003",
                "1002"
            ]
        },
        {
            "id": "test1",
            "muteStatus": 0,
            "groupName": "群名字",
            "clientIds": [
                "1001",
                "1003"
            ]
        }
    ]
}
}
```

#### 状态码说明

```js
200:   成功
```