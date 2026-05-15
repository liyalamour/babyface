#!/usr/bin/env python3
"""Download gallery images locally from data/galleries.json."""

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "galleries.json"
OUT = ROOT / "assets" / "gallery"


def main() -> None:
    galleries = json.loads(DATA.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)

    for gallery, urls in galleries.items():
        dest_dir = OUT / gallery
        dest_dir.mkdir(parents=True, exist_ok=True)
        for i, url in enumerate(urls):
            name = url.rsplit("/", 1)[-1].split("?")[0]
            dest = dest_dir / name
            if dest.exists():
                continue
            print(f"Downloading {gallery}/{name}")
            urllib.request.urlretrieve(url, dest)

    print("Done. Images saved to assets/gallery/")


if __name__ == "__main__":
    main()
