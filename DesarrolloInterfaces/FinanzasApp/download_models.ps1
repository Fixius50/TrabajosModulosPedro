[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$urls = @{
    "chest.glb" = "https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/TreasureChest/glTF-Binary/TreasureChest.glb?raw=true"
    "coin.glb" = "https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/Coin/glTF-Binary/Coin.glb?raw=true"
}

$destDir = "resources/frontend/public/models"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

foreach ($name in $urls.Keys) {
    echo "Downloading $name..."
    $url = $urls[$name]
    $output = Join-Path $destDir $name
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UserAgent "Mozilla/5.0"
        $fileItem = Get-Item $output
        if ($fileItem.Length -lt 1000) {
            echo "Warning: $name seems too small ($($fileItem.Length) bytes). Likely a 404 or text file."
            Get-Content $output | Select-Object -First 5
        } else {
            echo "Success: $name downloaded ($($fileItem.Length) bytes)."
        }
    } catch {
        echo "Error downloading $name : $_"
    }
}
