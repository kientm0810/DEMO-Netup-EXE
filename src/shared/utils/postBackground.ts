import type { Court } from "../../entities";
import badminton1 from "../assets/post-backgrounds/badminton1.jpg";
import badminton2 from "../assets/post-backgrounds/badminton2.jpg";
import badminton3 from "../assets/post-backgrounds/badminton3.jpg";
import football1 from "../assets/post-backgrounds/football1.jpeg";
import football2 from "../assets/post-backgrounds/football2.jpg";
import tennis1 from "../assets/post-backgrounds/tennis1.jpg";
import tennis2 from "../assets/post-backgrounds/tennis2.jpg";

const backgroundLibrary: Record<Court["sport"], string[]> = {
  Badminton: [badminton1, badminton2, badminton3],
  Football: [football1, football2],
  Tennis: [tennis1, tennis2],
};

function hashSeed(seed: string): number {
  return seed
    .split("")
    .reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
}

export function getPostBackgroundBySport(sport: Court["sport"], seed?: string): string {
  const options = backgroundLibrary[sport];
  if (!seed || seed.trim().length === 0) {
    return options[0];
  }
  const hash = hashSeed(seed.trim());
  return options[hash % options.length];
}
