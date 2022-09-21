export type CharStatus = "absent" | "present" | "correct";

export const getGuessStatuses = (
  guess: string,
  solution: string
): CharStatus[] => {
  const splitSolution = solution.split("");
  const splitGuess = guess.split("");

  const solutionCharsTaken = splitSolution.map((_) => false);

  const statuses: CharStatus[] = Array.from(Array(guess.length));

  // handle all correct cases first
  splitGuess.forEach((letter, i) => {
    if (letter !== splitSolution[i]) return;
    statuses[i] = "correct";
    solutionCharsTaken[i] = true;
  });

  splitGuess.forEach((letter, i) => {
    if (statuses[i]) return;
    if (!splitSolution.includes(letter)) {
      statuses[i] = "absent";
      return;
    }
    const indexOfPresentChar = splitSolution.findIndex((x, i) => x === letter && !solutionCharsTaken[i]);
    if (!(indexOfPresentChar > -1)) {
      statuses[i] = "absent";
      return;
    }
    statuses[i] = "present";
    solutionCharsTaken[indexOfPresentChar] = true;
  });

  return statuses;
};
