### 群组相关接口

| 接口地址 | 说明 |
|---------|-----|
| [/group/create](#post-groupcreate) | 创建群组 |
| [/group/add](#post-groupadd) | 添加群成员 |
| [/group/join](#post-groupjoin) | 加入群组 |

## API 说明

### POST /group/create

#### 请求参数

|参数|说明|数据类型|是否必填|
|---|----|------|------|
|friendId|朋友 id |String| 是|

#### 返回结果

```
{
	"code":200,
    "result": {
        id: 'RfqHbcjes'
    }
}
```