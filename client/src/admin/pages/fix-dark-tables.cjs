const fs = require('fs');

const files = [
  'OrdersManagement.jsx',
  'BidsManagement.jsx',
  'PaymentsManagement.jsx',
  'Transactions.jsx',
  'VerificationRequests.jsx',
  'MessagesMonitoring.jsx',
  'SupportTickets.jsx',
  'ReviewsRatings.jsx',
  'CategoriesManagement.jsx',
  'WeatherManagement.jsx',
  'NotificationsManagement.jsx', 'Dashboard.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Skipping ' + file + ' - not found');
    return;
  }
  let content = fs.readFileSync(file, 'utf8');

  // 1. Table header border
  content = content.replace(/className=\"border-b border-gray-50(?:\s+dark:border-gray-800)?([^\"]*)\"/g, 'className="border-b border-gray-50 dark:border-white/5$1"');

  // 2. Table body divide
  content = content.replace(/divide-y divide-gray-50(?:\s+dark:divide-gray-800)?/g, 'divide-y divide-gray-50 dark:divide-white/5');

  // 3. Row hover
  content = content.replace(/hover:bg-gray-50(?:\s+dark:hover:bg-slate-800)?(?:\s+dark:bg-\[#0F172A\]\/50)?\s+transition-colors/g, 'hover:bg-gray-50 dark:hover:bg-white/5 transition-colors');

  fs.writeFileSync(file, content);
  console.log('Processed ' + file);
});
