from pathlib import Path
import re


root = Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")

html = re.sub(
    r'<link rel="stylesheet" href="/static/css/([^"]+)">',
    lambda match: "<style>\n" + (root / "static/css" / match[1]).read_text(encoding="utf-8") + "\n</style>",
    html,
)
html = re.sub(
    r'<script src="/static/js/([^"]+)"></script>',
    lambda match: "<script>\n" + (root / "static/js" / match[1]).read_text(encoding="utf-8") + "\n</script>",
    html,
)
(root / "index.html").write_text(html, encoding="utf-8")
