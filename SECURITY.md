# Security policy

Izuki drives a real mouse and keyboard, so security reports get priority.

## Reporting a vulnerability

Email **izuki.hq@gmail.com** with **"Security"** in the subject. Please include:

- the Izuki version (it's shown in Settings);
- what an attacker could do;
- the steps to reproduce it.

Please don't open a public issue or post details until a fix is released. We'll reply as soon as we can, and credit you in the release notes if you'd like.

## Supported versions

Only the latest release gets fixes. Izuki updates itself, and every update is signed and checked before it installs (minisign key ID `079F8F3DAA47A42C`).

## Verifying a download

See [nova-izuki.github.io/izuki/security](https://nova-izuki.github.io/izuki/security/): it explains how to compare your installer's SHA-256 with the one GitHub publishes, and why Windows SmartScreen warns about an installer that isn't code-signed yet.
