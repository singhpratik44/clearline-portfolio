(() => {
  "use strict";
  const form = document.getElementById("gg-filters");
  const grid = document.getElementById("gg-results");
  const reset = document.getElementById("gg-reset");
  const count = document.getElementById("gg-count");
  const cards = Array.from(grid.children);
  const person = document.getElementById("gg-person");
  const occasion = document.getElementById("gg-occasion");
  const budget = document.getElementById("gg-budget");

  function filterGifts() {
    const limit = budget.value === "any" ? Infinity : Number(budget.value);
    const specific = [];
    const general = [];
    cards.forEach(card => {
      const people = card.dataset.recipients.split(" ");
      const moments = card.dataset.occasions.split(" ");
      const broad = people.includes("any");
      const fitsPerson = person.value === "all" || broad || people.includes(person.value);
      const fitsOccasion = occasion.value === "all" || moments.includes(occasion.value);
      card.hidden = !(fitsPerson && fitsOccasion && Number(card.dataset.price) <= limit);
      if (!card.hidden) {
        if (broad && person.value !== "all") general.push(card);
        else specific.push(card);
      }
    });
    // Keep tailored activities together. The free greeting also works for any recipient.
    const visible = specific.concat(general);
    visible.forEach(card => grid.appendChild(card));
    count.textContent = visible.length === 1 ? "1 gift idea" : visible.length + " gift ideas";
    reset.hidden = person.value === "all" && occasion.value === "all" && budget.value === "0";
  }
  form.addEventListener("change", filterGifts);
  form.addEventListener("submit", event => event.preventDefault());
  reset.addEventListener("click", () => {
    form.reset();
    filterGifts();
    person.focus();
  });
  // An earlier shop filter may have hidden the product reached by these in-page links.
  grid.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link || !["#player-collection", "#coach-collection"].includes(link.getAttribute("href"))) return;
    const product = document.querySelector(link.getAttribute("href"));
    if (product && (product.hidden || getComputedStyle(product).display === "none")) {
      document.querySelector('.product-filter[data-filter="all"]')?.click();
    }
  });
  form.hidden = false;
  filterGifts();
})();
