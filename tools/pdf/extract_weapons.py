import io, json, re
import pdfplumber

PDF = r"C:\Users\evgeniy\Desktop\work\witcher-rules\Witcher.pdf"
OUT = r"C:\Users\evgeniy\Desktop\work\witcher-rules\_artifacts\pdf\weapons_table_draft.json"

CATEGORIES = {"Мечи", "Лёгкие клинки", "Топоры", "Дробящее", "Древковое", "Посохи", "Метательное", "Луки", "Арбалеты"}

def clean(s):
    s = re.sub(r"\s+", " ", s).strip()
    s = s.replace("xl", "x1").replace("х1", "x1").replace("х2", "x2").replace("х3", "x3")
    s = s.replace("ld6", "1d6").replace("1Д6", "1d6").replace("ldlO", "1d10").replace("IdlO", "1d10")
    s = re.sub(r"(\d)\s*[ЛL]\s*6", r"\1d6", s)
    return s

def page_words(page):
    return page.extract_words(use_text_flow=False, keep_blank_chars=False)

def group_lines(words, tol=6):
    words = sorted(words, key=lambda w: (w["top"], w["x0"]))
    lines = []
    for w in words:
        placed = False
        for line in lines:
            if abs(line["top"] - w["top"]) <= tol:
                line["words"].append(w)
                line["top"] = (line["top"] + w["top"]) / 2
                placed = True
                break
        if not placed:
            lines.append({"top": w["top"], "words": [w]})
    for line in lines:
        line["words"].sort(key=lambda w: w["x0"])
    return sorted(lines, key=lambda l: l["top"])

def find_header(lines):
    for line in lines:
        text = " ".join(w["text"] for w in line["words"])
        if "Название" in text and "Тип" in text and "Цена" in text:
            return line
    return None

def build_columns(header, page):
    labels = ["Название", "Тип", "т", "Дос", "У", "H", "X", "Дис", "Эффект", "Скр", "Ус", "Вес", "Цена"]
    positions = []
    for label in labels:
        found = None
        for w in header["words"]:
            if w["text"].strip().lower() == label.lower():
                found = w["x0"]
                break
        if found is None:
            # fallback: find by first char for single-letter headers
            for w in header["words"]:
                if w["text"].strip().lower().startswith(label.lower()):
                    found = w["x0"]
                    break
        positions.append(found)
    if any(p is None for p in positions):
        return None, positions
    bounds = [20]
    for x in positions[1:]:
        bounds.append(x - 5)
    bounds.append(page.width - 20)
    return bounds, positions

def assign(line, bounds, ncols):
    cells = [""] * ncols
    for w in line["words"]:
        center = (w["x0"] + w["x1"]) / 2
        idx = ncols - 1
        for i in range(ncols - 1):
            if center < bounds[i + 1]:
                idx = i
                break
        cells[idx] = (cells[idx] + " " + w["text"]).strip()
    return [clean(c) for c in cells]

items = []
with pdfplumber.open(PDF) as pdf:
    for page_no in range(73, 78):
        page = pdf.pages[page_no - 1]
        words = page_words(page)
        lines = group_lines(words)
        header = find_header(lines)
        if not header:
            print("NO HEADER", page_no)
            continue
        bounds, positions = build_columns(header, page)
        if not bounds:
            print("NO COLUMNS", page_no, positions)
            continue
        current_category = ""
        pending = ""
        current = None
        for line in lines:
            if line["top"] <= header["top"] + 2:
                continue
            text = " ".join(w["text"] for w in line["words"])
            if "Боеприпасы" in text or ("Название" in text and "Цена" in text and line is not header):
                break
            cells = assign(line, bounds, len(bounds) - 1)
            name = cells[0]
            rest = cells[1:]
            if not name:
                if current:
                    for i, c in enumerate(cells):
                        if c:
                            current["cells"][i] = (current["cells"][i] + " " + c).strip()
                continue
            if not any(rest):
                if name in CATEGORIES:
                    current_category = name
                    pending = ""
                else:
                    pending = (pending + " " + name).strip()
                continue
            full_name = (pending + " " + name).strip()
            pending = ""
            current = {
                "category": current_category,
                "cells": [full_name] + rest,
                "sourcePage": page_no
            }
            items.append(current)

# keep rows with a price-like last cell
clean_items = []
for item in items:
    cells = item["cells"]
    if len(cells) < 13:
        continue
    price = cells[12]
    if not re.search(r"\d", price):
        continue
    clean_items.append({
        "category": item["category"],
        "name": cells[0],
        "type": cells[1],
        "accuracy": cells[2],
        "availability": cells[3],
        "damage": cells[4],
        "reliability": cells[5],
        "hands": cells[6],
        "range": cells[7],
        "effects": cells[8],
        "concealment": cells[9],
        "upgradeSlots": cells[10],
        "weight": cells[11],
        "price": price,
        "sourcePage": item["sourcePage"]
    })

with io.open(OUT, "w", encoding="utf-8") as f:
    json.dump(clean_items, f, ensure_ascii=False, indent=2)
print("items", len(clean_items))
for item in clean_items[:10]:
    print(item)
