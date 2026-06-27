const fs = require('fs');
const files = ['data','audio','celebrate','store','ui','paint','quiz','flow','hub','passport','settings'];
const src = {};
files.forEach(f => src[f] = fs.readFileSync(`app/js/${f}.js`,'utf8'));

// 1. Extract public API of each module (keys in the FINAL returned object)
const apis = {};
files.forEach(f => {
  // The module's public API is the LAST top-level `return {...};` — grab all
  // return blocks and take the last one (inner functions return first).
  const all = [...src[f].matchAll(/return\s*\{([\s\S]*?)\};/g)];
  const returnBlock = all[all.length - 1];
  if(!returnBlock){ apis[f] = []; return; }
  const keys = new Set();
  const re = /([A-Za-z_$][\w$]*)\s*(?=:|,|\}|\))/g;
  let mm;
  while((mm = re.exec(returnBlock[1]))){ keys.add(mm[1]); }
  apis[f] = [...keys];
});

// 2. Verify every Module.method( call resolves
const fileMap = { Audio2:'audio', UI:'ui', Paint:'paint', Quiz:'quiz', Flow:'flow',
  Hub:'hub', Store:'store', Settings:'settings', Passport:'passport', Celebrate:'celebrate' };
let problems = [];
Object.entries(src).forEach(([f, code])=>{
  Object.keys(fileMap).forEach(mod=>{
    const re = new RegExp(mod + '\\.([A-Za-z_$][\\w$]*)\\s*\\(', 'g');
    let m;
    while((m = re.exec(code))){
      const method = m[1];
      const apiFile = fileMap[mod];
      if(!apis[apiFile] || !apis[apiFile].includes(method)){
        problems.push(`${f}.js calls ${mod}.${method}() but '${method}' is not exported by ${apiFile}.js [has: ${(apis[apiFile]||[]).join(', ')}]`);
      }
    }
  });
});
console.log(problems.length ? `❌ ${problems.length} wiring problems:` : '✅ CROSS-FILE WIRING: every Module.method() resolves');
problems.forEach(p=>console.log('  - '+p));

// 3. Screen ID consistency
const html = fs.readFileSync('app/index.html','utf8');
const registeredScreens = [...html.matchAll(/id="screen-([\w-]+)"/g)].map(m=>m[1]);
const shows = new Set();
files.forEach(f=>{
  const re = /UI\.show\(\s*['"]([\w-]+)['"]/g;
  let m; while((m=re.exec(src[f]))) shows.add(m[1]);
});
const missing = [...shows].filter(s => !registeredScreens.includes(s));
console.log(missing.length ? `❌ SCREEN ID mismatch — show() targets missing: ${missing.join(', ')}` : `✅ SCREEN IDS: all UI.show() targets exist (${registeredScreens.join(', ')})`);

// 4. Load order
const loadOrder = [...html.matchAll(/<script src="js\/(\w+)\.js">/g)].map(m=>m[1]);
const expected = ['data','audio','celebrate','store','ui','paint','quiz','flow','hub','passport','settings'];
console.log(`\nLoad order: ${loadOrder.join(' → ')}`);
console.log(loadOrder.join(',')===expected.join(',') ? '✅ Load order correct' : '⚠️  Load order differs');

// 5. Syntax check each file via vm
const vm = require('vm');
let syntaxErrors = [];
files.forEach(f=>{
  try { new vm.Script(src[f], { filename:`${f}.js` }); }
  catch(e){ syntaxErrors.push(`${f}.js: ${e.message}`); }
});
console.log(syntaxErrors.length ? `❌ SYNTAX ERRORS:\n  - `+syntaxErrors.join('\n  - ') : `✅ SYNTAX: all ${files.length} JS files parse cleanly`);
