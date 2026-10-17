# SillyBishop 作品集：分屏与循环胶片

这是可直接浏览的 HTML / CSS / JavaScript 作品集，已配置 GitHub Pages 自动发布。仓库为 `Bishop-zh/bishop-zh.github.io`，目标地址为 https://bishop-zh.github.io/ 。日常更新和发布步骤见 [GITHUB.md](GITHUB.md)，实际发布结果以仓库 Actions 为准。

启动：在本目录执行 `node serve.mjs`，打开 http://127.0.0.1:4177/ 。可部署的静态文件全部位于 `dist/`，无需安装依赖或构建。

## 更新个人资料与简历

最新简历已按用户提供的 PDF 单独维护在 `resume-content.json`，包含联系方式、教育信息、四组技能和三个项目；头像文件为 `dist/assets/resume-avatar.jpg`。修改后运行 `node build-resume.mjs` 更新网页版简历。`node build-profile.mjs` 也会调用此生成器，因此不会用旧摘要覆盖新简历。主页资料仍由 `profile.json` 管理。以下旧说明中涉及简历内容源的部分，以本段为准。

本次换头像的 PDF 位于 `../output/pdf/张梓彦_Unity开发简历.pdf`，保留用户原稿的文字与排版。它是本次导出快照；后续网页版更新后可通过打印重新保存 PDF。

个人资料统一维护在 `profile.json`。修改姓名、教育、技能、到岗时间或简历项目内容后，在本目录执行 `node build-profile.mjs`，即可同时更新首页个人信息、技能栏与 `dist/resume.html`。无需安装依赖。页面为静态 HTML，阅读不依赖数据请求。

首页“查看简历”进入网页版简历；点击“打印 / 另存为 PDF”，在浏览器打印窗口选择“另存为 PDF”。纸张选 A4，并关闭浏览器页眉页脚。每次重新生成后，简历地址不变，重新打印即可获得最新 PDF。

`email` 暂留空；填入真实邮箱并运行生成命令后，首页会出现“邮件联系”，简历也会显示邮箱。到岗年份按本次提供信息的时间写为 2026 年；如计划变化，修改 `availability`。学习计划单独展示，不计入已掌握技能。

`profile.json` 中的 `projects` 用于简历项目摘要；主页两个作品分区与文章列表仍在 `dist/index.html` 中维护。不要直接修改首页个人信息区或 `dist/resume.html`，它们会在生成时更新。项目个人分工、开发时间、联系方式和实机素材仍需根据真实信息补充。

## 已实现

- 五屏结构：个人信息 → 技能与实践 → 锈境 → Who Will BOOM → 技术与项目文档。首屏可直接跳到任一项目，顶部导航可直达技能第二屏。
- 桌面一次滚轮手势切换一屏，过滤触控板惯性；手机使用原生滚动吸附。小屏或矮窗口内容较长时，可先滚动读完当前屏。
- 锈境三张界面图采用透视胶片排列，向左右无限循环。支持图片边缘按钮、左右方向键、鼠标拖动和手机真实触摸滑动。
- 图片左右切换与页面上下切屏相互独立；当前项目与图片变化时，背景同步更新。
- 项目旁直接展示实现内容、技术栈和源码入口；没有文章时展示真实项目文档与教程学习项目。
- 技术记录采用编辑式目录：主文档突出标题、摘要与示意图，另两条为精简阅读条目，技术栈形成独立侧栏；手机改为文档优先、技术索引在后的单列排版。入口直接链接现有 Gitee 文档，无虚构发布日期、阅读量或已发表博客。
- 背景使用封面的实际图像与色彩，不是预设的几个纯色。
- 个人信息与技术记录页分别使用本地 SVG 夜色渐变底图，沿用项目页的模糊纹理、轻微扭曲与交叉渐变。首屏为蓝灰与青绿，记录页为灰蓝与鼠尾草绿，四屏共用同一遮罩，切换时不会突然变成纯暗色。
- 缓存低分辨率模糊纹理，通过 WebGL 做轻微扭曲和约 950ms 的交叉渐变；前景图片和正文保持清晰。
- 桌面端最高约 24fps、手机端最高约 18fps；页面隐藏时停止动画。提供暂停按钮，并尊重系统的减少动态效果设置。
- WebGL 不可用时降级为 CSS 模糊背景；无需加载第三方 JavaScript、字体或 CDN 资源。
- 支持 320px、390px、768px 和 1440px 布局；真实项目预览可以点击放大。

## 素材真实性

- `assets/rust-menu-preview.webp` 来自用户公开项目仓库的 `ArtSource/MainMenu/preview.png`，仅转换为 WebP 以减小下载量。
- `assets/rust-levels-preview.webp` 来自同一仓库的 `ArtSource/LevelSelect/preview.png`，仅转换为 WebP 以减小下载量。
- `assets/rust-settings-preview.webp` 来自同一仓库的 `ArtSource/Modal/settings_preview.png`，仅转换为 WebP 以减小下载量。
- 以上三张是仓库中的界面设计预览，未声称它们是运行中的实机游玩截图。
- `assets/boom-cover.svg` 是明确标注的原创概念标题图。Who Will BOOM 和 TankGame 仍需提供运行截图或录屏，才能完成实机封面替换。
- 没有现成的浏览器可玩链接，因此页面提供真实源码入口，未伪装“开始游戏”按钮。

素材来源：

- https://gitee.com/sillybishop/platform-jumping/raw/main/ArtSource/MainMenu/preview.png
- https://gitee.com/sillybishop/platform-jumping/raw/main/ArtSource/LevelSelect/preview.png
- https://gitee.com/sillybishop/platform-jumping/raw/main/ArtSource/Modal/settings_preview.png
- https://gitee.com/sillybishop/who-will-boom

## 验证

`verify.mjs` 使用本机现有 Chrome 和工作区附带的 Playwright，检查滚轮手势只切一屏、键盘与快捷导航、胶片双向循环、图片放大与焦点恢复、背景动画/暂停，以及通过 Chrome DevTools 发送的真实触摸左右滑动和上下切屏。覆盖 320 / 390 / 768 / 1440px 宽度和矮窗口，另验证减少动态效果与无 WebGL 降级。检查结果位于 `verification/`。

该验证脚本引用当前机器的绝对依赖路径，不属于网站部署文件。
