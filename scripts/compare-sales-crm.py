"""Produce analysis heatmaps, never alter either source screenshot."""
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance

root = Path(__file__).resolve().parents[1] / "public/blog/sales-crm"
output = root / "diff"
output.mkdir(exist_ok=True)
comparisons = []
for before in sorted((root / "reference").glob("*.png")):
    after = root / "replica" / before.name
    if not after.exists():
        continue
    a, b = Image.open(before).convert("RGB"), Image.open(after).convert("RGB")
    if a.size != b.size:
        raise ValueError(f"Mismatched viewports: {before.name}: {a.size}/{b.size}")
    diff = ImageChops.difference(a, b)
    ImageEnhance.Contrast(ImageEnhance.Brightness(diff).enhance(3)).enhance(2).save(output / before.name)
    comparisons.append({"state": before.stem, "width": a.width, "height": a.height, "reference": f"/blog/sales-crm/reference/{before.name}", "replica": f"/blog/sales-crm/replica/{before.name}", "diff": f"/blog/sales-crm/diff/{before.name}"})
(output / "comparisons.json").write_text(json.dumps({"method": "RGB absolute difference, brightness x3 and contrast x2 for inspection; no pixel pass/fail percentage. Font, assets, accessibility and behavioral enhancements intentionally differ.", "comparisons": comparisons}, indent=2) + "\n")
print(f"{len(comparisons)} reference/replica/heatmap sets")
