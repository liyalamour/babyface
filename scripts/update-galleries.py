#!/usr/bin/env python3
"""Fetch gallery image URLs from babyfacetaiwan.com into data/galleries.json."""

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "galleries.json"

PAGES = {
    "newborn": "https://www.babyfacetaiwan.com/",
    "family": "https://www.babyfacetaiwan.com/familyphotography",
    "wedding": "https://www.babyfacetaiwan.com/weddingphotography",
}

PATTERN = re.compile(
    r"https://images\.squarespace-cdn\.com/content/v1/64e845c394bc54775d230d9f/"
    r"[a-f0-9-]+/[^\"<>?\s]+\.jpg",
    re.I,
)


def extract(url: str) -> list[str]:
    html = urllib.request.urlopen(url, timeout=30).read().decode("utf-8", errors="ignore")
    imgs = sorted(set(PATTERN.findall(html)))
    return [u for u in imgs if "logo" not in u.lower()]


def main() -> None:
    galleries = {key: extract(url) for key, url in PAGES.items()}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(galleries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for key, urls in galleries.items():
        print(f"{key}: {len(urls)} images")


if __name__ == "__main__":
    main()
