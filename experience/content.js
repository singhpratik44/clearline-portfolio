/**
 * APERTURE Experience Layer — content registry.
 * Non-clinical invitations, not assessments, treatment, or productivity scores.
 * Feel free to add a path with four steps; the UI renders them from this data.
 */
export const experiences = Object.freeze([
  {
    id: 'awareness',
    name: 'Awareness',
    verb: 'Notice',
    symbol: '◉',
    hue: 'lavender',
    short: 'Meet the moment as it is.',
    intro: 'There is nothing you need to fix to begin.',
    steps: [
      { title: 'Arrive right here.', text: 'Look around. Give your attention to something simple and real.', activity: { type: 'choice', label: 'Begin with one sense', options: ['Something I can see', 'Something I can hear', 'Something I can feel'], response: 'Let that one detail be enough for now.' } },
      { title: 'Find an easy rhythm.', text: 'Follow a breath only if it feels comfortable. Natural breathing is perfectly fine.', activity: { type: 'breath' } },
      { title: 'Notice without judging.', text: 'How would you describe this moment? Every answer is welcome.', activity: { type: 'choice', label: 'Choose a word, or leave it open', options: ['Still', 'Busy', 'Curious', 'Not sure'], response: 'You can notice a feeling without becoming it.' } },
      { title: 'Nothing else is required.', text: 'You may carry your attention forward, or simply enjoy a little stillness.', activity: { type: 'pause' } },
    ],
    closing: 'You noticed. That is enough.'
  },
  {
    id: 'joy',
    name: 'Joy',
    verb: 'Appreciate',
    symbol: '✳',
    hue: 'peach',
    short: 'Make room for what is good.',
    intro: 'Joy can be tiny, quiet, surprising, or simply absent today. All are welcome.',
    steps: [
      { title: 'Find one bright detail.', text: 'It could be a person, a memory, a color, a sound, or a moment of relief.', activity: { type: 'choice', label: 'Where might you look?', options: ['A person', 'A place', 'A small moment'], response: 'Even a small source of goodness deserves attention.' } },
      { title: 'Stay with what matters.', text: 'Notice why this detail has meaning to you—without analyzing it too much.', activity: { type: 'reflection', label: 'A sentence, just for you', placeholder: 'One thing I appreciate is…' } },
      { title: 'Let joy be simple.', text: 'You do not have to be cheerful or grateful on command. You can choose a gentle invitation instead.', activity: { type: 'choice', label: 'Try a little delight', options: ['Remember a favorite song', 'Look at the sky', 'Smile at something small'], response: 'You are free to skip this and simply be.' } },
      { title: 'Carry a little light.', text: 'If something felt good, you can enjoy it without needing to make it productive.', activity: { type: 'pause' } },
    ],
    closing: 'A small good thing is still good.'
  },
  {
    id: 'love',
    name: 'Love',
    verb: 'Care',
    symbol: '♡',
    hue: 'rose',
    short: 'Turn attention into care.',
    intro: 'Care can be offered quietly, even when no one sees.',
    steps: [
      { title: 'Choose where care goes.', text: 'Kindness might begin with yourself, another person, or the wider world.', activity: { type: 'choice', label: 'Who comes to mind?', options: ['Myself', 'Someone I know', 'My community'], response: 'Care can be gentle and does not need to be earned.' } },
      { title: 'Imagine a kind action.', text: 'Consider a small act that respects your energy and their boundaries.', activity: { type: 'choice', label: 'One possible action', options: ['Listen with attention', 'Send encouragement', 'Make space for rest'], response: 'The smallest thoughtful action can matter.' } },
      { title: 'Give it words.', text: 'Write a message to yourself or someone else. It stays here unless you choose to copy it.', activity: { type: 'reflection', label: 'A private note of care', placeholder: 'I want you to know…' } },
      { title: 'Love without a score.', text: 'There is no checklist to complete and no proof to provide. Your intention is yours.', activity: { type: 'pause' } },
    ],
    closing: 'Care is meaningful, even when it is quiet.'
  },
  {
    id: 'wonder',
    name: 'Wonder',
    verb: 'Explore',
    symbol: '✧',
    hue: 'mint',
    short: 'Open a door to possibility.',
    intro: 'Not every question needs an answer.',
    steps: [
      { title: 'Follow a spark.', text: 'Start with a question that makes the world feel a little larger.', activity: { type: 'ideas', options: ['What might the ocean still be hiding?', 'How might a small kindness travel?', 'What would a city designed for wonder feel like?', 'What would I try if I could begin imperfectly?', 'What could nature teach us about cooperation?'] } },
      { title: 'Imagine beyond the usual.', text: 'What if the opposite of an assumption were possible? Play with one unexpected idea.', activity: { type: 'reflection', label: 'An unfinished possibility', placeholder: 'What if…' } },
      { title: 'Give curiosity a direction.', text: 'Exploration can happen through making, asking, reading, or simply observing.', activity: { type: 'choice', label: 'Choose a playful direction', options: ['Ask someone a question', 'Make a tiny sketch', 'Look more closely'], response: 'You can follow this later—or not at all.' } },
      { title: 'Leave the door open.', text: 'The mystery does not need to end. Wonder is valuable before it becomes knowledge.', activity: { type: 'pause' } },
    ],
    closing: 'The world is still full of possibility.'
  },
]);