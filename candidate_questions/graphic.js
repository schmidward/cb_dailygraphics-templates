console.clear();

var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var Scrapple = require("./scrapple");
var dot = require("./lib/dot");
var $ = require("./lib/qsa");

var home = dot.compile(require("./_home.html.js"));
var candidateTemplate = dot.compile(require("./_candidate.html.js"));
var questionTemplate = dot.compile(require("./_question.html.js"));

var router = new Scrapple();
var container = $.one(".app");

var candidates = window.CANDIDATES;
var questions = window.QUESTIONS;

// lookup table
var named = {};
for (var c of candidates) {
  named[c.short] = c;
}

router.add("/", function () {
  container.innerHTML = home({ candidates, questions });
  var head = container.querySelector("[data-focus]");
  head.focus();
});

router.add("/candidate/:id", function (e) {
  var { id } = e.params;
  var candidate = named[id];
  var compare = true;
  container.innerHTML = candidateTemplate({ candidate, questions, compare });
  $("blockquote a").forEach((el) => el.setAttribute("target", "_blank"));
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  var head = container.querySelector("[data-focus]");
  head.focus();
});

router.add("/question/:id", function (e) {
  var q = questions.find((q) => q.short == e.params.id);
  var qIndex = questions.indexOf(q);
  var nextIndex = (qIndex + 1) % questions.length;
  var { question, short, reader = false } = q;
  var { question: nextQuestion, short: nextID } = questions[nextIndex];
  container.innerHTML = questionTemplate({
    reader,
    question,
    short,
    candidates,
    questions,
    nextQuestion,
    nextID,
  });
  $("blockquote a").forEach((el) => el.setAttribute("target", "_blank"));
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  var head = container.querySelector("[data-focus]");
  head.focus();
});
