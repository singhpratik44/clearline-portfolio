const base = "https://singhpratik44.github.io/clearline-portfolio/gifts/holiday-thank-you/";
const cap = (value, length) => Array.from(typeof value === "string" ? value.trim() : "").slice(0, length).join("");

export function prepareHolidayPostcard({recipient, sender, message, design} = {}) {
  const params = new URLSearchParams({
    card: "1", design: design === "stars" ? "stars" : "grove",
    to: cap(recipient, 35), from: cap(sender, 35), note: cap(message, 200)
  });
  const shareUrl = base + "#" + params.toString();
  return {
    title: "A holiday thank-you postcard", shareUrl, blankPdfUrl: base + "holiday-thank-you-postcards.pdf",
    emailSubject: "A holiday thank-you for you", emailBody: "I made you a holiday postcard. Open it here:\n" + shareUrl,
    sent: false, notice: "Anyone with the complete link can read the note. Choose the recipient and review before sending."
  };
}
