package com.novaizuki.mobile;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.List;
import org.junit.Test;

/** Izuki's native voice: replies cut into pieces TextToSpeech accepts, captions, errors. */
public class VoiceTextTest {

  @Test public void aShortReplyIsOnePiece() {
    List<String> p = VoiceText.pieces("  Your phone has 40 GB free.  ", 3000);
    assertEquals(1, p.size());
    assertEquals("Your phone has 40 GB free.", p.get(0));
    assertTrue(VoiceText.pieces("", 3000).isEmpty());
    assertTrue(VoiceText.pieces(null, 3000).isEmpty());
  }

  @Test public void aLongReplyIsCutAtSentenceEnds() {
    StringBuilder b = new StringBuilder();
    for (int i = 0; i < 30; i++) b.append("Sentence number ").append(i).append(" is here. ");
    String text = b.toString().trim();
    List<String> p = VoiceText.pieces(text, 120);
    assertTrue(p.size() > 1);
    for (String piece : p) {
      assertTrue("each piece fits: " + piece.length(), piece.length() <= 120);
      assertTrue("ends a sentence: " + piece, piece.endsWith("."));
    }
    assertEquals("nothing is lost", text, String.join(" ", p));
  }

  @Test public void aWallOfWordsIsCutBetweenWords() {
    StringBuilder b = new StringBuilder();
    for (int i = 0; i < 80; i++) b.append("word").append(i).append(' ');
    List<String> p = VoiceText.pieces(b.toString(), 100);
    for (String piece : p) {
      assertTrue(piece.length() <= 100);
      assertFalse("never mid-word: " + piece, piece.endsWith("wor"));
    }
  }

  @Test public void captions() {
    assertEquals("Listening…", VoiceText.caption("Listening…", 40));
    String c = VoiceText.caption("Your phone has 128 GB in total and about 40 GB of it is free right now", 30);
    assertTrue(c, c.endsWith("…"));
    assertTrue(c, c.length() <= 31);
    assertEquals("", VoiceText.caption(null, 30));
  }

  @Test public void recognizerErrors() {
    assertEquals("silence", VoiceText.errorWord(7));
    assertEquals("silence", VoiceText.errorWord(6));
    assertEquals("permission", VoiceText.errorWord(9));
    assertEquals("network", VoiceText.errorWord(2));
    assertEquals("client", VoiceText.errorWord(5));
    assertTrue(VoiceText.sayError("silence").startsWith("I didn't hear anything"));
    assertTrue(VoiceText.sayError("unclear").startsWith("I heard you"));
    assertFalse(VoiceText.greeting(3).isEmpty());
  }

  @Test public void picksTheMostNaturalVoice() {
    // Google's neural voice (quality 400) beats the old robotic one (300).
    int neural = VoiceText.voiceScore("en", "US", 400, false, true, "en", "US", true);
    int legacy = VoiceText.voiceScore("en", "US", 300, false, true, "en", "US", true);
    assertTrue(neural > legacy);
    // The person's country first among equals; on the phone over online-only.
    assertTrue(VoiceText.voiceScore("en", "GB", 400, false, true, "en", "GB", true) > VoiceText.voiceScore("en", "US", 400, false, true, "en", "GB", true));
    assertTrue(VoiceText.voiceScore("en", "US", 400, false, true, "en", "US", true) > VoiceText.voiceScore("en", "US", 400, true, true, "en", "US", true));
    // Unusable: another language, not downloaded, online-only while offline.
    assertEquals(-1, VoiceText.voiceScore("fr", "FR", 500, false, true, "en", "US", true));
    assertEquals(-1, VoiceText.voiceScore("en", "US", 500, false, false, "en", "US", true));
    assertEquals(-1, VoiceText.voiceScore("en", "US", 500, true, true, "en", "US", false));
    assertEquals("English (US) · tpf", VoiceText.voiceLabel("en-us-x-tpf-local", "English", "US", false));
    assertEquals("English (US) · iom · online", VoiceText.voiceLabel("en-us-x-iom-network", "English", "US", true));
  }

