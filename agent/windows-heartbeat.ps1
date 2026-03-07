param(
  [Parameter(Mandatory = $true)]
  [string]$CommandCenterUrl,

  [Parameter(Mandatory = $true)]
  [string]$IngestToken,

  [Parameter(Mandatory = $false)]
  [string]$InstanceId = $env:COMPUTERNAME,

  [Parameter(Mandatory = $false)]
  [string]$AppVersion = "1.1.0",

  [Parameter(Mandatory = $false)]
  [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

function Get-CpuPercent {
  $sample = Get-Counter '\Processor(_Total)\% Processor Time'
  return [math]::Round($sample.CounterSamples[0].CookedValue, 2)
}

function Get-MemoryPercent {
  $os = Get-CimInstance Win32_OperatingSystem
  $total = [double]$os.TotalVisibleMemorySize
  $free = [double]$os.FreePhysicalMemory
  return [math]::Round((($total - $free) / $total) * 100, 2)
}

function Get-DiskPercent {
  $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
  $size = [double]$disk.Size
  $free = [double]$disk.FreeSpace
  return [math]::Round((($size - $free) / $size) * 100, 2)
}

function Get-OsUptimeSeconds {
  $os = Get-CimInstance Win32_OperatingSystem
  return [int]((Get-Date) - $os.LastBootUpTime).TotalSeconds
}

$body = @{
  instanceId = $InstanceId
  platform = "windows"
  appVersion = $AppVersion
  environment = $Environment
  deviceLabel = "$env:USERNAME@$env:COMPUTERNAME"
  machineName = $env:COMPUTERNAME
  status = "up"
  syncBacklog = 0
  openErrors = 0
  cpuPercent = Get-CpuPercent
  memoryPercent = Get-MemoryPercent
  diskPercent = Get-DiskPercent
  appUptimeSeconds = 0
  osUptimeSeconds = Get-OsUptimeSeconds
  networkStatus = "online"
  metadata = @{
    os = "windows"
    user = $env:USERNAME
  }
  payload = @{
    source = "powershell-agent"
  }
} | ConvertTo-Json -Depth 5

$headers = @{
  Authorization = "Bearer $IngestToken"
  "Content-Type" = "application/json"
}

Invoke-RestMethod `
  -Method Post `
  -Uri "$CommandCenterUrl/api/telemetry/heartbeat" `
  -Headers $headers `
  -Body $body
