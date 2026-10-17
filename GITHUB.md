# GitHub 发布和更新

GitHub 账号：`Bishop-zh`。
主页仓库：`Bishop-zh/bishop-zh.github.io`。
访问地址：https://bishop-zh.github.io/ 。2026-10-17 首次部署成功，首页实际访问返回 HTTP 200。

## 发布原理

本仓库保存网页和维护脚本，GitHub Actions 只把 `dist/` 发布成网站。
每次推送到 `main` 后，`.github/workflows/pages.yml` 自动部署。
不需要安装网页依赖，也不需要服务器和付费域名。
GitHub 免费账号使用公开仓库发布 Pages，仓库中提交的内容和 Git 历史均可公开查看。

## 日常更新

在本目录打开 PowerShell。修改网页后执行：

```powershell
# 修改 profile.json 或 resume-content.json 后，先生成网页。
node build-profile.mjs

git add .
git commit -m "Update portfolio"
git push
```

如果只修改 `dist/` 中的项目文字、样式、图片，则不必运行生成命令。
首页个人资料来自 `profile.json`；简历正文来自 `resume-content.json`。
不要把密码、令牌、私人证件或未准备公开的资料提交到仓库。

## 查看发布结果

打开仓库的 Actions，查看 `Deploy portfolio to GitHub Pages` 是否成功。
仓库 Settings → Pages 的 Source 应为 GitHub Actions。
网站发布目录始终是 `dist/`，无需把整个仓库当作网站根目录。

GitHub Pages 托管 HTML、CSS、JavaScript 和图片；游戏服务器需另外部署。
国内网络的可达性和速度需要用实际设备测试。

## Gitee 项目迁移

Gitee 原仓库保留。最终使用本机现有 Git 仓库推送到 GitHub，保留原提交历史；没有重新暂存原工程中的未跟踪文件。TankGame 使用本次已下载完成的 Git 镜像。
如项目使用 Git LFS，还需要单独迁移 LFS 对象；大文件或上传限制应先处理，不能仅凭网页上出现仓库名称判断迁移成功。
普通 Git 推送不包含 Gitee 的 Issue、评论、PR 和 Releases 附件。

之后在原来的游戏项目目录中，也可以同时保留 Gitee 和 GitHub 两个远程地址。例如 Who Will BOOM：

```powershell
# 首次添加 GitHub 远程地址，只执行一次。
git remote add github https://github.com/Bishop-zh/who-will-boom.git

# 提交修改后，分别推送到两个平台。
git push origin main
git push github main
```

`platform-jumping` 同样使用 `main`，`tank-game` 原分支为 `master`。
两个平台不会自动互相同步；推送到一个平台后，另一个平台需要另行推送。
本地项目与远程地址：

| 项目 | 本地目录 | GitHub 仓库 | 分支 |
| --- | --- | --- | --- |
| 锈境 | `C:\demo\u3D\jump` | `Bishop-zh/platform-jumping` | `main` |
| Who Will BOOM | `C:\demo\u3D\Who will BOOM` | `Bishop-zh/who-will-boom` | `main` |
| PKBall | `C:\code\GameMake\PKBall` | `Bishop-zh/pkball` | `main` |
| TankGame | 本次保留的 Git 镜像 | `Bishop-zh/tank-game` | `master` |

PKBall 是新初始化的工程仓库，已添加 Unity 忽略规则，只提交 `Assets`、`Packages`、`ProjectSettings`、`Docs`、`Tools` 和项目说明。`origin` 指向 Gitee 的 `sillybishop/pkball`，`github` 指向 GitHub。

GitHub 的大包 HTTPS 上传在当前网络反复断开，因此游戏项目的 `github` 远程已配置 SSH 443 端口，并使用本机专用密钥与现有系统代理。私钥位于本机 `.ssh` 目录，没有加入任何项目。若将来更换电脑或系统代理端口，需要重新检查 SSH 配置。

## 网页小游戏分别更新

个人主页只包含项目截图、介绍和“在线试玩”跳转；游戏二进制分别放在各自仓库的 `gh-pages` 分支。

| 项目 | 试玩地址 | 本地源工程 |
| --- | --- | --- |
| 锈境 | https://bishop-zh.github.io/platform-jumping/ | `C:\demo\u3D\jump` |
| Who Will BOOM | https://bishop-zh.github.io/who-will-boom/ | `C:\demo\u3D\Who will BOOM` |
| PKBall | https://bishop-zh.github.io/pkball/ | `C:\code\GameMake\PKBall` |
| TankGame | https://bishop-zh.github.io/tank-game/ | 本工作区的 `tank-game-webgl`，来自此前的本地镜像 |

每个源工程的 `WEBGL.md` 都有构建与发布说明。用 Unity 2022.3.62f3c1 和 WebGL 模块，执行 `PortfolioWebGLBuild.Build` 即可构建；不要把 Library、Temp 或 Windows 构建目录放进主页。更新游戏不需要重新上传个人主页。

本次辅助脚本在工作区 `.tools/` 中：`package-webgl.mjs <仓库名>` 打包已成功的 Unity 输出并生成试玩页面；`publish-game-api.ps1 -Slug <仓库名>` 使用本机已有 GitHub 登录，逐文件校验 SHA 并发布到该项目的 gh-pages。它们不是主页运行依赖，不会上传凭据。公开试玩的路径长期不变，主页按钮不需要每次修改。

Who Will BOOM 网页是单机 / AI 试玩，TCP/UDP 联机和语音仍使用桌面版。当前游戏推荐桌面 Chrome / Edge、鼠标和键盘。
