package com.novaizuki.mobile;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
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
    assertEquals("I didn't catch that.", VoiceText.sayError("silence"));
    assertFalse(VoiceText.greeting(3).isEmpty());
  }
}
