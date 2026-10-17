# 免费部署与国内访问建议

核实时间：2026-10-17。当前选择 GitHub Pages 免费静态托管，账号为 `Bishop-zh`，仓库为 `bishop-zh.github.io`，目标地址为 https://bishop-zh.github.io/ 。已配置从 `main` 分支自动发布 `dist/` 的工作流；实际发布结果以 GitHub Actions 为准。没有购买域名或服务。更新操作见 [GITHUB.md](GITHUB.md)。以下保留其他托管方式的对比资料。

## 推荐路径

1. 零预算验证：先使用 GitHub Pages 这类免费静态托管地址进行页面验证。不能据此保证中国大陆各运营商的速度或持续可达性；正式给 HR 的地址需要实测。
2. 正式投递的折中：自有域名 + EdgeOne Pages / Makers 免费托管。托管可以免费，域名注册与续费另计。没有备案时选择“全球可用区（不含中国大陆）”；这仍然是境外节点，应实测移动、联通、电信和手机网络，不能承诺大陆 CDN 的效果。
3. 国内访问优先：使用已备案的域名，再接入平台的中国大陆或含中国大陆加速区域。需要确认账号认证、备案接入条件及实际可用套餐；域名、备案所需的基础资源和未来超额费用不能预先承诺全部为零。

## EdgeOne 的关键事实

- 官方当前提供长期免费版，支持静态托管、Git 集成和自定义域名。
- 支持直接导入 Gitee 仓库，所以不必为了部署先迁移所有项目到 GitHub。
- 默认项目域名和部署域名在中国大陆需要系统生成的预览链接，该链接只有 3 小时有效，过期可能返回 401。不要把这种链接写进简历。
- 绑定自定义域名后可建立稳定地址；选大陆或全球含大陆节点，需要域名备案；选全球不含大陆节点无需备案。
- 当前文件大小上限是 25 MB。个人主页及封面容易满足；Unity WebGL 的 `.data` / `.wasm`、视频或 Windows 安装包可能超过限制，要单独检查，不能直接把完整游戏包混进主页后就默认可部署。

## 当前样稿如何部署

托管根目录选择 `ambient-preview/dist`；若只上传网页产物，则上传该目录里的全部文件。构建命令留空，不需要安装依赖。首次部署后配置 HTTPS 和域名，再检查页面、图片、资源路径以及各运营商实际访问情况。

### 没有域名时的零预算验证

1. 在自己的 GitHub 账号下新建一个公开仓库，例如 `portfolio`。
2. 把 `dist` 里面的文件和 `assets` 目录放到仓库根目录，确保根目录直接存在 `index.html`。
3. 打开仓库 Settings → Pages，选择从分支发布，选择 `main` 分支和根目录。
4. 等待 Pages 的部署完成，从控制台复制实际访问地址。仓库站点一般有仓库名称前缀；当前样稿所有资源都使用相对路径，适合这种结构。
5. 先用手机流量和家里网络测试访问。此路径解决零费用上线问题，不提供中国大陆速度保障。

[官方 GitHub Pages 创建指南](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

### 后续接入 EdgeOne

1. 保留 Gitee 作为代码仓库也可以，EdgeOne 支持直接导入。
2. 选择静态项目，输出目录指向 `ambient-preview/dist`；如果仓库根目录就是静态产物，则选择根目录。无需构建命令。
3. 获得自己的域名后，按官方文档添加自定义域名、配置 CNAME 和 HTTPS。
4. 无备案先选择全球不含大陆节点；需要大陆节点时，先核实并完成备案和接入条件。
5. 简历填写自定义域名，避免使用 3 小时有效的预览链接。

不把 Gitee raw 图片地址直接用作网站图床：当前样稿已把图片保存为本地静态资源，避免访问者再向仓库请求图片。

两张界面预览图已由约 4.07 MB 的原 PNG 转换成合计约 223 KB 的 WebP；原始文件保留在任务工作区，Figma 使用原始 PNG。网页无需请求外部字体或第三方脚本。

## 在线试玩是单独的一步

现有 Windows 构建不能直接在浏览器里运行。需要从 Unity 导出并测试 WebGL 版本。Who Will BOOM 的原始 TCP / UDP 联机还涉及浏览器限制，需要检查 WebSocket / WebRTC 适配；静态托管也不会运行一个游戏联机服务器。初版可先用真实录屏与单机试玩降低访问门槛。

## 官方资料

- [EdgeOne 免费版说明](https://pages.edgeone.ai/zh/pricing)
- [域名与国内预览链接规则](https://pages.edgeone.ai/zh/document/domain-overview)
- [导入 Git 仓库，含 Gitee](https://pages.edgeone.ai/document/importing-a-git-repository)
- [EdgeOne 限制与配额](https://pages.edgeone.ai/document/limits-and-quotas)
- [GitHub Pages 配额](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Cloudflare 中国网络是 Enterprise 独立订阅](https://developers.cloudflare.com/china-network/)
- [Unity 2022.3 WebGL 网络限制](https://docs.unity.cn/2022.3/Documentation/Manual/webgl-networking.html)

Cloudflare 免费 Pages 不应被描述为附带免费的中国大陆加速网络；官方中国网络属于 Enterprise 的独立订阅。
