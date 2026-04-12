import os
import re

def find_long_classnames(directory):
    pattern = re.compile(r'className=["\'`]([^"\'`]{150,})["\'`]')
    
    count = 0
    longest = 0
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        
                    for i, line in enumerate(lines):
                        match = pattern.search(line)
                        if match:
                            length = len(match.group(1))
                            if length > longest:
                                longest = length
                            if length > 250:
                                print(f"{file}:{i+1} ({length} chars) -> {match.group(1)[:50]}...")
                            count += 1
                except:
                    pass
                    
    print(f"\nTotal instances of 150+ chars: {count}")
    print(f"Longest className: {longest} chars")

find_long_classnames('/Users/jens/Documents/Antigravity/Home_Page/Hardware_store_v2/src')
