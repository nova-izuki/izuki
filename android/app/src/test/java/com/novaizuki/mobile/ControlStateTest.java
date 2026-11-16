package com.novaizuki.mobile;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.Arrays;
import java.util.List;
import org.junit.Test;

/** Android control's state and tap-by-label choices, as the Samsung test exercised them. */
public class ControlStateTest {
  private static final String PKG = "com.novaizuki.mobile";
  private static final String CLS = "com.novaizuki.mobile.IzukiAccessibilityService";

  @Test public void enabledInEitherComponentForm() {
    assertTrue(ControlState.listed(PKG + "/" + CLS, PKG, CLS));
    assertTrue("Samsung's short form", ControlState.listed("com.samsung.android.accessibility.talkback/.TalkBack:" + PKG + "/.IzukiAccessibilityService", PKG, CLS));
    assertFalse(ControlState.listed("com.example/.IzukiAccessibilityService", PKG, CLS));
    assertFalse("a different service of ours isn't this one", ControlState.listed(PKG + "/.OtherService", PKG, CLS));
    assertFalse(ControlState.listed(null, PKG, CLS));
    assertFalse(ControlState.listed("", PKG, CLS));
  }

  @Test public void restrictedSettingsOnlyWhereAndroidHasThem() {
    assertEquals("none", ControlState.restriction(32, ControlState.OP_ERRORED, ControlState.SOURCE_LOCAL_FILE));
    assertEquals("Android says so", "restricted", ControlState.restriction(34, ControlState.OP_ERRORED, ControlState.SOURCE_UNKNOWN));
    assertEquals("allowed", ControlState.restriction(34, ControlState.OP_ALLOWED, ControlState.SOURCE_DOWNLOADED_FILE));
    assertEquals("installed from a file: likely, not certain", "likely", ControlState.restriction(34, ControlState.OP_UNKNOWN, ControlState.SOURCE_DOWNLOADED_FILE));
    assertEquals("none", ControlState.restriction(35, ControlState.OP_DEFAULT, ControlState.SOURCE_STORE));
    assertEquals("unknown", ControlState.restriction(35, ControlState.OP_UNKNOWN, ControlState.SOURCE_UNKNOWN));
  }

  @Test public void onlyAConnectedServiceIsReady() {
    assertEquals("ready", ControlState.control(true, true, "likely"));
    assertEquals("enabled in Settings but not running yet", "not-connected", ControlState.control(true, false, "none"));
    assertEquals("restricted", ControlState.control(false, false, "restricted"));
    assertEquals("maybe-restricted", ControlState.control(false, false, "likely"));
    assertEquals("off", ControlState.control(false, false, "allowed"));
    assertEquals("off", ControlState.control(false, false, "unknown"));
  }

  @Test public void aLabelInsideAPressableRowIsFound() {
    // The Samsung test page: the button's text sits on its own node.
    List<String> labels = Arrays.asList("Izuki gesture target", "Izuki label target", "Izuki swipe test — swipe across this strip");
    assertEquals(1, ControlState.bestLabel(labels, "Izuki label target"));
    assertEquals(2, ControlState.bestLabel(labels, "swipe test"));
  }

  @Test public void exactBeatsPartial() {
    List<String> labels = Arrays.asList("Search YouTube", "Voice search", "Search");
    assertEquals(2, ControlState.bestLabel(labels, "search"));
    assertEquals(0, ControlState.bestLabel(Arrays.asList("Search YouTube", "Voice search"), "search"));
    assertEquals("the search button → Search", 0, ControlState.bestLabel(Arrays.asList("Search", "Home"), "the search button"));
    assertEquals(-1, ControlState.bestLabel(labels, "settings"));
    assertEquals(-1, ControlState.bestLabel(labels, ""));
  }

  @Test public void quotesAndSpacesDontMatter() {
    assertEquals(0, ControlState.bestLabel(Arrays.asList("Wi‑Fi  calling", "Wi-Fi"), "“Wi‑Fi calling”"));
  }

  @Test public void aRiskyActionMustBeTheOneNamed() {
    assertFalse("“Order” never presses “Delete order”", ControlState.riskyAllowed("Delete order", "Order"));
    assertTrue(ControlState.riskyAllowed("Delete order", "delete order"));
    assertTrue(ControlState.riskyAllowed("Send", "tap send"));
    assertFalse(ControlState.riskyAllowed("Buy now", "now"));
    assertTrue("a harmless label needs nothing", ControlState.riskyAllowed("Search", "search"));
  }

  @Test public void onlySearchBoxesGetEnter() {
    assertTrue(ControlState.searchy("Search YouTube com.google.android.youtube:id/search_edit_text"));
    assertTrue(ControlState.searchy("com.android.chrome:id/url_bar"));
    assertFalse("a chat composer never gets Enter", ControlState.searchy("Message entry android.widget.EditText"));
    assertFalse("whole words only", ControlState.searchy("Research notes research_body"));
    assertTrue(ControlState.searchy("search_src_text"));
    assertFalse("a composer only exposes its own metadata", ControlState.searchy("Message entry"));
  }

  @Test public void riskyControlsNeedTheirNameInTheRequest() {
    assertTrue(ControlState.risky("Send"));
    assertTrue(ControlState.risky("Buy now"));
    assertTrue(ControlState.risky("Place order"));
    assertTrue(ControlState.risky("Delete chat"));
    assertFalse(ControlState.risky("Search"));
    assertFalse(ControlState.risky("Sender settings"));
    assertTrue("other languages", ControlState.risky("Enviar") && ControlState.risky("Supprimer") && ControlState.risky("Löschen"));
    assertTrue("installing and permissions", ControlState.risky("Install") && ControlState.risky("Allow"));
    assertTrue("the same list the agent blocks", ControlState.risky("Reset network settings") && ControlState.risky("Force stop")
        && ControlState.risky("Sign out") && ControlState.risky("Log out") && ControlState.risky("Factory data reset"));
    assertTrue("named in the request, it's allowed", ControlState.riskyAllowed("Reset", "tap reset"));
    assertTrue("reset and sign out in other languages", ControlState.risky("Restablecer") && ControlState.risky("Réinitialiser")
        && ControlState.risky("Zurücksetzen") && ControlState.risky("Cerrar sesión") && ControlState.risky("Abmelden"));
    assertFalse(ControlState.risky("Calendar"));
    assertTrue(ControlState.wholeWord("Voice search", "search"));
    assertFalse(ControlState.wholeWord("Researchers", "search"));
  }
}
