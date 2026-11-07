# Document channel diagnosis — the PDF ask that was answered by the brain report

The owner attached `Part_4_Filled_Original_Template.pdf`, typed
"Help me fix this PDF" — and Izuki answered with an unrelated model-status
report ("N of my M AI brains are benched… / the model itself is thinking…").
This file records why, without a single hardcoded rule for that PDF.

## The pipeline, as it stands

1. Chat picker → `readChatFile` (src/lib/attachments.ts) base64s the file and
   calls `api.readChatAttachment`.
2. Backend `attachments::read` extracts real text (PDF via `lopdf`, DOCX and
   PPTX via the OOXML text, page/slide markers kept) up to 32k characters.
3. Front end composes the ask: the typed words first, then each file behind
   `\n\n[Attached file: …] … [End attached file]` markers
   (`attachmentContext`).
4. `chat.rs` picks up the last user turn and runs intent checks on
   `turn.content` — the composed string, document text included.

## Root cause (general, not PDF-specific)

`diagnosis::wants` fires when the text contains a word that means Izuki
("you", "your"…) **and** a trouble word ("fail", "cannot", "stuck"…). A
filled template's own boilerplate legitimately uses all of those ("If you
fail to provide the details, your claim cannot be processed"). Scanned from
the composed ask, the document's body misroutes the person's real document
request into the "why are you slow" answer — no model call, no glance at
the document. The same inflated text also fed `brain::needs_thought`, so
even when a brain did answer, the routing saw the document's wording, not
the person's.

## The fix

`attachments::typed_only` cuts the composed content at the first attachment
marker and returns what the person typed. The chat pipeline's intent
checks (both `diagnosis::why` call sites and `needs_thought`) now run on
that. Regression test in `chat.rs` (`a_document_request_is_never_answered_as_
a_complaint_about_the_brains`) reproduces the composed shape of the
owner's request and asserts the diagnosis path stays silent; `attachments.rs`
tests pin the marker-cutting itself.

## What this does not cover yet (next increments)

- XLSX workbooks are now readable; XLSX **editing** and the edited-file
  deliverable flow land with the editing engine.
- DOCX/PPTX editing, PDF form fill and PDF reconstruction are separate
  increments behind the same engine, each with its own fixtures.
- The response rule: a document request never becomes a model-status answer;
  status replies stay for when the person asks about the model or a real
  failure needs explaining.
