# EdgeOne Pages 简易文件托管

基于 EdgeOne Pages 的简易文件托管

## 部署

1. Fork 本仓库
2. 打开 https://console.cloud.tencent.com/edgeone/pages/create/git 选择你 fork 的项目
3. 展开 `环境变量` 并添加以下变量并点击 `开始部署` 即可

| 变量名                    | 说明                        |
|------------------------|---------------------------|
| `EO_BLOB_STORE_KEY`    | Blob 存储命名空间，如 `file-base` |
| `EO_BLOB_STORE_SECRET` | 上传接口的校验密钥，自行设定            |

## API

### 上传文件

```http
PUT /upload?key=<blob-key>
X-Auth-Key: <EO_BLOB_STORE_SECRET 密钥>
Content-Type: application/octet-stream

<binary-body>
```

**响应 200：**

```json
{ "ok": true, "key": "my-files/archive.zip" }
```

**错误响应：**

| 状态码   | 说明                  |
|-------|---------------------|
| `401` | `X-Auth-Key` 缺失或不匹配 |
| `400` | 缺少 `?key=` 参数       |
| `405` | 非 PUT 方法            |
| `500` | 环境变量未配置             |

### 下载文件

```http
GET /download?key=<blob-key>
```

**响应 200：**

返回二进制流，响应头包含 `Content-Type`、`Content-Disposition: attachment`、`Content-Length`、`ETag`。

**错误响应：**

| 状态码   | 说明            |
|-------|---------------|
| `400` | 缺少 `?key=` 参数 |
| `404` | 文件不存在         |
| `405` | 非 GET 方法      |
| `500` | 环境变量未配置       |
