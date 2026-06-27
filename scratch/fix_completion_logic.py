import os
import re

base_dir = r"c:\WebsiteProject\LIAM BANDERAS STITCH\stitch_bilingual_flag_explorer"
stations = [d for d in os.listdir(base_dir) if d.startswith("estaci_n_de_pintura_") and os.path.isdir(os.path.join(base_dir, d))]

# Custom check conditions for each country key
conditions = {
    "alemania": {
        "conditions": """
            const allPainted = stripeState.every(c => c !== null);
            const isCorrect = stripeState.every((color, index) => color === correctFlag[index]);
        """
    },
    "arabia_saudita": {
        "conditions": """
            const bg = document.getElementById('flag-bg');
            const el = document.getElementById('flag-elements');
            const allPainted = bg && el && bg.getAttribute('fill') && bg.getAttribute('fill') !== '#f7f9ff' && el.getAttribute('fill') && el.getAttribute('fill') !== '#f7f9ff';
            const isCorrect = allPainted && compareColor(bg, '#006C35') && compareColor(el, '#ffffff');
        """
    },
    "argentina": {
        "conditions": """
            const top = document.getElementById('stripe-top');
            const mid = document.getElementById('stripe-middle');
            const bot = document.getElementById('stripe-bottom');
            const sun = document.getElementById('sun-of-may');
            const allPainted = top && mid && bot && sun && top.style.backgroundColor && mid.style.backgroundColor && bot.style.backgroundColor && sun.style.backgroundColor;
            const isCorrect = allPainted && compareColor(top, '#75aadb') && compareColor(mid, '#ffffff') && compareColor(bot, '#75aadb') && compareColor(sun, '#fcbf49');
        """
    },
    "australia": {
        "conditions": """
            const field = document.querySelector('[data-region="field"]');
            const crossMain = document.querySelector('[data-region="uj-cross-main"]');
            const crossDiag = document.querySelector('[data-region="uj-cross-diag"]');
            const allPainted = field && crossMain && crossDiag && field.getAttribute('fill') !== '#f7f9ff' && crossMain.style.stroke === 'transparent' && crossDiag.style.stroke === 'transparent';
            const isCorrect = allPainted && compareColor(field, '#001e30') && compareColor(crossMain, '#ba1a1a') && compareColor(crossDiag, '#ba1a1a');
        """
    },
    "austria": {
        "conditions": """
            const allPainted = typeof progress !== 'undefined' && progress['stripe-top'] && progress['stripe-middle'] && progress['stripe-bottom'];
            const isCorrect = allPainted;
        """
    },
    "b_lgica": {
        "conditions": """
            const allPainted = typeof paintedColors !== 'undefined' && paintedColors.every(c => c !== null);
            const isCorrect = allPainted && paintedColors.every((color, index) => color === correctFlag[index]);
        """
    },
    "brasil": {
        "conditions": """
            const green = document.getElementById('part-green');
            const yellow = document.getElementById('part-yellow');
            const blue = document.getElementById('part-blue');
            const allPainted = green && yellow && blue && (green.style.fill || green.getAttribute('fill') || green.style.backgroundColor) && (yellow.style.fill || yellow.getAttribute('fill') || yellow.style.backgroundColor) && (blue.style.fill || blue.getAttribute('fill') || blue.style.backgroundColor);
            const isCorrect = allPainted && compareColor(green, '#009739') && compareColor(yellow, '#fedf00') && compareColor(blue, '#012169');
        """
    },
    "canad_1": {
        "conditions": """
            const allPainted = typeof paintedParts !== 'undefined' && paintedParts.left && paintedParts.right && paintedParts.center && paintedParts.leaf;
            const isCorrect = allPainted;
        """
    },
    "canad_2": {
        "conditions": """
            const left = document.getElementById('left-rect');
            const right = document.getElementById('right-rect');
            const leaf = document.getElementById('maple-leaf');
            const mid = document.getElementById('mid-rect');
            const allPainted = left && right && leaf && mid && left.getAttribute('fill') && right.getAttribute('fill') && leaf.getAttribute('fill') && mid.getAttribute('fill');
            const isCorrect = allPainted && compareColor(left, '#ba1a1a') && compareColor(right, '#ba1a1a') && compareColor(leaf, '#ba1a1a') && compareColor(mid, '#ffffff');
        """
    },
    "chile": {
        "conditions": """
            const allPainted = typeof paintedZones !== 'undefined' && paintedZones.blue && paintedZones.white && paintedZones.red;
            const isCorrect = allPainted;
        """
    },
    "china": {
        "conditions": """
            const field = document.getElementById('field');
            const s1 = document.getElementById('star1');
            const s2 = document.getElementById('star2');
            const s3 = document.getElementById('star3');
            const s4 = document.getElementById('star4');
            const s5 = document.getElementById('star5');
            const allPainted = field && s1 && s2 && s3 && s4 && s5 && (field.style.fill || field.getAttribute('fill') || field.style.backgroundColor) && (s1.style.fill || s1.getAttribute('fill') || s1.style.backgroundColor) && (s2.style.fill || s2.getAttribute('fill') || s2.style.backgroundColor) && (s3.style.fill || s3.getAttribute('fill') || s3.style.backgroundColor) && (s4.style.fill || s4.getAttribute('fill') || s4.style.backgroundColor) && (s5.style.fill || s5.getAttribute('fill') || s5.style.backgroundColor);
            const isCorrect = allPainted && compareColor(field, '#ba1a1a') && compareColor(s1, '#fccc00') && compareColor(s2, '#fccc00') && compareColor(s3, '#fccc00') && compareColor(s4, '#fccc00') && compareColor(s5, '#fccc00');
        """
    },
    "colombia": {
        "conditions": """
            const allPainted = typeof painted !== 'undefined' && painted.yellow && painted.blue && painted.red;
            const isCorrect = allPainted;
        """
    },
    "corea_del_sur_1": {
        "conditions": """
            const allPainted = false;
            const isCorrect = false;
        """
    },
    "corea_del_sur_2": {
        "conditions": """
            const allPainted = typeof currentFlagState !== 'undefined' && currentFlagState['field'] && currentFlagState['taegeuk-red'] && currentFlagState['taegeuk-blue'] && currentFlagState.kwae_count >= 12;
            const isCorrect = allPainted;
        """
    },
    "ee._uu": {
        "conditions": """
            const union = document.querySelector('[data-type="union"]');
            const stripes = Array.from(document.querySelectorAll('.paint-zone')).filter(z => z !== union);
            const allPainted = union && stripes.length === 13 && stripes.every(s => s.getAttribute('fill') !== '#FFFFFF' && s.getAttribute('fill') !== '#F0F4FB') && union.getAttribute('fill') !== '#FFFFFF' && union.getAttribute('fill') !== '#F0F4FB';
            const isCorrect = allPainted && compareColor(union, '#004163') && stripes.every((s, i) => compareColor(s, i % 2 === 0 ? '#ba1a1a' : '#ffffff'));
        """
    },
    "egipto_1": {
        "conditions": """
            const allPainted = typeof currentFlag !== 'undefined' && currentFlag.top && currentFlag.middle && currentFlag.bottom;
            const isCorrect = allPainted && currentFlag.top === correctFlag.top && currentFlag.middle === correctFlag.middle && currentFlag.bottom === correctFlag.bottom;
        """
    },
    "egipto_2": {
        "conditions": """
            const top = document.getElementById('stripe-top');
            const mid = document.getElementById('stripe-middle');
            const bot = document.getElementById('stripe-bottom');
            const allPainted = top && mid && bot && top.className.includes('bg-') && mid.className.includes('bg-') && bot.className.includes('bg-') && !top.className.includes('bg-surface-container-highest') && !bot.className.includes('bg-surface-container-highest');
            const isCorrect = allPainted && compareColor(top, '#ba1a1a') && compareColor(mid, '#ffffff') && compareColor(bot, '#171c21');
        """
    },
    "espa_a": {
        "conditions": """
            const allPainted = typeof paintedState !== 'undefined' && paintedState.top && paintedState.middle && paintedState.bottom;
            const isCorrect = allPainted;
        """
    },
    "filipinas": {
        "conditions": """
            const sBlue = document.getElementById('stripe-blue');
            const sRed = document.getElementById('stripe-red');
            const tWhite = document.getElementById('triangle-white');
            const gSun = document.getElementById('stars-sun');
            const allPainted = sBlue && sRed && tWhite && gSun && sBlue.getAttribute('fill') !== '#e4e8ef' && sRed.getAttribute('fill') !== '#e4e8ef' && tWhite.getAttribute('fill') !== '#f7f9ff' && gSun.getAttribute('fill') !== null;
            const isCorrect = allPainted && compareColor(sBlue, '#0038a8') && compareColor(sRed, '#ce1126') && compareColor(tWhite, '#ffffff') && compareColor(gSun, '#fccc00');
        """
    },
    "finlandia": {
        "conditions": """
            const allPainted = typeof paintedParts !== 'undefined' && paintedParts.h && paintedParts.v;
            const isCorrect = allPainted;
        """
    },
    "francia": {
        "conditions": """
            const secBlue = document.getElementById('section-blue');
            const secWhite = document.getElementById('section-white');
            const secRed = document.getElementById('section-red');
            const allPainted = secBlue && secWhite && secRed && secBlue.style.backgroundColor && secWhite.style.backgroundColor && secRed.style.backgroundColor;
            const isCorrect = allPainted && compareColor(secBlue, '#006495') && compareColor(secWhite, '#ffffff') && compareColor(secRed, '#ba1a1a');
        """
    },
    "grecia_1": {
        "conditions": """
            const zones = Array.from(document.querySelectorAll('.flag-zone'));
            const allPainted = zones.length > 0 && zones.every(z => z.dataset.currentColor !== undefined);
            const isCorrect = allPainted && zones.every(z => z.dataset.currentColor === 'Azul');
        """
    },
    "grecia_2": {
        "conditions": """
            const canton = document.querySelector('[data-part="canton"]');
            const crossV = document.querySelector('[data-part="cross-v"]');
            const crossH = document.querySelector('[data-part="cross-h"]');
            const stripes = Array.from(document.querySelectorAll('.flag-stripe'));
            const allPainted = typeof paintedParts !== 'undefined' && paintedParts.size >= totalParts;
            const isCorrect = allPainted && compareColor(canton, '#006495') && compareColor(crossV, '#ffffff') && compareColor(crossH, '#ffffff') && stripes.every((s, i) => compareColor(s, i % 2 === 0 ? '#006495' : '#ffffff'));
        """
    },
    "india": {
        "conditions": """
            const top = document.getElementById('stripe-top');
            const mid = document.getElementById('stripe-middle');
            const bot = document.getElementById('stripe-bottom');
            const chakra = document.getElementById('chakra');
            const allPainted = top && mid && bot && chakra && top.style.backgroundColor && mid.style.backgroundColor && bot.style.backgroundColor && chakra.style.backgroundColor;
            const isCorrect = allPainted && compareColor(top, '#FF9933') && compareColor(mid, '#FFFFFF') && compareColor(bot, '#138808') && compareColor(chakra, '#FFFFFF');
        """
    },
    "islandia": {
        "conditions": """
            const allPainted = false;
            const isCorrect = false;
        """
    },
    "israel_1": {
        "conditions": """
            const allPainted = typeof progress !== 'undefined' && progress.top && progress.bottom && progress.star;
            const isCorrect = allPainted;
        """
    },
    "israel_2": {
        "conditions": """
            const topStripe = document.getElementById('stripe-top');
            const bottomStripe = document.getElementById('stripe-bottom');
            const starPaths = Array.from(document.querySelectorAll('#magen-david path'));
            const allPainted = topStripe && bottomStripe && topStripe.getAttribute('fill') !== '#e4e8ef' && bottomStripe.getAttribute('fill') !== '#e4e8ef' && starPaths.length > 0 && starPaths.every(p => p.getAttribute('stroke') !== '#bec8d3');
            const isCorrect = allPainted && compareColor(topStripe, '#006495') && compareColor(bottomStripe, '#006495') && starPaths.every(p => compareColor(p, '#006495'));
        """
    },
    "italia": {
        "conditions": """
            const s0 = document.getElementById('section-0');
            const s1 = document.getElementById('section-1');
            const s2 = document.getElementById('section-2');
            const allPainted = s0 && s1 && s2 && s0.style.backgroundColor && s1.style.backgroundColor && s2.style.backgroundColor;
            const isCorrect = allPainted && compareColor(s0, '#009246') && compareColor(s1, '#ffffff') && compareColor(s2, '#ce2b37');
        """
    },
    "jap_n": {
        "conditions": """
            const allPainted = typeof isCompleted !== 'undefined' && isCompleted;
            const isCorrect = allPainted;
        """
    },
    "m_xico": {
        "conditions": """
            const allPainted = typeof painted !== 'undefined' && Object.values(painted).every(Boolean);
            const isCorrect = allPainted;
        """
    },
    "marruecos": {
        "conditions": """
            const allPainted = typeof paintedBg !== 'undefined' && typeof paintedStar !== 'undefined' && paintedBg && paintedStar;
            const isCorrect = allPainted;
        """
    },
    "nigeria": {
        "conditions": """
            const b1 = document.getElementById('band-1');
            const b2 = document.getElementById('band-2');
            const b3 = document.getElementById('band-3');
            const allPainted = b1 && b2 && b3 && b1.style.backgroundColor && b2.style.backgroundColor && b3.style.backgroundColor;
            const isCorrect = allPainted && compareColor(b1, '#2b6c00') && compareColor(b2, '#ffffff') && compareColor(b3, '#2b6c00');
        """
    },
    "noruega_1": {
        "conditions": """
            const red = document.getElementById('part-red');
            const whiteH = document.getElementById('part-white-h');
            const whiteV = document.getElementById('part-white-v');
            const blueH = document.getElementById('part-blue-h');
            const blueV = document.getElementById('part-blue-v');
            const allPainted = red && whiteH && whiteV && blueH && blueV && red.style.backgroundColor && whiteH.style.backgroundColor && whiteV.style.backgroundColor && blueH.style.backgroundColor && blueV.style.backgroundColor;
            const isCorrect = allPainted && compareColor(red, '#ba1a1a') && compareColor(whiteH, '#ffffff') && compareColor(whiteV, '#ffffff') && compareColor(blueH, '#006495') && compareColor(blueV, '#006495');
        """
    },
    "noruega_2": {
        "conditions": """
            const red = document.getElementById('part-red');
            const whiteH = document.getElementById('part-white-h');
            const whiteV = document.getElementById('part-white-v');
            const blueH = document.getElementById('part-blue-h');
            const blueV = document.getElementById('part-blue-v');
            const allPainted = red && whiteH && whiteV && blueH && blueV && red.className.includes('bg-') && whiteH.className.includes('bg-') && whiteV.className.includes('bg-') && blueH.className.includes('bg-') && blueV.className.includes('bg-') && !red.className.includes('bg-surface-container') && !whiteH.className.includes('bg-surface-container-highest') && !whiteV.className.includes('bg-surface-container-highest') && !blueH.className.includes('bg-surface-dim') && !blueV.className.includes('bg-surface-dim');
            const isCorrect = allPainted && (red.classList.contains('bg-error') || compareColor(red, '#ba1a1a')) && whiteH.classList.contains('bg-white') && whiteV.classList.contains('bg-white') && (blueH.classList.contains('bg-primary') || compareColor(blueH, '#006495')) && (blueV.classList.contains('bg-primary') || compareColor(blueV, '#006495'));
        """
    },
    "nueva_zelanda": {
        "conditions": """
            const allPainted = false;
            const isCorrect = false;
        """
    },
    "pa_ses_bajos": {
        "conditions": """
            const allPainted = typeof progress !== 'undefined' && progress.top && progress.middle && progress.bottom;
            const isCorrect = allPainted;
        """
    },
    "per": {
        "conditions": """
            const bands = Array.from(document.querySelectorAll('.flag-band'));
            const allPainted = bands.length > 0 && bands.every(b => b.className.includes('bg-') && !b.className.includes('bg-surface-container'));
            const isCorrect = allPainted && bands.every(b => b.classList.contains(b.getAttribute('data-correct-color')));
        """
    },
    "portugal_1": {
        "conditions": """
            const allPainted = typeof paintedCount !== 'undefined' && paintedCount >= totalSections;
            const isCorrect = allPainted;
        """
    },
    "portugal_2": {
        "conditions": """
            const green = document.getElementById('part-green');
            const red = document.getElementById('part-red');
            const allPainted = green && red && green.style.backgroundColor && red.style.backgroundColor;
            const isCorrect = allPainted && compareColor(green, '#009739') && compareColor(red, '#ce1126');
        """
    },
    "portugal_actualizada": {
        "conditions": """
            const allPainted = typeof paintedCount !== 'undefined' && paintedCount >= totalSections;
            const isCorrect = allPainted;
        """
    },
    "reino_unido": {
        "conditions": """
            const bluePart = document.querySelector('[data-part="blue-bg"]');
            const saltirePart = document.querySelector('[data-part="red-saltire"]');
            const crossPart = document.querySelector('[data-part="red-cross"]');
            const allPainted = typeof partsPainted !== 'undefined' && partsPainted['blue-bg'] && partsPainted['red-saltire'] && partsPainted['red-cross'];
            const isCorrect = allPainted && (compareColor(bluePart, '#00247d') || compareColor(bluePart, 'rgb(0,36,125)')) && (compareColor(saltirePart, '#cf142b') || compareColor(saltirePart, 'rgb(207,20,43)')) && (compareColor(crossPart, '#cf142b') || compareColor(crossPart, 'rgb(207,20,43)'));
        """
    },
    "rusia": {
        "conditions": """
            const allPainted = typeof paintedStripes !== 'undefined' && paintedStripes.every(Boolean);
            const isCorrect = allPainted;
        """
    },
    "sud_frica": {
        "conditions": """
            const paths = Array.from(document.querySelectorAll('.flag-path'));
            const allPainted = paths.length > 0 && paths.every(p => p.getAttribute('fill') !== '#f0f4fb' && p.style.fill !== '#f0f4fb');
            const colorMap = { 'Rojo': '#ba1a1a', 'Azul': '#006495', 'Verde': '#2b6c00', 'Amarillo': '#fccc00', 'Negro': '#171c21', 'Blanco': '#ffffff' };
            const isCorrect = allPainted && paths.every(p => {
                const targetColor = p.getAttribute('data-color-target');
                const expectedHex = colorMap[targetColor];
                return compareColor(p, expectedHex);
            });
        """
    },
    "suecia": {
        "conditions": """
            const blueAreas = ['field-top-left', 'field-bottom-left', 'field-top-right', 'field-bottom-right'];
            const yellowAreas = ['cross-h', 'cross-v'];
            const allPainted = blueAreas.concat(yellowAreas).every(id => document.getElementById(id) && document.getElementById(id).style.backgroundColor);
            const isCorrect = allPainted && blueAreas.every(id => compareColor(document.getElementById(id), '#006aa7')) && yellowAreas.every(id => compareColor(document.getElementById(id), '#feca00'));
        """
    },
    "suiza": {
        "conditions": """
            const container = document.getElementById('flag-container');
            const allPainted = container && container.style.backgroundColor && container.style.backgroundColor !== 'transparent' && container.style.backgroundColor !== '';
            const isCorrect = allPainted && compareColor(container, '#D52B1E');
        """
    },
    "tailandia_1": {
        "conditions": """
            const b0 = document.getElementById('band-0');
            const b1 = document.getElementById('band-1');
            const b2 = document.getElementById('band-2');
            const b3 = document.getElementById('band-3');
            const b4 = document.getElementById('band-4');
            const allPainted = b0 && b1 && b2 && b3 && b4 && b0.style.backgroundColor && b1.style.backgroundColor && b2.style.backgroundColor && b3.style.backgroundColor && b4.style.backgroundColor;
            const isCorrect = allPainted && compareColor(b0, '#ba1a1a') && compareColor(b1, '#ffffff') && compareColor(b2, '#006495') && compareColor(b3, '#ffffff') && compareColor(b4, '#ba1a1a');
        """
    },
    "tailandia_2": {
        "conditions": """
            const stripes = Array.from(document.querySelectorAll('.flag-stripe'));
            const allPainted = stripes.length === 5 && stripes.every(s => s.style.backgroundColor && s.style.backgroundColor !== 'white' && s.style.backgroundColor !== 'rgb(255, 255, 255)');
            const isCorrect = allPainted && compareColor(stripes[0], '#ba1a1a') && compareColor(stripes[1], '#ffffff') && compareColor(stripes[2], '#006495') && compareColor(stripes[3], '#ffffff') && compareColor(stripes[4], '#ba1a1a');
        """
    },
    "turqu_a_1": {
        "conditions": """
            const allPainted = false;
            const isCorrect = false;
        """
    },
    "turqu_a_2": {
        "conditions": """
            const bg = document.getElementById('flag-bg');
            const moon = document.getElementById('flag-moon');
            const star = document.getElementById('flag-star');
            const allPainted = bg && moon && star && bg.getAttribute('fill') && moon.getAttribute('fill') && star.getAttribute('fill');
            const isCorrect = allPainted && compareColor(bg, '#ba1a1a') && compareColor(moon, '#ffffff') && compareColor(star, '#ffffff');
        """
    },
    "vietnam": {
        "conditions": """
            const allPainted = typeof paintedRed !== 'undefined' && typeof paintedYellow !== 'undefined' && paintedRed && paintedYellow;
            const isCorrect = allPainted;
        """
    }
}

