const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    let filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) { 
      if (!filePath.includes('node_modules')) results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('D:/DARSHAK/AGRINOVA/AGRINOVA/client/src');
let changed = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  newContent = newContent.replace(/,1/g, '₹');
  newContent = newContent.replace(/â‚¹/g, '₹');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log('Fixed ' + file);
  }
});
console.log('Total fixed: ' + changed);
