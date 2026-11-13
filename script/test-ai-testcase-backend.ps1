param(
  [string]$BackendRoot = 'D:/project/risk_assessment_system',
  [string]$Group = 'all'
)
$ErrorActionPreference = 'Stop'
$workspace = Split-Path $PSScriptRoot -Parent
$output = Join-Path $workspace 'node_modules/.cache/ai-testcase-feedback/classes'
New-Item -ItemType Directory -Path $output -Force | Out-Null
$classDirs = @(Get-ChildItem -LiteralPath $BackendRoot -Directory | ForEach-Object { Join-Path $_.FullName 'target/classes' } | Where-Object { Test-Path -LiteralPath $_ })
$jars = @(Get-ChildItem -LiteralPath (Join-Path $BackendRoot 'ras-admin/target/ras-admin/WEB-INF/lib') -Filter '*.jar' | Select-Object -ExpandProperty FullName)
$classpath = (@($output) + $classDirs + $jars) -join ';'
$javaRoot = Join-Path $BackendRoot 'ras-assessment/src/main/java/com/zjsc/ras/assessment'
$relative = @('service/IAiFunctionPointService.java','service/impl/AiFunctionPointServiceImpl.java','service/impl/AiTestCaseServiceImpl.java','task/AiTestCaseTaskManager.java','controller/AiTestCaseController.java','domain/dto/AiFunctionPointReviewDTO.java','mapper/AiFunctionPointMapper.java')
$sources = @($relative | ForEach-Object { Join-Path $javaRoot $_ }) + @(Join-Path $PSScriptRoot 'AiTestCaseFeedbackRegression.java')
$javac = 'C:/Program Files/Java/jdk1.8.0_281/bin/javac.exe'
$java = 'C:/Program Files/Java/jdk1.8.0_281/bin/java.exe'
& $javac -encoding UTF-8 -source 8 -target 8 -cp $classpath -d $output $sources
if ($LASTEXITCODE -ne 0) { throw 'Targeted backend compilation failed' }
& $java "-Dlogback.configurationFile=$(Join-Path $PSScriptRoot 'ai-testcase-test-logback.xml')" -cp $classpath AiTestCaseFeedbackRegression $Group
if ($LASTEXITCODE -ne 0) { throw 'Backend regression failed' }
