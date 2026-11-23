(() => {
  const key = new URLSearchParams(location.search).get('kit') === 'basketball-iq' ? 'basketball-iq' : 'family';
  const product = window.APERTURE_PRODUCTS[key];
  const text = (id, value) => { document.getElementById(id).textContent = value; };
  document.title = product.title + ' · APERTURE';
  text('title', product.title); text('cover-title', product.title); text('intro', product.intro); text('age', product.age);
  text('instructions', product.instructions); text('answers', product.answers); text('bonus', product.bonus);
  const parent = document.getElementById('activities');
  product.quests.forEach(([title, question, hint], index) => {
    const section = document.createElement('section'); section.className = 'activity';
    const label = document.createElement('p'); label.className = 'eyebrow'; label.textContent = 'ACTIVITY ' + (index + 1);
    const heading = document.createElement('h2'); heading.textContent = title;
    const prompt = document.createElement('p'); prompt.textContent = question;
    const details = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'A hint to get you started';
    const help = document.createElement('p'); help.textContent = hint; details.append(summary, help);
    const response = document.createElement('div'); response.className = 'response'; response.setAttribute('aria-hidden', 'true'); response.textContent = 'Your idea, drawing or explanation';
    section.append(label, heading, prompt, details, response); parent.append(section);
  });
  const buy = document.getElementById('buy');
  buy.href = key === 'family' ? 'https://buy.stripe.com/3cI9AV50i6o46bOdwl6kg07' : 'https://buy.stripe.com/28E14p8cu7s857K0Jz6kg0v';
  buy.setAttribute('aria-label', 'Buy the ' + product.title + ' household-use license for 15 US dollars on Stripe');
  document.getElementById('print').addEventListener('click', () => window.print());
  document.getElementById('to').addEventListener('input', event => { const value = event.target.value.trim(); text('to-label', value || 'a curious thinker'); text('certificate-name', value || 'your household'); });
  document.getElementById('from').addEventListener('input', event => text('from-label', event.target.value.trim() || 'your household'));
})();
