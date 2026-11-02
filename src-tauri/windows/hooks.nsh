; Izuki's installer hooks (tauri.conf.json: bundle > windows > nsis > installerHooks).
;
; An update starts this installer and then Izuki closes itself. The
; installer's own check force-closes a copy still running, waits half a
; second and writes izuki.exe. On a slow laptop Izuki took longer than that
; to let go of its file, so the write failed ("Error opening file for
; writing"), and Abort left the old version without Izuki running at all.
;
; This runs just before that check, during updates only (a manual install
; keeps the installer's own "Izuki is running, close it?" question): it gives
; Izuki up to 20 seconds to close by itself, ends it if it's still there,
; then waits up to 10 more seconds for izuki.exe to be writable before
; anything is copied.

!macro NSIS_HOOK_PREINSTALL
  ${If} $UpdateMode = 1
    DetailPrint "Waiting for Izuki to close…"
    StrCpy $R9 0
    izuki_wait_for_exit:
      nsis_tauri_utils::FindProcessCurrentUser "${MAINBINARYNAME}.exe"
      Pop $R8
      ; 0 = still running.
      ${If} $R8 = 0
        ${If} $R9 < 40
          IntOp $R9 $R9 + 1
          Sleep 500
          Goto izuki_wait_for_exit
        ${EndIf}
        DetailPrint "Izuki didn't close by itself; closing it."
        nsis_tauri_utils::KillProcessCurrentUser "${MAINBINARYNAME}.exe"
        Pop $R8
      ${EndIf}

    ; Closed isn't the same as its file being free: Windows lets go of a
    ; program's file a moment after the program ends. Up to 30 seconds; then
    ; the person chooses, instead of the copy failing on its own: Retry, or
    ; Cancel to keep the version they have, with Izuki opened again.
    StrCpy $R9 0
    izuki_wait_for_file:
      ${If} ${FileExists} "$INSTDIR\${MAINBINARYNAME}.exe"
        ClearErrors
        FileOpen $R7 "$INSTDIR\${MAINBINARYNAME}.exe" a
        ${If} ${Errors}
          ${If} $R9 < 120
            IntOp $R9 $R9 + 1
            Sleep 250
            Goto izuki_wait_for_file
          ${EndIf}
          MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "Izuki is still closing, so it can't be updated yet.$\n$\nPress Retry in a moment, or Cancel to keep the version you have (Izuki opens again)." /SD IDCANCEL IDRETRY izuki_retry_file
          Exec '"$INSTDIR\${MAINBINARYNAME}.exe"'
          Abort "Update cancelled. Izuki is still on the version you had."
          izuki_retry_file:
            StrCpy $R9 0
            Goto izuki_wait_for_file
        ${Else}
          FileClose $R7
        ${EndIf}
      ${EndIf}
  ${EndIf}
!macroend
