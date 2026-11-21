/* APERTURE World Builder starters. Each choice gives a destination, a change
   in the world's resource, and the amount needed before taking that choice. */
(() => {
  "use strict";

  function choice(label, to, delta = 0, need = 0) {
    return { label, to, delta, need };
  }

  function scene(id, name, text, choices = []) {
    return { id, name, text, ending: choices.length === 0, choices };
  }

  const bellKites = {
    title: "The bell-kite race",
    description: "Two kites signal the start of a rooftop race. Choose a route through the wind and decide which kite should ring the bell.",
    variable: "Wind",
    start: "roof",
    initial: 1,
    scenes: [
      scene("roof", "Ready on the roof", "Your kite has a tiny brass bell for a tail. Across the alley, Jo waves a striped kite. A ribbon flutters above the chimneys. Where will you aim?", [
        choice("Catch the warm air above the bakery (+2 wind)", "chimney", 2),
        choice("Skim under the clothesline (use 1 wind)", "alley", -1, 1)
      ]),
      scene("chimney", "Above the chimneys", "Warm air lifts the bell. You can see the finish hoop, but Jo's striped kite is caught on the clothesline below.", [
        choice("Dive through the hoop (use 3 wind)", "solo", -3, 3),
        choice("Follow Jo's string down", "alley")
      ]),
      scene("alley", "A knot in the line", "Jo's kite tail twists around a wooden peg. You could pull it free with a strong gust or lead it toward a gap in the line.", [
        choice("Lift both kites clear (use 2 wind)", "duet", -2, 2),
        choice("Ride the bakery breeze and return (+2 wind)", "chimney", 2),
        choice("Guide Jo through the gap", "relay")
      ]),
      scene("solo", "The first bell", "Your bell sounds over the square. The baker looks up and points at your spiral in the sky. Could the next race reward a different finish?"),
      scene("duet", "A double chime", "Your kite lifts Jo's tail off the peg. Two kites cross the hoop side by side. The little bell rings twice."),
      scene("relay", "Pass it on", "You guide Jo through the gap, then pass the bell across. A striped kite carries it through the hoop while yours draws a loop for the crowd.")
    ]
  };

  const lastBroadcast = {
    title: "Radio Moth's last minute",
    description: "An overnight radio show has three beats of airtime left. Pick whose sound reaches the sleepy neighborhood.",
    variable: "Airtime",
    start: "desk",
    initial: 3,
    scenes: [
      scene("desk", "The red light", "Rain ticks on the studio roof. The red light blinks: three beats until sign-off. A caller is waiting and a small envelope sits on the desk.", [
        choice("Listen to the caller (use 1 beat)", "caller", -1, 1),
        choice("Open the envelope", "letter")
      ]),
      scene("caller", "The night drummer", "A soft rhythm comes through the phone. “That's rain on my bucket,” a kid says. “Do you think the whole street has a song?”", [
        choice("Broadcast the rhythm (use 2 beats)", "chorus", -2, 2),
        choice("Read the envelope as well (use 1 beat)", "letter", -1, 1),
        choice("Close the show with open windows", "windows")
      ]),
      scene("letter", "A message in blue pencil", "Inside is a note: “Please make one quiet moment so my granddad can hear the first bird.” The bird outside takes a breath.", [
        choice("Give the bird the last beat (use 1)", "bird", -1, 1),
        choice("Call the drummer on air (use 1 beat)", "caller", -1, 1),
        choice("Invite everyone to listen at their own window", "windows")
      ]),
      scene("chorus", "The street plays along", "The bucket goes dum, da-dum. A spoon taps a mug three houses over. By sign-off the street has written its own chorus."),
      scene("bird", "One clear note", "You lower the fader. Through the open window comes a single birdcall. The thank-you message arrives before the red light goes dark."),
      scene("windows", "A hundred little stations", "You sign off with one request: open a window. Across the neighborhood, people hear different pieces of the same night.")
    ]
  };

  const rooftopReservoir = {
    title: "Rooftop rain lab",
    description: "In this small model, each token is a cup of stored rain. Predict where one afternoon's water can go, then rerun with a different catch or loss.",
    variable: "Water cups",
    start: "morning",
    initial: 1,
    scenes: [
      scene("morning", "Before the shower", "The storage tub holds one cup. A shower is on its way. In this model, a wide funnel collects three cups and a narrow pipe collects one.", [
        choice("Fit the wide funnel (+3 cups)", "store", 3),
        choice("Fit the narrow pipe (+1 cup)", "store", 1)
      ]),
      scene("store", "At noon", "The shower is over. Decide which setup to model until afternoon. A covered tub keeps every cup. An open tub loses one cup in the sun.", [
        choice("Cover the tub", "water"),
        choice("Leave the tub open (lose 1 cup)", "water", -1, 1)
      ]),
      scene("water", "Afternoon watering", "In this model the full bed needs three cups. A single planter needs one. You can also save the water. Compare today's possible choices with your prediction.", [
        choice("Water the full bed (use 3 cups)", "bed", -3, 3),
        choice("Water one planter (use 1 cup)", "planter", -1, 1),
        choice("Save the water for tomorrow", "saved")
      ]),
      scene("bed", "The whole bed gets water", "Three cups went to the bed. Check the cups left in storage. Could a different setup water the same bed and leave fewer cups?"),
      scene("planter", "One planter gets water", "One cup went to the planter. Check what remains. Replay with just one change to see which choices open or close."),
      scene("saved", "Tomorrow's supply", "The water remains in storage. Read the cup count before you replay. How might the result change if the open tub lost two cups instead?")
    ]
  };

  window.WorldStarters = [bellKites, lastBroadcast, rooftopReservoir];
  window.WorldBlank = {
    title: "My new world",
    description: "Give the player a reason to open the door. What will they discover?",
    variable: "Sparks",
    start: "door",
    initial: 0,
    scenes: [
      scene("door", "At the door", "A door stands open just a crack. Something is glowing on the other side.", [
        choice("Push the door open", "inside", 1)
      ]),
      scene("inside", "On the other side", "A spark floats into your hand. What will it become in your world?")
    ]
  };
})();
