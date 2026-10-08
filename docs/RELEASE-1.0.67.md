# Izuki 1.0.67 — verified Windows power-plan control

## PC Boost

Settings → PC Boost now includes **High Performance mode**. On selects Windows' built-in High Performance plan; off selects Balanced. This is manual, not an automatic response to lag and not a promise of faster performance. High Performance may increase heat, fan activity and battery use.

The toggle reads the actual Windows plan when the card opens and when the window regains focus. Changes are serialized, Windows command failures are reported, and a second read must confirm the requested plan before success is shown. Custom and Ultimate Performance plans are reported as another plan, not mislabeled as Balanced.

Some devices and managed PCs do not offer High Performance. In that case Izuki reports the failure; it does not create power schemes, elevate permissions or claim the switch worked.

## Release and update

The previously uncommitted power-plan work is now wired to Tauri's registered commands and included in this versioned release. 1.0.66 correctly reported itself current while no newer published package existed.

In the Windows app, open **Settings → Updates → Check now**, then **Download update** and **Install & close Izuki**. Save work first. Update checks can notify automatically; installation remains your choice.

The website download and signed updater metadata point to the published release. Android/iPhone companion builds remain previews; this power-plan feature is Windows-only. iPhone signing/renewal and Android preview signing limitations still apply.

Validation includes a production frontend build and regression tests for localized plan output, missing/denied plans, invalid requests and post-change verification. Tests simulate plan changes: no Windows power plan was changed and no Izuki application was installed on the developer's PC.

Implementation follows [Microsoft's powercfg command documentation](https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/powercfg-command-line-options).
