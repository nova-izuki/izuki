# Izuki 1.0.199: a free NVIDIA brain, set up for you

NVIDIA offers free AI models, and Izuki can now walk you through getting one: where to get the key, what the free tier means, and which of NVIDIA's free models actually fit Izuki.

## 🟩 A free NVIDIA brain in three steps

Open **Settings → Izuki's brain → NVIDIA NIM**:

1. **Open build.nvidia.com.** Sign in, or join the free NVIDIA Developer Program. No card is needed; NVIDIA may check your phone number.
2. **Generate an API key** under Settings → API Keys and copy it. It starts with `nvapi-`. Izuki picks it up when you copy it, or you can paste it in.
3. **Find free models.** Izuki tries the free models on your key and lists the ones that answered:
   - each is marked "sees your screen" or "chat only", with how long it took;
   - the best one is marked;
   - there's a **Use** button on each.

When you copy a new key, Izuki runs the search by itself, and if the model already set didn't answer, it switches to the best one.

**Why Izuki tests the models first:** NVIDIA changes its free models every few weeks, and its list still names some that no longer answer. So Izuki tries each likely one for real. A model that's meant to see your screen is shown a small red square and has to say "red".

**What the free tier means**, said plainly in the guide:
- it's for trying things out, not for running a business on: NVIDIA's trial terms rule out production use;
- about 40 requests a minute;
- not offered in every country;
- NVIDIA records free-tier requests and may use them to improve its models, so keep private things off the screen while NVIDIA is Izuki's brain.

## Fixes

- **Gemma 4 31B, NVIDIA's default here,** was mistaken for a tiny model and left out of screen work. It's used again.
- **Your key travels only protected (https)**, or to a server on your own PC. An address that only looked local, such as `127.example.com`, no longer counts as your PC.

## Checked before release

- **Automatic checks:** the full Rust suite (including the new model-picking, address and size tests), the TypeScript check, the frontend build and the Windows and web CI jobs all pass on the release commit.
- **Not yet tried:** the model search hasn't been run with a real NVIDIA key. If it lists nothing or shows an error, please say so.

---

Free, as always. No account, no subscription, nothing to pay.
