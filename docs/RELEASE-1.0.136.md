# Izuki 1.0.136: Empire part two — your money, your shop, and your business on your phone

## 🛑 Izuki never presses Submit on its own any more
On a uCertify test, Izuki answered question after question and then **submitted the test by itself**. "Ask before submitting" was only an instruction to the AI, and the backup model ignored it.

Now it's a hard rule in Izuki's own code, so no AI can skip it:
- **Final buttons are never pressed unless you said so in that request.** That covers Submit, End test, Finish attempt, Hand in, Send, Pay, Buy, Place order, Delete, Post and Publish. Izuki stops right before them and asks: "Want me to submit it?"
- **On a quiz or test, you pick the answers.** Izuki reads the question with you, explains the idea, points at the key words, and tells you why your answer is right or wrong. It doesn't click answers or move through the test for you, because that would be Izuki taking your test. Homework practice and worksheets work as before.

Everything here is **read only**. Izuki never moves money, pays, refunds, buys, sells or changes anything.

## 💰 Your bank statement, understood (Apps → Money)
Download a statement (CSV) from your bank's website and press **Import a statement**. Izuki reads Chase-style, UK-style (money in / money out) and "type column" statements, and skips lines it already has. Then:
- **This month, at a glance:** money in, money out, and what you kept, plus a six-month chart.
- **Where it went:** spending by category (food, rent, subscriptions, transport, bills…). Moving money to your own savings isn't counted as spending.
- **Worth a look:**
  - a charge far above normal for its kind;
  - the same charge twice within two days (a double charge?);
  - a category well over its usual month.
- **Every month:** your subscriptions and what they cost a month and a year. The ones whose price went up are marked ↑.

Or just ask: "how much did I spend this month?", "any unusual spending?", "what subscriptions am I paying for?"

It all stays on this PC.

## 📈 A watchlist
"Add Apple to my watchlist", "how are my stocks?" Prices and today's move only. It's never advice, and Izuki never buys or sells.

## 🛍️ Stripe and Shopify
In Apps → Money → Shop & payments, connect:
- **Stripe** with a *restricted* key that can only read.
- **Shopify** with your store's address and an Admin API token that can only read orders and products.

Then ask "how are sales today?", "how much did I make this month?", "any new orders?" or "what's low on stock?"

The keys stay on this PC. They're never written to the log, and never sent to your phone.

**Not tested with a real Stripe or Shopify account yet.** Your first try is the first test, so tell me what it says.

## ✋ "What needs my attention?" now includes all of it
The briefing now also covers Shopify orders waiting to be sent, low stock, today's Stripe sales, unusual charges and subscriptions that went up. It still ends with what it checked and what it couldn't.

## 📱 Your business on your phone
Open **Touch Grass** on your phone: a new **Your business** section shows:
- this month's money in and out;
- unusual charges and subscriptions;
- Stripe and Shopify;
- each website's last check.

Only your paired phone can see it.
