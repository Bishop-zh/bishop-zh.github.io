from pathlib import Path
import json, re
from pypdf import PdfReader, PdfWriter
from PIL import Image

root = Path(__file__).resolve().parent
source = Path(r'C:/Users/zhuji/xwechat_files/wxid_0gwmdecaujee22_0e93/msg/file/2026-10/张梓彦_Unity开发简历(1).pdf')
reader = PdfReader(source)
text = reader.pages[0].extract_text()
def bullets(value):
    return [re.sub(r'\s*\n\s*', '', s).strip() for s in value.split('•')[1:]]
skill_text = text.split('专业技能')[1].split('项目经历')[0]
project_text = text.split('项目经历')[1]
names = ['锈境 能源重启', '弹珠决斗与肉鸽构筑', 'Who Will BOOM 谁会爆炸']
projects = []
for i, name in enumerate(names):
    block = project_text.split(name, 1)[1]
    if i+1 < len(names): block = block.split(names[i+1], 1)[0]
    lines = block.strip().splitlines()
    projects.append({'name':name, 'type':lines[0].strip(' |'), 'url':'https://gitee.com/sillybishop/who-will-boom' if i==2 else '', 'points':bullets(block)})
data = {'name':'张梓彦', 'role':'Unity 客户端开发实习生 / 2027 届', 'location':'湖南长沙', 'phone':'18536689303', 'email':'2778486337@qq.com', 'photo':'assets/resume-avatar.jpg', 'education':'中南林业科技大学 | 软件工程本科 | 2023.09—2027.06', 'honors':'GPA 3.3/5.0 | 专业排名前 20% | CET-4 | 校级奖学金（2025）', 'courses':'主修：数据结构、操作系统、计算机网络、软件工程、设计模式', 'skills':bullets(skill_text), 'projects':projects}
(root/'resume-content.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
writer = PdfWriter()
writer.clone_document_from_reader(reader)
page = writer.pages[0]
avatar = Image.open(root/'dist/assets/resume-avatar.jpg')
page.images[0].replace(avatar)
# Preserve the supplied image proportions within the original portrait area.
height = 82.8 * avatar.height / avatar.width
stream = page.get_contents()
stream.set_data(stream.get_data().replace(b'82.8 0 0 -114 436.56 148.8 cm', f'82.8 0 0 -{height:.4f} 436.56 {34.8+height:.4f} cm'.encode()))
page.replace_contents(stream)
output = root.parent/'output/pdf'
output.mkdir(parents=True, exist_ok=True)
with (output/'张梓彦_Unity开发简历.pdf').open('wb') as f: writer.write(f)
print('Imported resume content and saved PDF with replacement portrait.')
