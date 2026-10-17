# GitHub 发布和更新

GitHub 账号：`Bishop-zh`。
主页仓库：`Bishop-zh/bishop-zh.github.io`。
预定访问地址：https://bishop-zh.github.io/ 。部署成功后才能访问。

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

Gitee 原仓库保留。迁移使用独立镜像副本，将全部分支和标签推送到新的空 GitHub 仓库，保留原提交历史。
如项目使用 Git LFS，还需要单独迁移 LFS 对象；大文件或上传限制应先处理，不能仅凭网页上出现仓库名称判断迁移成功。
普通 Git 推送不包含 Gitee 的 Issue、评论、PR 和 Releases 附件。
