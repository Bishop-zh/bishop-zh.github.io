import {readFile, writeFile} from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const p = JSON.parse(await readFile(new URL('profile.json', root), 'utf8'));
const codeHost = p.github ? {url: p.github, label: 'GitHub'} : {url: p.gitee, label: 'Gitee'};
const e = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const url = value => {const parsed = new URL(value); if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Expected HTTP(S) link'); return e(parsed.href);};
const education = `${p.school} · ${p.major} ${p.degree}`;
const skills = p.skills.map(s => `<div><h3>${e(s.title)}</h3><p>${e(s.text)}</p></div>`).join('');
const contact = p.email ? `<a class="profile-button" href="mailto:${e(p.email)}">邮件联系 ↗</a>` : '';
const profile = `<div class="panel-inner profile-inner">
  <div class="profile-heading"><p class="eyebrow">${e(p.alias.toUpperCase())} / PORTFOLIO</p><h1 id="profile-title">${e(p.name)}<span class="title-period">.</span></h1><p class="profile-role">${e(p.role)}</p><p class="profile-education">${e(education)}<br><strong>${e(p.graduation)}毕业生</strong></p></div>
  <div class="profile-aside"><p class="availability-label">实习意向 / AVAILABILITY</p><p class="availability-date">${e(p.availability)}</p><p class="availability-duration">${e(p.duration)}</p><p class="profile-detail">${e(p.summary)}</p><div class="profile-actions"><a class="profile-button primary" href="resume.html">查看简历 ↗</a><a class="profile-button" href="#rust">浏览作品 ↓</a>${contact}</div><a class="text-link" href="${url(codeHost.url)}" target="_blank" rel="noopener noreferrer">${e(p.alias)}<span>${codeHost.label} ↗</span></a></div>
  <div class="profile-bottom"><div class="profile-stack"><span>UNITY / C#</span><span>C++ 基础</span><span>GIT / ${codeHost.label.toUpperCase()}</span></div><div class="project-index"><a href="#rust"><span>01</span>锈境：能源重启 <small>2D 平台跳跃</small><i aria-hidden="true">↘</i></a><a href="#boom"><span>02</span>Who Will BOOM <small>单机 AI / 局域网联机</small><i aria-hidden="true">↘</i></a><a href="#pkball"><span>03</span>PKBall <small>弹珠决斗 · 肉鸽构筑</small><i aria-hidden="true">↘</i></a></div></div>
</div>`;
let html = await readFile(new URL('dist/index.html', root), 'utf8');
html = html.replace(/<section id="profile"[^>]*>[\s\S]*?<\/section>/, `<section id="profile" class="panel profile-panel" aria-labelledby="profile-title">${profile}</section>`);
html = html.replace(/<title>.*?<\/title>/, `<title>${e(p.name)} — ${e(p.role)}</title>`);
html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${e(`${p.name}，${education}，${p.graduation}。${p.role}，${p.availability}，${p.duration}。项目作品与技术记录。`)}">`);
html = html.replace(/<a class="wordmark"[\s\S]*?<\/a>/, `<a class="wordmark" href="#profile" aria-label="${e(p.name)} 首页">${e(p.name)}<span class="wordmark-dot">.</span></a>`);
html = html.replace(/<section id="skills"[^>]*>[\s\S]*?<\/section>\s*/, '');
html = html.replace(/<div class="capabilities"[\s\S]*?<\/div>\s*<\/div>\s*<footer>/, '</div>\n<footer>');
const skillsPanel = `<section id="skills" class="panel skills-panel" aria-labelledby="skills-title"><div class="panel-inner"><div class="section-top"><p class="eyebrow">SKILLS / PRACTICE</p><span class="small-meta">技能与实践</span></div><div class="skills-layout"><div class="skills-heading"><h2 id="skills-title">技能与<br>实践<span class="title-period">.</span></h2><p>从编程基础到 Unity 开发，<br>在项目实践中持续积累。</p><a class="text-link" href="#rust">查看项目实践 <span>↓</span></a></div><div class="capabilities" aria-label="技能与学习方向">${skills}<div class="learning-plan"><h3>学习方向</h3><p>${e(p.learningPlan)}</p></div></div></div></div></section>`;
html = html.replace(/<section id="rust"/, `${skillsPanel}\n    <section id="rust"`);
if (!html.includes('<a href="#skills">技能</a>')) html = html.replace('<nav aria-label="主导航">', '<nav aria-label="主导航"><a href="#skills">技能</a>');
html = html.replace(/<nav class="page-rail"[\s\S]*?<\/nav>/, '<nav class="page-rail" aria-label="分屏导航"><a href="#profile" aria-label="个人信息" aria-current="location"><span>个人</span><i></i></a><a href="#skills" aria-label="技能与实践"><span>技能</span><i></i></a><a href="#rust" aria-label="锈境：能源重启"><span>锈境</span><i></i></a><a href="#boom" aria-label="Who Will BOOM"><span>BOOM</span><i></i></a><a href="#pkball" aria-label="PKBall"><span>PKBall</span><i></i></a><a href="#notes" aria-label="技术与记录"><span>记录</span><i></i></a></nav>');
html = html.replace(/(<span class="counter-line"><\/span><span>)\d+(<\/span>)/, '$106$2');
if (!html.includes('href="profile.css"')) html = html.replace('</head>', '  <link rel="stylesheet" href="profile.css">\n</head>');
html = html.replace(/<footer>[\s\S]*?<\/footer>/, `<footer><span>© ${e(p.name)} / ${e(p.alias)}</span><a href="resume.html">查看简历 ↗</a><a href="${url(codeHost.url)}" target="_blank" rel="noopener noreferrer">${codeHost.label} ↗</a></footer>`);
await writeFile(new URL('dist/index.html', root), html);
await import('./build-resume.mjs');
