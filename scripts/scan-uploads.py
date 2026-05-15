#!/usr/bin/env python3
"""Scan uploads/newborn|family|wedding/ and write data/uploads-manifest.json."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UPLOADS = ROOT / "uploads"
OUT = ROOT / "data" / "uploads-manifest.json"

EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def scan_subdir(name: str) -> list[str]:
    folder = UPLOADS / name
    if not folder.is_dir():
        return []
    files = []
    for p in sorted(folder.iterdir()):
        if p.is_file() and p.suffix.lower() in EXT:
            # Paths relative to site root (GitHub Pages)
            files.append(f"uploads/{name}/{p.name}")
    return files


def main() -> None:
    manifest = {
        "newborn": scan_subdir("newborn"),
        "family": scan_subdir("family"),
        "wedding": scan_subdir("wedding"),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for key, paths in manifest.items():
        print(f"{key}: {len(paths)} image(s)")


if __name__ == "__main__":
    main()
