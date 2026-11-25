# Move your files and apps to a new Windows PC

You can use a USB drive for files and Microsoft's free tools for apps. Keep the old PC's copies until you have opened and checked them on the new one.

## 1. Copy your files on the old PC

1. Plug in a USB drive or external disk with enough free space.
2. Open File Explorer, select the drive under **This PC**, and create a folder called **Old PC backup**.
3. Open a second File Explorer window. Copy the files you want from **Desktop, Documents, Downloads, Pictures, Videos and Music** into that backup folder. Use **Copy**, not Cut.
4. Copy your **Nova_Izuki** project folder there too. Close coding tools before copying so the files stop changing. Build caches such as `node_modules` and `src-tauri/target` can be recreated and do not need to move.
5. To keep Claude's local conversations and project notes, press **Win+R**, enter `%USERPROFILE%`, and copy the hidden `.claude` folder into the backup folder. If hidden folders do not appear, turn on **View → Show → Hidden items**. This contains personal history; keep the backup private. It does not guarantee that sign-in will carry over.
6. Wait for every copy to finish, then safely eject the drive.

If a file is only online in OneDrive, download it first so the USB receives the actual file.

## 2. Save a list of your apps

On the old PC, open PowerShell and run:

```powershell
winget export -o "$env:USERPROFILE\Desktop\Izuki-apps.json"
```

If Desktop was redirected to OneDrive, use a folder that exists instead. Copy the resulting `Izuki-apps.json` file onto the USB drive. This saves a list of supported apps; it does not copy their installed program files, settings or licences. Note the apps WinGet says it could not match. [Microsoft's export documentation](https://learn.microsoft.com/en-us/windows/package-manager/winget/export).

## 3. Restore on the new PC

1. Plug in the USB drive. Copy your personal files into the corresponding folders, and copy the project into the location where you want to work.
2. Install Claude Code and your editor again. Close Claude Code, then copy the saved `.claude` folder into `%USERPROFILE%` on the new PC. If a `.claude` folder already exists, keep a backup of it before merging. New project paths can require reopening the project or selecting the old conversation manually.
3. Copy `Izuki-apps.json` from the USB to the new PC's Desktop, connect to the internet, and run:

```powershell
winget import -i "$env:USERPROFILE\Desktop\Izuki-apps.json"
```

4. Read any installer or agreement prompts and approve the apps you want. Install unmatched apps from their official sites. Sign in again to licensed apps and your browser; browser passwords return only if the browser's account sync was enabled and includes them.
5. Install Izuki on the new PC. On the old PC, **Settings → Privacy → Your data → Take a copy of my data** creates an export you can keep on the USB. Izuki currently has no matching built-in import control: keep the export and the old PC's data until a restore is supported and checked. Copying an app list does not restore Izuki's settings and memories.
6. Open several files and your project to check the copies before changing or removing anything on the old PC.

WinGet downloads and installs apps on the destination PC, so that part needs internet access. Copying files by USB works offline. [Microsoft's import documentation](https://learn.microsoft.com/en-us/windows/package-manager/winget/import).

## Windows Backup is another option

On the old PC, open **Start → Windows Backup** and review what it can back up. During initial setup of the new PC, sign in with the same Microsoft account and select the offered backup. Windows restores supported settings and app pins; OneDrive-backed files depend on completed sync and available storage. App pins can start reinstalling supported apps; this is not a complete transfer of every installed app. If the new PC is already set up, use file copying and app reinstallation without resetting it just to reach the restore screen. [Microsoft's Windows Backup guide](https://support.microsoft.com/en-us/windows/experience/backup-recovery/back-up-and-restore-with-windows-backup).

No files have been copied by this guide. A transfer needs you to choose the destination drive and files first. Izuki's proposed **Move to my new PC** feature is optional future work, not a finished migration tool.
