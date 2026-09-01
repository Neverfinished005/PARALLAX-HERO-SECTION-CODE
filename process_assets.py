import os
import shutil
from PIL import Image, ImageFilter
import numpy as np

src_dir = r"C:\Users\ADMIN\.gemini\antigravity-ide\brain\9757e623-f2ef-4a40-8024-9d01dba40988"
dest_dir = r"c:\Users\ADMIN\Downloads\demo\assets"
os.makedirs(dest_dir, exist_ok=True)

# Copy base images
shutil.copy(os.path.join(src_dir, "hero_bg_1788198973610.jpg"), os.path.join(dest_dir, "hero_bg.jpg"))
shutil.copy(os.path.join(src_dir, "treasure_map_1788199060602.jpg"), os.path.join(dest_dir, "treasure_map.jpg"))
shutil.copy(os.path.join(src_dir, "galleon_cavern_1788199236676.jpg"), os.path.join(dest_dir, "galleon_cavern.jpg"))
shutil.copy(os.path.join(src_dir, "cast_chunk_1788199171944.jpg"), os.path.join(dest_dir, "cast_chunk.jpg"))
shutil.copy(os.path.join(src_dir, "cast_data_1788199190749.jpg"), os.path.join(dest_dir, "cast_data.jpg"))
shutil.copy(os.path.join(src_dir, "cast_mouth_1788199211358.jpg"), os.path.join(dest_dir, "cast_mouth.jpg"))
shutil.copy(os.path.join(src_dir, "hero_char_1788198992226.jpg"), os.path.join(dest_dir, "hero_char_raw.jpg"))

def extract_black_bg(img_path, out_path, lum_threshold=15, feather=1.2):
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    brightness = np.maximum(r, np.maximum(g, b))
    alpha = np.clip((brightness - lum_threshold) / (lum_threshold * 2.2), 0, 1) * 255.0
    mask_img = Image.fromarray(alpha.astype(np.uint8), mode='L')
    if feather > 0:
        mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=feather))
    img.putalpha(mask_img)
    img.save(out_path, "PNG")
    print(f"Extracted {out_path}")

# Props
extract_black_bg(os.path.join(src_dir, "pirate_key_1788199008828.jpg"), os.path.join(dest_dir, "pirate_key.png"), lum_threshold=14, feather=1)
extract_black_bg(os.path.join(src_dir, "gold_doubloon_1788199025924.jpg"), os.path.join(dest_dir, "gold_doubloon.png"), lum_threshold=12, feather=1)
extract_black_bg(os.path.join(src_dir, "skull_talisman_1788199041943.jpg"), os.path.join(dest_dir, "skull_talisman.png"), lum_threshold=14, feather=1)
extract_black_bg(os.path.join(src_dir, "compass_prop_1788199118958.jpg"), os.path.join(dest_dir, "compass.png"), lum_threshold=14, feather=1)

# Hero character cutout
def extract_hero(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    max_c = np.maximum(r, np.maximum(g, b))
    # Threshold dark studio backdrop
    alpha = np.clip((max_c - 14) / 24.0, 0, 1) * 255.0
    mask_img = Image.fromarray(alpha.astype(np.uint8), mode='L')
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=1.0))
    img.putalpha(mask_img)
    img.save(out_path, "PNG")
    print(f"Extracted hero character to {out_path}")

extract_hero(os.path.join(src_dir, "hero_char_1788198992226.jpg"), os.path.join(dest_dir, "hero_char.png"))
print("All assets updated successfully.")
