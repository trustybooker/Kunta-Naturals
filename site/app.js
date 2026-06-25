const quiz = document.getElementById('ritualQuiz');
const result = document.getElementById('quizResult');

const recommendations = {
  'Glow Ritual': 'Your ritual type is the Glow Ritual. Start with the free guide, then use the 7-Day Body Ritual Guide. Suggested starter products: luffa, body oil, body butter.',
  'Fresh Ritual': 'Your ritual type is the Fresh Ritual. Start with the free guide and the Fresh Ritual product checklist. Suggested starter products: gentle soap, luffa, shower filter.',
  'Scent Ritual': 'Your ritual type is the Scent Ritual. Start with the Natural Glow + Scent Ritual Bundle. Suggested starter products: body oil, fragrance oil, candle.',
  'Scalp Ritual': 'Your ritual type is the Scalp Ritual. Start with the Hair & Scalp Ritual Kit. Suggested starter products: scalp brush, hair oil, satin or silk night accessory.',
  'Calm Ritual': 'Your ritual type is the Calm Ritual. Start with the 5-day email course. Suggested starter products: candle, incense, warm towel, evening reset checklist.'
};

quiz?.addEventListener('submit', (event) => {
  event.preventDefault();
  const selected = new FormData(quiz).get('ritual');
  result.style.display = 'block';
  result.textContent = selected ? recommendations[selected] : 'Choose one answer to reveal your ritual type.';
});
