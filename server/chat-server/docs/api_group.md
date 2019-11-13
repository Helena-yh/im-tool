### 群组相关接口

| 接口地址 | 说明 |
|---------|-----|
| [/group/create](#post-groupcreate) | 创建群组 |
| [/group/join](#post-groupjoin) | 加入群组 |
| [/group/mute](#post-groupmute) | 添加群成员 |


## API 说明

### POST /group/create

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|id|群 id|String| 是|
|name|群名称 |String| 是|
|memberIds|成员 Id |Array| 是|

{
    "name": "一个群名字",
    "memberIds": ["user1","user2"]
}
#### 返回结果

```
{
	"code":200
}
```