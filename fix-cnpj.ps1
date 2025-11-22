# Script to replace 'document' with 'cnpj' in client-related files

$files = @(
    "src\hooks\useClients.tsx",
    "src\components\clients\ClientEditDialog.tsx",
    "src\components\clients\ClientDetailsDialog.tsx",
    "src\pages\Clients.tsx"
)

foreach ($file in $files) {
    $fullPath = "c:\Users\Admin\OneDrive\Desktop\control-fiscal-lov\$file"
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Replace in TypeScript interface
        $content = $content -replace 'document: string;', ''
        
        # Replace in form schema
        $content = $content -replace 'document: z\.string', 'cnpj: z.string'
        
        # Replace in form field names
        $content = $content -replace 'name="document"', 'name="cnpj"'
        
        # Replace in object properties
        $content = $content -replace 'document:', 'cnpj:'
        
        # Replace client.document references
        $content = $content -replace 'client\.document', 'client.cnpj'
        
        # Replace values.document references  
        $content = $content -replace 'values\.document', 'values.cnpj'
        
        Set-Content $fullPath $content -NoNewline
        Write-Host "Updated: $file"
    }
}

Write-Host "All files updated successfully!"
