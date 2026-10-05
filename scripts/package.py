from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parents[1];out=root/'release/signal-rig-minitool.zip';out.parent.mkdir(exist_ok=True)
with ZipFile(out,'w',ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted((root/'dist').rglob('*')):
  if p.is_file():z.write(p,p.relative_to(root/'dist'))
assert out.stat().st_size<5*1024*1024, 'ZIP exceeds conservative 5MiB budget'
print(str(out),out.stat().st_size,'bytes')