  @Test public void loudnessFollowsTheVoice() {
    // A 16-bit mono WAV: 100 ms of quiet, then 100 ms of loud.
    int rate = 1000, n = 200;
    byte[] wav = new byte[44 + n * 2];
    System.arraycopy("RIFF".getBytes(), 0, wav, 0, 4);
    System.arraycopy("WAVEfmt ".getBytes(), 0, wav, 8, 8);
    wav[16] = 16; wav[20] = 1; wav[22] = 1;
    wav[24] = (byte) (rate & 0xff); wav[25] = (byte) (rate >> 8);
    wav[34] = 16;
    System.arraycopy("data".getBytes(), 0, wav, 36, 4);
    int size = n * 2;
    wav[40] = (byte) (size & 0xff); wav[41] = (byte) (size >> 8);
    for (int i = 0; i < n; i++) {
      short v = (short) (i < 100 ? 100 : 20000);
      wav[44 + 2 * i] = (byte) (v & 0xff);
      wav[45 + 2 * i] = (byte) (v >> 8);
    }
    float[] env = VoiceText.loudness(wav, 50);
    assertEquals(4, env.length);
    assertTrue(env[0] < 0.1f);
    assertEquals(1f, env[3], 0.001f);
    assertNull(VoiceText.loudness(new byte[] { 1, 2, 3 }, 50));
  }

  @Test public void listensAgainOnlyBeforeAnyoneSpoke() {
    // Samsung-style "no match" a second after the orb opened: listen again.
    assertTrue(VoiceText.listenAgain("silence", false, 8_000, 0));
    assertTrue(VoiceText.listenAgain("busy", false, 8_000, 0));
    // Someone spoke: their "no match" is the answer.
    assertFalse(VoiceText.listenAgain("silence", true, 8_000, 0));
    // Out of time or tries, or an error a restart can't fix.
    assertFalse(VoiceText.listenAgain("silence", false, 1_000, 0));
    assertFalse("one quiet retry is the cap: every try is a microphone sound", VoiceText.listenAgain("silence", false, 8_000, 1));
    assertFalse("a retry with no time left to hear anyone is not worth a chime", VoiceText.listenAgain("silence", false, 5_000, 0));
    assertFalse(VoiceText.listenAgain("permission", false, 8_000, 0));
    assertFalse(VoiceText.listenAgain("network", false, 8_000, 0));
  }

  @Test public void theGreetingComingBackIsNotThePerson() {
    assertTrue(VoiceText.greetingEcho("Yes?", "Yes?"));
    assertTrue(VoiceText.greetingEcho("yes", "Yes?"));
    assertTrue(VoiceText.greetingEcho("Mm", "Mm-hm?"));
    assertTrue("a half-heard word still fits", VoiceText.greetingEcho("I'm", "I'm here."));
    assertTrue("a middle word fits", VoiceText.greetingEcho("here", "I'm here."));
    assertTrue("punctuation and case do not matter", VoiceText.greetingEcho("  YES!  ", "Yes?"));
    assertFalse("a real request is not the greeting", VoiceText.greetingEcho("open maps", "Yes?"));
    assertFalse("a longer sentence is the person", VoiceText.greetingEcho("yes, open maps", "Yes?"));
    assertFalse(VoiceText.greetingEcho("what's the battery", "I'm here."));
    assertFalse(VoiceText.greetingEcho("", "Yes?"));
    assertFalse(VoiceText.greetingEcho(null, "Yes?"));
    assertFalse("no greeting was said, nothing to filter", VoiceText.greetingEcho("Yes?", ""));
    assertFalse(VoiceText.greetingEcho("hi", "No."));
  }

  @Test public void everyGreetingIsCaughtAsItsOwnEcho() {
    for (String hi : new String[] { "Yes?", "Mm-hm?", "I'm here." }) {
      assertTrue("its own words: " + hi, VoiceText.greetingEcho(hi, hi));
    }
  }
}
