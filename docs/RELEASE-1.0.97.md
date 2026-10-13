# Izuki 1.0.97: tasks keep going until they're done

## No more stopping halfway
Your log showed Izuki saying things like "Opening Blackboard for you now" or "Let me wait for the Blackboard page to finish loading", and then the task just ended with nothing done. A round with no click in it only got a second look in the first two rounds. After that, it counted as the end.

Now any round that says it's about to do something, or asks to wait for a page, gets another look at the screen and carries on. If that happens 4 times in a row (a page that really won't come), Izuki says so plainly, and "keep going" picks up where it stopped.

## A blank page means "still loading"
Blackboard can sit blank for several seconds with no busy cursor and no Stop button, so Izuki thought it had failed and opened it again. Now, in a browser on a real web address, a page with no words on it yet counts as still loading, and Izuki waits for it.

After 15 seconds it's treated as a page that just has no text, like a game or a drawing app, so it never waits on those forever. Reloading the page later starts a fresh wait.

## Reviewed
- **Tests:** 3 new Rust tests, 255 in all, all passing.
- **CodeRabbit:** 1 finding fixed (a reload of the same page now gets its own wait).
