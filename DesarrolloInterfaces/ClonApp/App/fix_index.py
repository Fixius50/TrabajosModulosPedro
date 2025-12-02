
import os

file_path = r'c:\Users\rober\Desktop\TrabajosModulosPedro\DesarrolloInterfaces\ClonApp\App\index2.html'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1-indexed lines to keep: 1-498, and 694-end.
# 0-indexed: 0-498 (exclusive of 498? No, 0 to 497 inclusive).
# Python slicing: lines[:498] gives 0 to 497.
# lines[693:] gives 693 to end. (Line 694 is index 693).

new_lines = lines[:498] + lines[693:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed file. Original lines: {len(lines)}, New lines: {len(new_lines)}")
