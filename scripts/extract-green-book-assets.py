#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from typing import Final

try:
    from PIL import Image
    from pypdf import PdfReader
except ModuleNotFoundError as exc:
    raise SystemExit(
        "This one-time extractor requires pypdf and Pillow. "
        "Run it with C:\\Users\\adams\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe "
        "if your system Python does not have those packages."
    ) from exc


PDF_NAME: Final = "TP600-4 The Soldiers Green Book_Aug 2025.pdf"
OUTPUT_DIR: Final = Path("public") / "ranks"

# PDF page numbers are the document page numbers shown in the source plan.
# Image indexes are pypdf's per-page `page.images` indexes.
RANK_IMAGES: Final = [
    (94, 0, "rank-pv2.png"),
    (94, 1, "rank-pfc.png"),
    (94, 2, "rank-spc.png"),
    (95, 0, "rank-cpl.png"),
    (95, 1, "rank-sgt.png"),
    (95, 2, "rank-ssg.png"),
    (95, 3, "rank-sfc.png"),
    (96, 0, "rank-msg.png"),
    (96, 1, "rank-1sg.png"),
    (96, 2, "rank-sgm.png"),
    (96, 3, "rank-csm.png"),
    (96, 4, "rank-sma.png"),
    (97, 0, "rank-wo1.png"),
    (97, 4, "rank-cw2.png"),
    (97, 1, "rank-cw3.png"),
    (97, 2, "rank-cw4.png"),
    (97, 3, "rank-cw5.png"),
    (98, 0, "rank-2lt.png"),
    (98, 2, "rank-1lt.png"),
    (98, 1, "rank-cpt.png"),
    (98, 3, "rank-maj.png"),
    (99, 0, "rank-ltc.png"),
    (99, 2, "rank-col.png"),
    (99, 3, "rank-bg.png"),
    (99, 4, "rank-mg.png"),
    (99, 1, "rank-ltg.png"),
    (99, 5, "rank-gen.png"),
]

SKIPPED_IMAGES: Final = {
    (94, 3): "red star marker, not a rank insignia",
}


def extract_rank_images() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    pdf_path = repo_root / PDF_NAME
    output_dir = repo_root / OUTPUT_DIR

    if not pdf_path.exists():
        raise FileNotFoundError(f"Missing source PDF: {pdf_path}")

    output_dir.mkdir(parents=True, exist_ok=True)
    reader = PdfReader(str(pdf_path))

    for page_number, image_index in SKIPPED_IMAGES:
        page = reader.pages[page_number - 1]
        if image_index >= len(page.images):
            raise IndexError(f"Expected image {image_index} on PDF page {page_number}")

    for page_number, image_index, filename in RANK_IMAGES:
        page = reader.pages[page_number - 1]
        if image_index >= len(page.images):
            raise IndexError(f"Expected image {image_index} on PDF page {page_number}")

        source_image = page.images[image_index].image
        source_image.load()
        image = source_image.copy()

        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA")

        output_path = output_dir / filename
        image.save(output_path, format="PNG", optimize=True)
        print(f"extracted PDF page {page_number} image {image_index} -> {output_path.relative_to(repo_root)}")

    for (page_number, image_index), reason in SKIPPED_IMAGES.items():
        print(f"skipped PDF page {page_number} image {image_index}: {reason}")


if __name__ == "__main__":
    extract_rank_images()
