$files = Get-ChildItem -Path "d:\DARSHAK\AGRINOVA\AGRINOVA\client\src" -Recurse -Filter "*.jsx"

foreach ($file in $files) {
    # Skip the ThemeToggle itself to avoid messing it up, since it already has dark classes
    if ($file.Name -eq "ThemeToggle.jsx") { continue }
    
    $content = Get-Content $file.FullName -Raw

    # Prevent double processing by checking if it already has many dark mode classes, 
    # but we'll assume they don't have any yet for this project scope.
    
    $content = $content -replace "\bbg-white\b(?! dark:bg-\[#1E293B\])", "bg-white dark:bg-[#1E293B]"
    $content = $content -replace "\bbg-gray-50\b(?! dark:bg-\[#0F172A\])", "bg-gray-50 dark:bg-[#0F172A]"
    $content = $content -replace "\bbg-gray-100\b(?! dark:bg-slate-800)", "bg-gray-100 dark:bg-slate-800"
    
    $content = $content -replace "\btext-charcoal\b(?! dark:text-white| dark:text-gray-100)", "text-charcoal dark:text-gray-100"
    $content = $content -replace "\btext-gray-600\b(?! dark:text-gray-300)", "text-gray-600 dark:text-gray-300"
    $content = $content -replace "\btext-gray-500\b(?! dark:text-gray-400)", "text-gray-500 dark:text-gray-400"
    $content = $content -replace "\btext-gray-700\b(?! dark:text-gray-200)", "text-gray-700 dark:text-gray-200"
    $content = $content -replace "\btext-gray-800\b(?! dark:text-gray-100)", "text-gray-800 dark:text-gray-100"
    $content = $content -replace "\btext-gray-900\b(?! dark:text-white)", "text-gray-900 dark:text-white"
    
    $content = $content -replace "\bborder-gray-100\b(?! dark:border-gray-800)", "border-gray-100 dark:border-gray-800"
    $content = $content -replace "\bborder-gray-200\b(?! dark:border-gray-700)", "border-gray-200 dark:border-gray-700"
    $content = $content -replace "\bborder-charcoal/5\b(?! dark:border-white/5)", "border-charcoal/5 dark:border-white/5"
    $content = $content -replace "\bborder-charcoal/10\b(?! dark:border-white/10)", "border-charcoal/10 dark:border-white/10"
    
    $content = $content -replace "\bbg-\[#F8FAF5\]\b(?! dark:bg-\[#0F172A\])", "bg-[#F8FAF5] dark:bg-[#0F172A]"
    $content = $content -replace "\bbg-white/80\b(?! dark:bg-\[#1E293B\]/80)", "bg-white/80 dark:bg-[#1E293B]/80"
    $content = $content -replace "\bbg-white/90\b(?! dark:bg-\[#1E293B\]/90)", "bg-white/90 dark:bg-[#1E293B]/90"

    $content | Set-Content $file.FullName -Encoding UTF8
}
Write-Output "Dark mode baseline transformation complete."
