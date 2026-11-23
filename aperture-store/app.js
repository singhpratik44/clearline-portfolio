"use strict";

const display = document.querySelector("#hero-display");
const deckButtons = display.querySelectorAll("[data-deck]");
const deckCaption = display.querySelector(".deck-caption");
const deckLabels = {
  logic: "Family Logic · 10 activities",
  basketball: "Basketball IQ · 8 decisions",
};

for (const button of deckButtons) {
  button.addEventListener("click", () => {
    const mode = button.dataset.deck;
    display.dataset.mode = mode;
    deckCaption.textContent = deckLabels[mode];

    for (const option of deckButtons) {
      option.setAttribute("aria-pressed", String(option === button));
    }
  });
}

for (const sample of document.querySelectorAll(".sample")) {
  const choices = sample.querySelectorAll("[data-feedback]");
  const feedback = sample.querySelector(".feedback");

  for (const choice of choices) {
    choice.addEventListener("click", () => {
      for (const option of choices) {
        option.setAttribute("aria-pressed", String(option === choice));
      }

      feedback.textContent = choice.dataset.feedback;
      feedback.dataset.result = choice.hasAttribute("data-correct") ? "correct" : "retry";
    });
  }
}

const menu = document.querySelector(".mobile-menu");

for (const anchor of menu.querySelectorAll("a")) {
  anchor.addEventListener("click", () => {
    menu.open = false;
  });
}

menu.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.open) {
    menu.open = false;
    menu.querySelector("summary").focus();
  }
});
