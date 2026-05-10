// Area collision detector
// Проверяет пересечение двух областей в координатах x/y/w/h.

export function detectAreaCollision(firstArea, secondArea) {
  const firstRight = firstArea.x + firstArea.w - 1;
  const secondRight = secondArea.x + secondArea.w - 1;
  const firstBottom = firstArea.y + firstArea.h - 1;
  const secondBottom = secondArea.y + secondArea.h - 1;

  return !(
    firstRight < secondArea.x ||
    secondRight < firstArea.x ||
    firstBottom < secondArea.y ||
    secondBottom < firstArea.y
  );
}
