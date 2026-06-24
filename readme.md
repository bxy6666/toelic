# TOEIC Practice Studio 启动说明

本项目是一个本机个人版 TOEIC 练习网页应用，采用 Next.js + TypeScript + Tailwind + shadcn/ui + Prisma + SQLite。题目由本地后端读取华为云 MaaS API Key 后生成，浏览器端不会直接持有 API Key。

## 1. 环境要求

- Node.js：建议使用当前项目已验证的 Node 24.x
- npm：建议使用当前项目已验证的 npm 11.x
- 浏览器：Chrome 或 Edge
- 网络：生成题目时需要能够访问华为云 MaaS API

## 2. 首次准备

在项目根目录执行：

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
```

如果是第一次初始化数据库，执行：

```powershell
npx prisma migrate deploy
```

项目默认使用 SQLite。数据库地址由 `.env` 中的 `DATABASE_URL` 控制，当前设计为本机文件数据库。首次运行前先创建 `.env`，否则 Prisma CLI 无法读取数据库地址。

## 3. 配置 MaaS API Key

在项目根目录创建或修改 `.env` 或 `.env.local`，参考 `.env.example` / `.env.local.example`：

```env
MAAS_API_KEY=your_local_api_key_here
MAAS_BASE_URL=https://api.modelarts-maas.com/v1/
MAAS_MODEL=deepseek-v3.2
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_IMAGE_MODEL=gpt-image-2
```

注意：

- 不要把真实 API Key 写入 `readme.md`、`spec.md`、`design.md`、源码或任何可提交文档。
- `.env.local` 已由 `.gitignore` 忽略，只用于本机运行。
- API Key 只允许服务端 API Route 读取，前端只请求本地 `/api/ai/generate-questions`。
- 不要使用 `NEXT_PUBLIC_*` 保存 API Key，否则会暴露到浏览器端。
- `MAAS_API_KEY` 用于生成题目文字；`OPENAI_API_KEY` 仅在听力 `图片描述风格` 题型中用于生成原创配图。

## 4. 启动开发服务器

执行：

```powershell
npm run dev
```

启动后访问：

[http://127.0.0.1:3000](http://127.0.0.1:3000)

常用页面：

- 首页：`/`
- 听力练习：`/listening`
- 语法练习：`/grammar`
- 错题本：`/mistakes`
- 学习统计：`/stats`
- 设置：`/settings`

## 5. 常用验证命令

开发或修改后建议至少执行：

```powershell
npm run lint
npm run build
node scripts/browser-smoke.mjs
```

## 9. 登录与公网安全

V2 起，公网分享模式需要先登录。第一次打开 `/login` 时，如果数据库中还没有用户，输入用户名和至少 8 位密码会创建本机管理员账号。之后也可以通过登录页的“注册”入口创建普通账号，题目、错题、统计和设置会按账号隔离。

如果公网演示时不想开放新用户注册，可以在环境变量中关闭：

```env
PUBLIC_REGISTRATION_ENABLED=false
```

登录后才能使用生题、答题、错题、统计、设置和清空数据。Session 使用 HttpOnly Cookie，浏览器脚本不能读取完整 token。

清空学习数据时，前端弹窗确认之外，接口还要求提交确认文本：

```json
{
  "confirmText": "CLEAR"
}
```

AI 生成默认每日上限为 50 题，可在本机环境变量中调整：

```env
DAILY_AI_GENERATION_LIMIT=50
```

## 10. 新环境验证

首次拉取或迁移后建议执行：

```powershell
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run typecheck
npm run lint
npm run test:run
npm run build
```

图片描述题生成的图片会保存在 `output/generated-images/`，该目录不提交到 Git。

如果修改了 Prisma schema 或数据库迁移，再执行：

```powershell
npx prisma migrate deploy
npm run prisma:generate
```

## 6. 生产模式本地预览

先构建：

```powershell
npm run build
```

再启动：

```powershell
npm run start
```

默认仍访问：

[http://127.0.0.1:3000](http://127.0.0.1:3000)

## 7. 让别人通过公网访问

本项目可以保持后端、SQLite 和 MaaS API Key 都运行在你的电脑上，同时通过公网隧道把网页开放给其他人访问。

重要前提：

- 你的电脑必须开机，且本项目服务必须保持运行。
- 电脑休眠、断网、关闭终端或停止 Next.js 服务后，公网访问会中断。
- 不要把 `.env.local`、真实 API Key、SQLite 数据库文件发给别人。
- 公网访问会让别人能使用你的 MaaS Key 生成题目，可能产生 API 调用费用；建议只分享给可信的人。

### 7.1 先用公网模式启动本机服务

开发调试时：

```powershell
npm run dev:public
```

更接近正式使用时，建议先构建再启动：

```powershell
npm run build
npm run start:public
```

这会让 Next.js 监听：

```text
http://0.0.0.0:3000
```

本机仍可访问：

[http://127.0.0.1:3000](http://127.0.0.1:3000)

同一局域网内的设备可访问：

```text
http://你的电脑局域网IP:3000
```

查看本机局域网 IP：

```powershell
ipconfig
```

如果局域网设备无法访问，检查 Windows 防火墙是否允许 Node.js / 端口 3000 入站访问。

### 7.2 临时公网地址：Cloudflare Quick Tunnel

这是最快的公网共享方式，不需要改路由器，不需要打开公网端口。

先安装 `cloudflared`：

```powershell
winget install --id Cloudflare.cloudflared
```

打开第一个终端，保持项目服务运行：

```powershell
npm run build
npm run start:public
```

打开第二个终端，优先使用项目内置脚本启动公网隧道：

```powershell
npm run tunnel:quick
```

这个脚本会自动完成三件事：

1. 查找 `cloudflared.exe`，避免 Windows / VS Code 终端没有刷新 PATH 导致命令找不到。
2. 先检查 [http://127.0.0.1:3000](http://127.0.0.1:3000) 是否可访问，避免本地服务未启动时直接建隧道。
3. 使用 IPv4 + HTTP/2 发起 Quick Tunnel，并在 Cloudflare 握手失败后自动重试。

终端会输出一个类似下面的临时公网地址：

```text
https://xxxx.trycloudflare.com
```

项目脚本会额外用中文高亮打印：

```text
公网访问地址：
https://xxxx.trycloudflare.com
```

把这个地址发给别人，对方就可以从公网访问你电脑上运行的 TOEIC Practice Studio。

注意：

- 这个地址是临时的，关闭 `cloudflared` 后就失效。
- 下次启动通常会生成新的地址。
- 每次只使用当前终端最新输出的 `https://xxxx.trycloudflare.com`，不要继续打开上一次的旧地址。
- 适合临时演示、测试、给朋友短时间体验。

