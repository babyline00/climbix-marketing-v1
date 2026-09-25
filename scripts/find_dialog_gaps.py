#!/usr/bin/env python3
"""Find DialogContent usages whose DialogHeader lacks DialogDescription."""
import re, glob

for path in glob.glob("src/components/**/*.tsx", recursive=True):
    src = open(path).read()
    for m in re.finditer(r"<DialogContent[^>]*>", src):
        start = m.end()
        window = src[start:start + 600]
        has_desc = "DialogDescription" in window.split("</DialogHeader>")[0] if "</DialogHeader>" in window else "DialogDescription" in window[:400]
        if not has_desc:
            line = src[:m.start()].count("\n") + 1
            print(f"{path}:{line}")
