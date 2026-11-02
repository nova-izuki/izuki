(function(root) {
  // Is this page a graded assessment, a practice exercise, or neither? The
  // same rule as the desktop app's assess.rs, line for line, and both pass
  // tools/assessment-cases.json:
  //
  // - Any graded sign (points, attempts, a timer, a proctor, "submit quiz",
  //   a due date): graded, even when the page also says "practice".
  // - Practice signs and none of those: practice. Izuki may pick answers.
  // - Quiz-like with no evidence either way: graded.
  // - Not quiz-like: nothing here applies.
  //
  // What the page says decides it, never what someone says about it.
  const GRADED=["points possible"," pts"," points)","(1 point","(2 points","attempt 1 of","attempt 2 of","attempts remaining","attempts allowed",
    "attempts left","attempt due","time remaining","time left","time limit","timer","submit quiz","submit test","submit exam",
    "submit assessment","finish attempt","submit for grading","save and submit","submit all and finish","proctor","lockdown browser",
    "honorlock","respondus","proctorio","counts toward","count toward","graded quiz","graded test","graded assessment",
    "midterm","final exam","due date","due:","% of your grade","of your final grade","marked out of"];
  // Taken out before looking for graded signs ("does not count toward" holds
  // "count toward"; "ungraded quiz" holds "graded quiz").
  const NOT_GRADED=["does not count toward","doesn't count toward","won't count toward","will not count toward","not count toward",
    "not part of your grade","won't be graded","will not be graded","not graded","ungraded"];
  const PRACTICE=["practice quiz","practice test","practice exam","practice question","practice set","practice mode","practice problems",
    "self-check","self check","selfcheck","ungraded","not graded","won't be graded","will not be graded","does not count",
    "doesn't count","won't count","will not count","no grade","for practice","study mode","flashcard","learn mode",
    "test yourself","quiz yourself","check your understanding","try it yourself","sample question","example question",
    "demo quiz","demonstration"];
  // (" exam", not "exam": "example" isn't one.)
  const QUIZ_LIKE=["quiz"," test"," exam","assessment","midterm","knowledge check"];

  function kind(title,url,text) {
    // (A space in front: "Test 3 …" at the very start is " test".)
    const words=` ${String(title||"").toLowerCase()} ${String(url||"").toLowerCase()} ${Array.from(String(text||"")).slice(0,6000).join("").toLowerCase()}`;
    const has=w=>words.includes(w);
    const quizLike=QUIZ_LIKE.some(has)||(has("question ")&&has(" of "))||PRACTICE.some(has);
    if(!quizLike)return "none";
    const saidUngraded=NOT_GRADED.reduce((w,n)=>w.split(n).join(" "),words);
    if(GRADED.some(w=>saidUngraded.includes(w)))return "graded";
    if(PRACTICE.some(has))return "practice";
    return "graded";
  }
  function canDo(which) {
    if(which==="practice")return "This page says it's practice, so I pick each answer and go to the next question. You press Submit.";
    if(which==="graded")return "This looks like a graded quiz or test, so I explain each question and suggest an answer with the reason. You choose it on the page.";
    return "";
  }
  root.IzukiAssess={kind,canDo};
})(globalThis);
