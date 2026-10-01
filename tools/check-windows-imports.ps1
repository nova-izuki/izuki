param([Parameter(Mandatory=$true)][string]$Binary)
$ErrorActionPreference = 'Stop'
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class IzukiImportCheck {
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] public static extern IntPtr LoadLibraryExW(string name, IntPtr file, uint flags);
  [DllImport("kernel32.dll", CharSet=CharSet.Ansi, ExactSpelling=true)] public static extern IntPtr GetProcAddress(IntPtr module, string name);
  [DllImport("kernel32.dll")] public static extern bool FreeLibrary(IntPtr module);
}
'@
$imports = node "$PSScriptRoot/windows-imports.cjs" $Binary | ConvertFrom-Json
foreach ($item in $imports) {
  # System directory only: don't load repository/PATH DLLs for a diagnostic.
  $module = [IzukiImportCheck]::LoadLibraryExW($item.dll, [IntPtr]::Zero, 0x800)
  if ($module -eq [IntPtr]::Zero) { Write-Output "LOAD FAILED: $($item.dll) (error $([Runtime.InteropServices.Marshal]::GetLastWin32Error()))"; continue }
  try {
    foreach ($symbol in $item.symbols) {
      if ($symbol.StartsWith('#')) { continue }
      if ([IzukiImportCheck]::GetProcAddress($module, $symbol) -eq [IntPtr]::Zero) { Write-Output "MISSING: $($item.dll)!$symbol" }
    }
  } finally { [void][IzukiImportCheck]::FreeLibrary($module) }
}
Write-Output 'System import check finished.'
