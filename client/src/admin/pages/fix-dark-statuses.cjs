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
  let original = content;

  content = content.replace(/(className\s*=\s*(?:\{`|["']))([\s\S]*?)(`\}|["'])/g, (match, prefix, classNames, suffix) => {
    let replaced = classNames;

    colors.forEach(c => {
      replaced = replaced.replace(new RegExp(`(?<![a-z:-])bg-${c}-(50|55\\/10)(?!\\s+dark:bg-${c}-900\\/30)`, 'g'), `bg-${c}-$1 dark:bg-${c}-900/30`);
      replaced = replaced.replace(new RegExp(`(?<![a-z:-])text-${c}-(600|650|700|750|800)(?!\\s+dark:text-${c}-400)`, 'g'), `text-${c}-$1 dark:text-${c}-400`);
      replaced = replaced.replace(new RegExp(`(?<![a-z:-])border-${c}-(100|150|155|200)(?!\\s+dark:border-${c}-800\\/50)`, 'g'), `border-${c}-$1 dark:border-${c}-800/50`);
      replaced = replaced.replace(new RegExp(`hover:bg-${c}-(50|100\\/30|55\\/10)(?!\\s+dark:hover:bg-${c}-900\\/30)`, 'g'), `hover:bg-${c}-$1 dark:hover:bg-${c}-900/30`);
    });

    return prefix + replaced + suffix;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
