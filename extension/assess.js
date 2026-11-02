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
  const GRADED=["points possible"," pts"," points)","(1 point","(2 points","attempts remaining","attempts allowed",
    "attempts left","attempt due","time remaining","time left","time limit","timer","submit quiz","submit test","submit exam",
    "submit assessment","finish attempt","submit for grading","save and submit","submit all and finish","proctor","lockdown browser",
    "honorlock","respondus","proctorio","counts toward","count toward","graded quiz","graded test","graded assessment",
    "midterm","final exam","due date","due:","% of your grade","of your final grade","marked out of"];
  // Taken out before looking for graded signs ("does not count toward" holds
  // "count toward"; "ungraded quiz" holds "graded quiz").
  const NOT_GRADED=["does not count toward","doesn't count toward","won't count toward","will not count toward","not count toward",
    "not part of your grade","won't be graded","will not be graded","not graded","ungraded"];
  // A practice NAME counts only in the page's own title, address or main
  // heading (a sidebar "Practice quiz" link names a different quiz)...
  const PRACTICE_NAMES=["practice quiz","practice test","practice exam","practice question","practice set","practice mode","practice problems",
    "self-check","self check","selfcheck","ungraded","study mode","flashcard","learn mode","sample question",
    "example question","demo quiz","demonstration"];
  // ...a SENTENCE saying the activity isn't graded counts anywhere.
  const PRACTICE_SAYS=["not graded","won't be graded","will not be graded","does not count","doesn't count","won't count","will not count",
    "not part of your grade","is ungraded","an ungraded","is a practice","is for practice","for practice only",
    "test yourself","quiz yourself","check your understanding","try it yourself"];
  // (" exam", not "exam": "example" isn't one.)
  const QUIZ_LIKE=["quiz"," test"," exam","assessment","midterm","knowledge check"];
  // Grading signs no ordinary page has: alone they make a page an assessment
  // ("Homework 2 · Attempts remaining"). A due date or a timer doesn't.
  const ASSESSMENT_ONLY=["points possible","(1 point","(2 points"," points)","attempts remaining","attempts allowed",
    "attempts left","attempt due","submit quiz","submit test","submit exam","submit assessment","finish attempt",
    "submit for grading","submit all and finish","proctor","lockdown browser","honorlock","respondus","proctorio",
    "graded quiz","graded test","graded assessment","final exam","% of your grade","of your final grade","marked out of"];
  // School-work words: in the page's own title or address, with a score
  // ("1 point"), the page is an assessment. Elsewhere they prove nothing
  // ("Have a question?" at a checkout); points are then a shop's.
  const SCHOOL=["exercise","homework","assignment","worksheet","problem set","lesson","chapter","module","question","course"];
  // "1 point", "(2 points)", "10 pts", "0.5 pt": a score on the page.
  // (The same whitespace as Rust's is_ascii_whitespace.)
  const POINTS=/[0-9][ \t\n\r\f]*(?:point|pt)s?(?![a-z])/;
  // "Attempt 3 of 3" (any number), and a numbered question ("question 1").
  const ATTEMPT=/attempt[ \t\n\r\f]*[0-9]+[ \t\n\r\f]*of/,NUMBERED_QUESTION=/question[ \t\n\r\f]*[0-9]/;

  function kind(title,url,text) {
    // The page itself: title (plus its main heading, in the extension) and
    // address ("practice-quiz" reads as "practice quiz").
    const page=` ${String(title||"").toLowerCase()} ${String(url||"").toLowerCase().replace(/[-_]/g," ")} `;
    // Grading signs anywhere count, however long the page (bounded).
    const words=`${page}${Array.from(String(text||"")).slice(0,200000).join("").toLowerCase()}`;
    const has=w=>words.includes(w);
    const named=PRACTICE_NAMES.some(w=>page.includes(w)),says=PRACTICE_SAYS.some(has);
    const saidUngraded=NOT_GRADED.reduce((w,n)=>w.split(n).join(" "),words);
    const points=POINTS.test(saidUngraded),attempt=ATTEMPT.test(saidUngraded);
    const school=SCHOOL.some(w=>page.includes(w))||NUMBERED_QUESTION.test(words);
    // Grading evidence before "no quiz at all": "Exercise 4" + "1 point" is graded.
    const quizLike=QUIZ_LIKE.some(has)||(has("question ")&&has(" of "))||named||says
      ||ASSESSMENT_ONLY.some(w=>saidUngraded.includes(w))||attempt||(points&&school);
    if(!quizLike)return "none";
    if(GRADED.some(w=>saidUngraded.includes(w))||points||attempt)return "graded";
    if(named||says)return "practice";
    return "graded";
  }
  function canDo(which) {
    if(which==="practice")return "This page says it's practice, so I pick each answer and go to the next question. You press Submit.";
    if(which==="graded")return "This looks like a graded quiz or test, so I explain each question and suggest an answer with the reason. You choose it on the page.";
    return "";
  }
  root.IzukiAssess={kind,canDo,points:t=>POINTS.test(String(t).toLowerCase())};
})(globalThis);
