import os

replacements = {
    '#8B0000': '#2FA084',
    '#D1D1D1': '#E2E8F0',
    '#E8C6B0': '#F0F9F6'
}

def replace_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        # Also handle lowercase if any
        new_content = new_content.replace(old.lower(), new)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.css')):
            replace_in_file(os.path.join(root, file))
