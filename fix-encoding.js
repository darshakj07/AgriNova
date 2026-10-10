const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    let filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('d:/DARSHAK/AGRINOVA/AGRINOVA/client/src');
let changed = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  newContent = newContent.split('Â°').join('°');
  newContent = newContent.split('ðŸŒ§').join('🌧️');
  newContent = newContent.split('ðŸ“ˆ').join('📈');
  newContent = newContent.split('o"').join('✅');
  newContent = newContent.split(',12,650').join('₹12,650');
  newContent = newContent.split(',14,050').join('₹14,050');
  newContent = newContent.split(',14,700').join('₹14,700');
  newContent = newContent.split(',11,800').join('₹11,800');
  newContent = newContent.split(',11,400').join('₹11,400');
  newContent = newContent.split(',15,500').join('₹15,500');
  newContent = newContent.split(',12,050').join('₹12,050');
  newContent = newContent.split(',11,900').join('₹11,900');
  newContent = newContent.split(',145,000').join('₹145,000');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log('Fixed ' + file);
  }
});
console.log('Total fixed: ' + changed);
