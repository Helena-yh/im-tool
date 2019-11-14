### 问题相关接口

| 接口地址 | 说明 |
|---------|-----|
| [/question/add](#post-questionadd)       | 添加问题 |
| [/question/modify](#post-questionmodify) | 修改问题 |
| [/question/delete](#post-questiondelete) | 删除问题 |
| [/question/search](#post-questionsearch_all) | 查询问题列表 |

## API 说明

### 添加问题

#### POST /question/add

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|groupId|群组 Id |String| 是|
|description|问题描述 |String| 是|
|solution|解决方案 |String| 是|

#### 返回结果

```
{
	"code":200
}
```

### 修改问题

### POST /question/modify

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|id|问题 Id |Number| 是|
|description|问题描述 |String| 否|
|solution|解决方案 |String| 否|
|status|问题状态 |Number| 否|

description、solution、status 传哪个修改哪个，不传为不修改

#### 返回结果

```
{
	"code":200
}
```

### 删除问题

#### POST /question/delete

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|id|问题 Id |Number| 是|

#### 返回结果

```
{
	"code":200
}
```

### 问题列表

#### POST /question/search_all

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|groupId|群组 Id |String| 是|

#### 返回结果

```js
{
    "code":200,
    "result": [
        {
            "id": 1, // 问题 id
            "groupId": "test1", // 群组 id
            "description": "John",
            "solution": "Hancock",
            "status": 1
        },
        {
            "id": 3,
            "groupId": "test1",
            "description": "a4234",
            "solution": "solution",
            "status": 1
        }
    ]
}
```
