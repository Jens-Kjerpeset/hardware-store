import os
import re

def remove_shadow_classes(directory):
    # Matches 'shadow', 'shadow-md', 'shadow-[...]', 'drop-shadow', 'drop-shadow-2xl', 'drop-shadow-[...]', 'hover:shadow-[...]'
    # We only want to remove the shadow part. If it has a prefix like hover:, it's better to remove the whole hover:shadow-... but wait,
    # \b matches the boundary before shadow if hover: is present. E.g. 'hover:shadow-md' -> '\bshadow-md' is matched, leaving 'hover:'.
    # So we should probably match optional standard tailwind pseudo-classes.
    # A robust regex for tailwind shadow classes:
    pattern = re.compile(r'\b(?:[a-z0-9\-]+:)?(?:drop-)?shadow(?:-[a-zA-Z0-9\[\]\._,\(\)\-\%]+)*\b')
    
    modified_count = 0
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if pattern.search(content):
                        # Replace the matched classes with empty string
                        new_content = pattern.sub('', content)
                        
                        # Write back if changes were made
                        if new_content != content:
                            with open(filepath, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            modified_count += 1
                            print(f"Stripped shadow classes from: {file}")
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")
                    
    print(f"Total files updated: {modified_count}")

remove_shadow_classes('/Users/jens/Documents/Antigravity/Home_Page/Hardware_store_v2/src')
