package com.novaizuki.mobile;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(IzukiControlPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
