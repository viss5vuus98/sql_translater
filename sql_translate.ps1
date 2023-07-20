$RootPath = Split-Path $MyInvocation.MyCommand.Path
$DirectoryPath = Join-Path -Path $RootPath -ChildPath "sql_files"

$compDBList = @("MLHG_OD_M", "MLCG_OD_M", "MHHG_OD_M")
$fileRegex = "\.txt$"
$sqlRegex = "USE MLHG_OD_M

$Files = Get-ChildItem -Path $DirectoryPath -Filter *.txt | ForEach-Object { $_.FullName }

foreach($File in $Files) {
    $data = Get-Content $File -Raw

    # 如果文件包含 'USE MLHG_OD_M'，進行替換
    if($data -match $sqlRegex) {
        # 去除'USE MLHG_OD_M', 'GO', 換行符號
        $data = $data -replace $sqlRegex,"" -replace "go","" -replace "`n",""

        $newFileData = foreach ($db in $compDBList) {
            "USE $db`nGO`n$data`n`n"
        }

        # 將新的文件內容寫入文件
        Set-Content -Path $File -Value ($newFileData -join "")
    }
}