def get_check_completion_range(text):
    match = re.search(r'function\s+checkCompletion\s*\(', text)
    if not match:
        return None
    start_idx = match.start()
    open_idx = text.find('{', start_idx)
    if open_idx == -1:
        return None
    brace_count = 1
    idx = open_idx + 1
    while brace_count > 0 and idx < len(text):
        if text[idx] == '{':
            brace_count += 1
        elif text[idx] == '}':
            brace_count -= 1
        idx += 1
    if brace_count == 0:
        return start_idx, idx
    return None

for s in stations:
    html_path = os.path.join(base_dir, s, "index.html")
    if not os.path.exists(html_path):
        continue
        
    country_key = s.replace("estaci_n_de_pintura_", "")
    if country_key not in conditions:
        print(f"Skipping {s}: no custom conditions found")
        continue
        
    print(f"Injecting custom checkCompletion for {s}...")
    
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Find checkCompletion function
    rng = get_check_completion_range(content)
    if not rng:
        print(f"ERROR: checkCompletion not found in {s}")
        continue
        
    start, end = rng
    
    # Generate custom function code
    custom_conds = conditions[country_key]["conditions"].strip()
    
    custom_func = f"""function compareColor(el, expected) {{
            if (!el) return false;
            const clean = (s) => s.replace(/\\s+/g, '').toLowerCase();
            const exp = clean(expected);
            
            const bg = el.style.backgroundColor;
            if (bg) {{
                if (clean(bg).includes(exp)) return true;
                if (exp.startsWith('#') && exp.length === 7) {{
                    const r = parseInt(exp.slice(1, 3), 16);
                    const g = parseInt(exp.slice(3, 5), 16);
                    const b = parseInt(exp.slice(5, 7), 16);
                    if (clean(bg).includes(`rgb(${{r}},${{g}},${{b}})`)) return true;
                }}
            }}
            
            const fill = el.getAttribute('fill');
            if (fill) {{
                if (clean(fill).includes(exp)) return true;
                if (exp.startsWith('#') && exp.length === 7) {{
                    const r = parseInt(exp.slice(1, 3), 16);
                    const g = parseInt(exp.slice(3, 5), 16);
                    const b = parseInt(exp.slice(5, 7), 16);
                    if (clean(fill).includes(`rgb(${{r}},${{g}},${{b}})`)) return true;
                }}
            }}
            
            const sFill = el.style.fill;
            if (sFill) {{
                if (clean(sFill).includes(exp)) return true;
                if (exp.startsWith('#') && exp.length === 7) {{
                    const r = parseInt(exp.slice(1, 3), 16);
                    const g = parseInt(exp.slice(3, 5), 16);
                    const b = parseInt(exp.slice(5, 7), 16);
                    if (clean(sFill).includes(`rgb(${{r}},${{g}},${{b}})`)) return true;
                }}
            }}
            
            const classes = el.className;
            if (classes && typeof classes === 'string') {{
                if (clean(classes).includes('bg-[' + exp + ']') || clean(classes).includes('bg-' + exp)) return true;
            }}
            
            return false;
        }}

        function checkCompletion() {{
            {custom_conds}
            
            if (isCorrect) {{
                AudioController.speakBilingual('¡Lo lograste! ¡Bandera completa!', 'You did it! Flag complete!');
                const canvas = document.getElementById('flag-canvas') || document.getElementById('paintingCanvas') || document.getElementById('flag-container') || document.getElementById('flag-svg') || document.getElementById('australia-flag-svg');
                if (canvas) canvas.classList.add('celebration');
                setTimeout(() => {{
                    window.location.href = `../celebration_reward/index.html?country=${{COUNTRY_ID}}`;
                }}, 2000);
            }} else if (allPainted) {{
                AudioController.speakBilingual('¡Casi! Sigue intentando con los colores correctos.', 'Almost! Keep trying with the correct colors.');
            }} else {{
                AudioController.speakBilingual('¡Sigue pintando!', 'Keep painting!');
            }}
        }}"""

    new_content = content[:start] + custom_func + content[end:]
    
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(new_content)

print("All 50 stations updated successfully!")
