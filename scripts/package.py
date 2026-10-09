#!/usr/bin/env python3
"""Build the two distributables for this independent project; no network."""
import argparse, hashlib, json, re, shutil, zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--output',type=Path,default=ROOT/'dist')
args=parser.parse_args()
meta_text=(ROOT/'SKILL.md').read_text().split('---',2)[1]
# This project's frontmatter uses JSON scalars, a valid YAML subset.
meta={k:json.loads(v.strip()) for k,v in (line.split(':',1) for line in meta_text.strip().splitlines())}
for key in ['name','display_name','description','description_zh','description_en','version','author']:
    assert isinstance(meta.get(key),str) and meta[key], 'missing metadata: '+key
skill=['SKILL.md','references/common.md','references/mcp-contract.md','references/calculation.md','references/examples.md','scripts/meal-math.ts']
source=skill+['README.md','CONTEST_DECLARATION.md','MCP_INTEGRATION.md','mcp-config.example.json','.gitignore','scripts/package.py','tests/meal-math.test.ts','tests/排序示例.json','assets/头像.png','docs/实施说明.md','docs/WorkBuddy验收.md','docs/参赛清单.md','docs/头像说明.md','docs/验证记录.md','docs/接口验证摘要.json']
if (ROOT/'workbuddy.md').is_file():
    raise SystemExit('请先审阅并脱敏新加入的 workbuddy.md，再显式把它加入源码清单；本打包器不会自动公开对话。')
for path in source:
    p=ROOT/path
    assert p.is_file() and not p.is_symlink(), 'missing/unsafe file: '+path
for match in re.findall(r'@references/([\w.-]+)',(ROOT/'SKILL.md').read_text()):
    assert 'references/'+match in skill
config=json.loads((ROOT/'mcp-config.example.json').read_text())
assert config['mcpServers']['mcd-mcp']['headers']['Authorization']=='Bearer ${MCD_MCP_TOKEN}'
args.output.mkdir(parents=True,exist_ok=True)
results=[]
for label,files,prefix in [('WorkBuddy',skill,''),('独立仓库源码',source,meta['name']+'/')]:
    dest=args.output/(meta['display_name']+'-'+label+'-v'+meta['version']+'.zip')
    with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as archive:
        for rel in sorted(files):
            entry=zipfile.ZipInfo(prefix+rel,date_time=(2026,10,9,0,0,0))
            entry.compress_type=zipfile.ZIP_DEFLATED
            entry.external_attr=0o644<<16
            archive.writestr(entry,(ROOT/rel).read_bytes())
    with zipfile.ZipFile(dest) as archive:
        assert archive.testzip() is None
        if not prefix: assert 'SKILL.md' in archive.namelist()
    if not prefix:
        bundled=ROOT/'packages'/dest.name
        bundled.parent.mkdir(exist_ok=True)
        assert not bundled.is_symlink()
        if bundled.resolve()!=dest.resolve(): shutil.copyfile(dest,bundled)
        source.append('packages/'+dest.name)
    results.append({'file':dest.name,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
print(json.dumps(results,ensure_ascii=False,indent=2))
