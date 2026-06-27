import os
import re

base_dir = r"c:\WebsiteProject\LIAM BANDERAS STITCH\stitch_bilingual_flag_explorer"
stations = [d for d in os.listdir(base_dir) if d.startswith("estaci_n_de_pintura_") and os.path.isdir(os.path.join(base_dir, d))]

output_lines = []

for s in sorted(stations):
    code_path = os.path.join(base_dir, s, "code.html")
    if not os.path.exists(code_path):
        continue
        
    with open(code_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Find all script content
    scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
    if not scripts:
        scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', content, re.DOTALL)
        
    script_content = "\n".join(scripts)
    
    # Let's find functions in the script content
    funcs = re.findall(r'function\s+(\w+)\s*\(', script_content)
    
    # Find any click listeners or event handlers for check/finish buttons
    listeners = []
    finish_clicks = re.findall(r"document\.getElementById\(['\"](check-flag|finish-btn|check-btn|btn-check|btn-finish|checkWin|checkProgress)['\"]\)\.addEventListener\(['\"]click['\"]\s*,\s*(function.*?)\);", script_content, re.DOTALL)
    for fc in finish_clicks:
        listeners.append(fc)
        
    output_lines.append(f"STATION: {s}")
    output_lines.append(f"  Functions: {funcs}")
    
    # Look for functions containing check, win, complete, progress, success
    for fn in funcs:
        if any(w in fn.lower() for w in ["win", "flag", "progress", "result", "success", "completion", "check"]):
            # Extract function body
            match = re.search(r'function\s+' + fn + r'\b', script_content)
            if match:
                start = match.start()
                open_brace = script_content.find('{', start)
                if open_brace != -1:
                    brace_count = 1
                    idx = open_brace + 1
                    while brace_count > 0 and idx < len(script_content):
                        if script_content[idx] == '{':
                            brace_count += 1
                        elif script_content[idx] == '}':
                            brace_count -= 1
                        idx += 1
                    func_code = script_content[start:idx]
                    output_lines.append(f"  Function {fn} code:")
                    output_lines.append(func_code)
                    
    # Also search for click listener code
    for l_id, l_code in listeners:
        output_lines.append(f"  Listener for '{l_id}':")
        output_lines.append(l_code[:500])
        
    output_lines.append("="*50)

with open(os.path.join(base_dir, "_archive", "all_original_checks.txt") if os.path.exists(os.path.join(base_dir, "_archive")) else "all_original_checks.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

print("Completed analysis of check functions.")
