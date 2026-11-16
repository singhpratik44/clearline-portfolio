"""APERTURE Basketball Stats Lab — Python 3, no external packages."""
from dataclasses import dataclass

@dataclass
class Player:
    name: str
    attempts: int = 0
    makes: int = 0
    points: int = 0

    def shoot(self, made: bool, value: int = 2) -> None:
        if value not in (2, 3):
            raise ValueError("A basket must be worth 2 or 3 points")
        self.attempts += 1
        if made:
            self.makes += 1
            self.points += value

    @property
    def percentage(self) -> float:
        return 100 * self.makes / self.attempts if self.attempts else 0.0

def report(player: Player) -> str:
    return (f"{player.name}: {player.makes}/{player.attempts} FG "
            f"({player.percentage:.1f}%), {player.points} points")

def main() -> None:
    player = Player("APERTURE Athlete")
    print("Basketball Stats Lab: enter 2, 3, or m for missed shot; q to quit.")
    while True:
        choice = input("Shot [2/3/m/q]: ").strip().lower()
        if choice == "q":
            break
        if choice not in ("2", "3", "m"):
            print("Try 2, 3, m, or q.")
            continue
        player.shoot(choice != "m", int(choice) if choice != "m" else 2)
        print(report(player))
    print("Final:", report(player))

if __name__ == "__main__":
    main()
