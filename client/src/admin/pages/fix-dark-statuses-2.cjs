const fs = require('fs');

const files = [
  'BidsManagement.jsx',
  'BuyerDetails.jsx',
  'BuyersManagement.jsx',
  'CategoriesManagement.jsx',
  'Dashboard.jsx',
  'FarmerDetails.jsx',
  'FarmersManagement.jsx',
  'MessagesMonitoring.jsx',
  'NotificationsManagement.jsx',
  'OrderDetails.jsx',
  'OrdersManagement.jsx',
  'PaymentsManagement.jsx',
  'ProductDetails.jsx',
  'ProductsManagement.jsx',
  'Profile.jsx',
  'ReviewsRatings.jsx',
  'Settings.jsx',
  'SupportTickets.jsx',
  'Transactions.jsx',
  'VerificationRequests.jsx',
  'WeatherManagement.jsx'
];

const colors = ['green', 'red', 'amber', 'blue', 'purple', 'orange'];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Fix the broken `bg-green-500` -> `bg-green-50 dark:bg-green-900/300` mistake from previous run
  colors.forEach(c => {
     content = content.replace(new RegExp(`bg-${c}-50\\s+dark:bg-${c}-900\\/300`, 'g'), `bg-${c}-500`);
     content = content.replace(new RegExp(`text-${c}-600\\s+dark:text-${c}-4000`, 'g'), `text-${c}-6000`);
     content = content.replace(new RegExp(`bg-${c}-50\\s+dark:bg-${c}-900\\/30(?!\\s)`, 'g'), `bg-${c}-50`); // Clean up concatenated mistakes if any
  });

  // Step 1: Strip ALL previously added specific dark classes globally to prevent duplicates
  content = content.replace(/\s*dark:bg-(green|red|amber|blue|purple|orange)-900\/30/g, '');
  content = content.replace(/\s*dark:text-(green|red|amber|blue|purple|orange)-400/g, '');
  content = content.replace(/\s*dark:border-(green|red|amber|blue|purple|orange)-800\/50/g, '');
  content = content.replace(/\s*dark:hover:bg-(green|red|amber|blue|purple|orange)-900\/30/g, '');

  // Step 2: Inject them correctly next to their light mode counterparts
  colors.forEach(c => {
    // backgrounds
    content = content.replace(new RegExp(`(?<![a-z:-])bg-${c}-(50|55\\/10)(?!\\d)`, 'g'), `bg-${c}-$1 dark:bg-${c}-900/30`);
    
    // text
    content = content.replace(new RegExp(`(?<![a-z:-])text-${c}-(600|650|700|750|800)(?!\\d)`, 'g'), `text-${c}-$1 dark:text-${c}-400`);

    // borders
    content = content.replace(new RegExp(`(?<![a-z:-])border-${c}-(100|150|155|200)(?!\\d)`, 'g'), `border-${c}-$1 dark:border-${c}-800/50`);
    
    // hover:bg
    content = content.replace(new RegExp(`(?<![a-z:-])hover:bg-${c}-(50|100\\/30|55\\/10)(?!\\d)`, 'g'), `hover:bg-${c}-$1 dark:hover:bg-${c}-900/30`);
  });

  fs.writeFileSync(file, content);
  console.log('Processed ' + file);
});
