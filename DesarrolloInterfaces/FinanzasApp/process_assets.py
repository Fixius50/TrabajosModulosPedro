import os
import shutil

BASE_DIR = r"C:\Users\rober\Desktop\TrabajosModulosPedro\DesarrolloInterfaces\FinanzasApp"
SOURCE_DIR = os.path.join(BASE_DIR, "Docs", "Image")
DEST_IMG_DIR = os.path.join(BASE_DIR, "resources", "frontend", "images")
DEST_CODE_FILE = os.path.join(BASE_DIR, "Docs", "Reference_Code_Merged.html")

print(f"Processing from: {SOURCE_DIR}")
print(f"Images to: {DEST_IMG_DIR}")
print(f"Code to: {DEST_CODE_FILE}")

# Ensure destination exists
os.makedirs(DEST_IMG_DIR, exist_ok=True)

merged_code = []

# Iterate over immediate subdirectories
try:
    subdirs = [d for d in os.listdir(SOURCE_DIR) if os.path.isdir(os.path.join(SOURCE_DIR, d))]
    
    for subdir in subdirs:
        subdir_path = os.path.join(SOURCE_DIR, subdir)
        
        # 1. Process Image (screen.png)
        img_src = os.path.join(subdir_path, "screen.png")
        if os.path.exists(img_src):
            img_name = f"{subdir}.png"
            img_dest = os.path.join(DEST_IMG_DIR, img_name)
            shutil.copy2(img_src, img_dest)
            print(f"[IMG] Processed: {img_name}")
        else:
            print(f"[IMG] Missing screen.png in {subdir}")

        # 2. Process Code (code.html)
        code_src = os.path.join(subdir_path, "code.html")
        if os.path.exists(code_src):
            try:
                with open(code_src, "r", encoding="utf-8") as f:
                    content = f.read()
                    merged_code.append(f"<!-- ========================================= -->")
                    merged_code.append(f"<!-- SOURCE: {subdir} -->")
                    merged_code.append(f"<!-- ========================================= -->")
                    merged_code.append(content)
                    merged_code.append("\n\n")
                    print(f"[CODE] Merged code.html from {subdir}")
            except Exception as e:
                 print(f"[CODE] Error reading {code_src}: {e}")
        else:
            print(f"[CODE] Missing code.html in {subdir}")

    # Write merged code
    with open(DEST_CODE_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(merged_code))
    print("Code merge complete.")

except Exception as e:
    print(f"Critical Error: {e}")
