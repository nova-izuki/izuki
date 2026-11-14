package com.novaizuki.mobile;

import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

/**
 * One swipe and a tap from anywhere: add Izuki to Android's Quick Settings.
 * It opens the companion in wake mode; it does not start listening by itself.
 */
public class IzukiTileService extends TileService {
  @Override public void onStartListening() {
    super.onStartListening();
    Tile tile = getQsTile();
    if (tile == null) return;
    tile.setLabel("Ask Izuki");
    tile.setState(Tile.STATE_ACTIVE);
    tile.updateTile();
  }

  @Override public void onClick() {
    super.onClick();
    Intent open = new Intent(this, MainActivity.class);
    open.putExtra("izuki_wake", "Hey Nova");
    open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    try {
      if (Build.VERSION.SDK_INT >= 34) {
        PendingIntent pending = PendingIntent.getActivity(this, 0, open,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        startActivityAndCollapse(pending);
      } else {
        startActivityAndCollapse(open);
      }
    } catch (Exception ignored) { }
  }
}
