import os
import re

def analyze_buttons(directory):
    # Regex to match the opening of a button tag and capture its attributes
    button_pattern = re.compile(r'<button([^>]*)>', re.IGNORECASE | re.DOTALL)
    
    total = 0
    missing = 0
    offenders = []
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    matches = button_pattern.findall(content)
                    total += len(matches)
                    
                    for match in matches:
                        # Normalize whitespace
                        attrs = " ".join(match.split())
                        # Check if it has onClick or type="submit"
                        if 'onClick=' not in attrs and 'type="submit"' not in attrs and 'type=\'submit\'' not in attrs:
                            missing += 1
                            offenders.append(file)
                except Exception as e:
                    pass
                    
    print(f"Total buttons found: {total}")
    print(f"Buttons missing handlers/submit: {missing}")
    
    from collections import Counter
    counts = Counter(offenders)
    print("Top offending files:")
    for file, count in counts.most_common():
        print(f"  {file}: {count}")

analyze_buttons('/Users/jens/Documents/Antigravity/Home_Page/Hardware_store_v2/src')
