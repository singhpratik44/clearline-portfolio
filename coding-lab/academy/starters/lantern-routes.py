"""Lantern Routes: a two-choice adventure for Python 3.

Run this file in IDLE (Run > Run Module), or type:
    python3 lantern-routes.py

Change one entry in ROUTES, make a prediction, and replay.
"""

TITLE = "Lantern Routes"
STARTING_LIGHT = 3
LIGHT_TO_WAKE_BEACON = 2

# Each route has a key, a place, a cost, and something to discover.
ROUTES = {
    "1": {
        "place": "Echo Cave",
        "cost": 2,
        "discovery": "You find a map drawn by glowworms on the cave wall.",
    },
    "2": {
        "place": "Moss Bridge",
        "cost": 1,
        "discovery": "You find a green moth carrying a tiny letter.",
    },
}


def choose(options):
    """Show the choices until the player picks one or leaves."""
    for key, description in options.items():
        print(f"  {key}. {description}")
    while True:
        try:
            answer = input("Your choice (or q to quit): ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print()
            return None
        if answer == "q":
            return None
        if answer in options:
            return answer
        print("Try one of the choices shown above.")


def play():
    print(f"\n{TITLE}\nThe night train needs a signal. You carry its last lantern.")
    print(f"You begin with {STARTING_LIGHT} light. Which route will you take?")
    routes = {
        key: f"{route['place']} (uses {route['cost']} light)"
        for key, route in ROUTES.items()
    }
    selected = choose(routes)
    if selected is None:
        return
    route = ROUTES[selected]
    light = max(0, STARTING_LIGHT - route["cost"])
    print(f"\n{route['discovery']}\nYou reach the tower with {light} light.")
    print("How will you signal the train?")
    signal = choose({"1": "Wake the beacon", "2": "Ring the old bell"})
    if signal is None:
        return
    if signal == "2":
        print("The bell sings across the water. A whistle answers from the dark.")
    elif light >= LIGHT_TO_WAKE_BEACON:
        print("The beacon glows gold. The train follows your light home.")
    else:
        print("Your lantern flickers. An owl spots the sparks and leads the train in.")
    print(f"Your route: {route['place']}. Your ending is yours to rewrite.")


if __name__ == "__main__":
    play()