如果确实需要手动运行，也可以使用完整路径，避免 PATH 问题：

```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --no-autoupdate --edge-ip-version 4 --protocol http2 --url http://127.0.0.1:3000
```

### 7.3 固定公网域名：Cloudflare Tunnel

如果你有自己的域名，并且域名已接入 Cloudflare，可以配置固定公网域名。

登录 Cloudflare：

```powershell
cloudflared tunnel login
```

创建隧道：

```powershell
cloudflared tunnel create toeic-practice-studio
```

把隧道绑定到你的域名，例如：

```powershell
cloudflared tunnel route dns toeic-practice-studio toeic.example.com
```

创建或编辑配置文件：

```powershell
notepad $env:USERPROFILE\.cloudflared\config.yml
```

写入以下内容，并把 `<TUNNEL_ID>` 和 Windows 用户名路径替换为你本机实际值：

```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\<你的用户名>\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: toeic.example.com
    service: http://127.0.0.1:3000
  - service: http_status:404
```

启动固定域名隧道：

```powershell
cloudflared tunnel run toeic-practice-studio
```

保持两个进程同时运行：

1. `npm run start:public`
2. `cloudflared tunnel run toeic-practice-studio`

别人即可访问：

```text
https://toeic.example.com
```

### 7.4 不推荐直接端口转发

也可以通过路由器端口转发把 `3000` 暴露到公网，但不推荐作为默认方案，因为需要处理公网 IP、路由器、防火墙和端口安全问题。优先使用 Cloudflare Tunnel。

### 7.5 公网访问排查

如果别人打不开：

1. 先在本机访问 [http://127.0.0.1:3000](http://127.0.0.1:3000)。
2. 确认 Next.js 终端没有报错。
3. 确认 `cloudflared` 终端仍在运行，并且已经输出新的 `https://xxxx.trycloudflare.com` 地址。
4. 如果使用固定域名，确认 DNS 已生效。
5. 如果生成题目失败，检查 `.env.local` 中的 `MAAS_API_KEY`，然后重启 `npm run start:public`。

常见 Cloudflare Quick Tunnel 日志说明：

- `cloudflared` 不是可识别命令：说明当前终端没有读到 PATH。直接使用 `npm run tunnel:quick`，或关闭 VS Code 后重新打开。
- `status_code=500 Internal Server Error`：通常是 Cloudflare Quick Tunnel 临时服务返回异常，不是本项目后端错误。稍等后重新执行 `npm run tunnel:quick`。
- `Unauthorized: Tunnel not found`：常见于旧的临时地址已失效，或浏览器还在访问上一次的 `trycloudflare.com` 地址。关闭旧页面，等待当前终端输出新的公网地址后，只访问最新地址。
- 看到 `Registered tunnel connection` 但没有看到公网地址时，继续等待几秒；如果进程退出，再重新执行 `npm run tunnel:quick`。

## 8. 使用注意事项

- 听力题在提交答案前会隐藏英文选项正文，只显示 A/B/C/D；提交后才显示选项、正确答案和中文解析。
- 听力播放依赖浏览器 Web Speech API，不依赖 MaaS 生成音频。
- 缺少 `MAAS_API_KEY` 时，生成题目会失败并提示需要配置本地 Key，这是预期行为。
- 题目、练习记录、错题和设置保存在 SQLite 中；清除数据前请确认不需要保留历史记录。
- 当前版本是本机个人版，不包含登录、多端同步和云部署。
- 后续新增需求仍按 `spec.md -> design.md -> tasks.md -> implementation -> acceptance.md` 的 spec-driven 流程推进。

## 9. 常见问题

### 生成题目失败

先检查 `.env.local` 是否存在，并确认包含：

```env
MAAS_API_KEY=your_local_api_key_here
MAAS_BASE_URL=https://api.modelarts-maas.com/v1/
MAAS_MODEL=deepseek-v3.2
```

然后重启开发服务器。Next.js 只会在服务启动时稳定读取环境变量，修改 `.env.local` 后建议重新执行 `npm run dev`。

### 数据库相关命令失败

先确认 `.env` 中存在 `DATABASE_URL`，再执行：

```powershell
npx prisma migrate deploy
npm run prisma:generate
```

### 页面样式或动效异常

先刷新浏览器；如果仍异常，重新启动开发服务器并执行：

```powershell
npm run lint
npm run build
node scripts/browser-smoke.mjs
```
