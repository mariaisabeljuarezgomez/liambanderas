global.window = {};
global.document = { createElement: () => ({ innerHTML:'', querySelector:()=>null, querySelectorAll:()=>[] }) };
const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, '..', 'app', 'js', 'data.js'), 'utf8');

const test = `
;(() => {
  console.log('Total flags:', FLAGS.length);
  console.log('Levels:', LEVELS.join(','));
  LEVELS.forEach(l => console.log('  Level ' + l + ': ' + flagsByLevel(l).length + ' flags'));
  let errors = 0;
  FLAGS.forEach(flag => {
    if (!flag.id || !flag.es || !flag.en || !flag.level) { console.log('MISSING FIELDS:', flag.id); errors++; }
    if (!flag.palette || !flag.palette.length) { console.log('NO PALETTE:', flag.id); errors++; }
    if (!flag.parts || !flag.parts.length) { console.log('NO PARTS:', flag.id); errors++; }
    flag.parts.forEach(p => {
      if (!p.region) { console.log('PART NO REGION:', flag.id); errors++; }
      if (!flag.palette.find(c => c.key === p.correct)) { console.log('BAD COLOR:', flag.id, p.region, '->', p.correct); errors++; }
    });
    try {
      const { svg } = getFlagSVG(flag);
      if (!svg.includes('<svg') || !svg.includes('</svg>')) { console.log('BAD SVG:', flag.id); errors++; }
      const rc = (svg.match(/data-region/g) || []).length;
      if (rc !== flag.parts.length) { console.log('REGION MISMATCH ' + flag.id + ': parts=' + flag.parts.length + ' inSVG=' + rc); errors++; }
    } catch (e) { console.log('SVG THREW:', flag.id, e.message); errors++; }
  });
  const ids = FLAGS.map(f => f.id);
  const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dups.length) console.log('DUPLICATE IDS:', [...new Set(dups)]);
  console.log('---');
  console.log(errors === 0 ? 'OK ALL FLAGS VALID' : 'ERR ' + errors + ' ERRORS');
})();
`;

eval(code + test);
