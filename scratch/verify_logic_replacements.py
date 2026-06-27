import os

base_dir = r"c:\WebsiteProject\LIAM BANDERAS STITCH\stitch_bilingual_flag_explorer"
stations = [d for d in os.listdir(base_dir) if d.startswith("estaci_n_de_pintura_") and os.path.isdir(os.path.join(base_dir, d))]

failed = []

for s in sorted(stations):
    html_path = os.path.join(base_dir, s, "index.html")
    if not os.path.exists(html_path):
        continue
        
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    if "compareColor" not in content:
        failed.append(f"{s}: missing compareColor function")
        
    if "function checkCompletion()" not in content:
        failed.append(f"{s}: missing checkCompletion function")
        
    if "[id^=\"part-\"]" in content and s not in ["estaci_n_de_pintura_noruega_1", "estaci_n_de_pintura_noruega_2"]:
        # Ensure the generic query selector parts have been replaced for most pages
        # (Generic had: const parts = document.querySelectorAll('#flag-canvas [id^="part-"]...))
        # Norway 1/2 actually use part-red etc so it might be fine, but let's check
        if "const parts = document.querySelectorAll" in content:
            failed.append(f"{s}: still has generic parts selector")

if failed:
    print(f"Verification FAILED with {len(failed)} issues:")
    for f in failed:
        print(f"  {f}")
else:
    print("Verification PASSED! All updated stations have custom checkCompletion and compareColor functions correctly configured.")
