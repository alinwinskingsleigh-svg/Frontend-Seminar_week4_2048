// 2048 게임의 계산 로직

type Cell = number | null;
export type Map2048 = Cell[][];
type Direction = "up" | "left" | "right" | "down";
type RotateDegree = 0 | 90 | 180 | 270;
type DirectionDegreeMap = Record<Direction, RotateDegree>;

// 🔹 gained(점수) 추가
export type MoveResult = { result: Map2048; isMoved: boolean; gained: number };

export const moveMapIn2048Rule = (
  map: Map2048,
  direction: Direction,
): MoveResult => {
  if (!validateMapIsNByM(map)) throw new Error("Map is not N by M");

  const rotatedMap = rotateMapCounterClockwise(map, rotateDegreeMap[direction]);

  const { result, isMoved, gained } = moveLeft(rotatedMap);

  return {
    result: rotateMapCounterClockwise(result, revertDegreeMap[direction]),
    isMoved,
    gained,
  };
};

const validateMapIsNByM = (map: Map2048) => {
  const firstColumnCount = map[0].length;
  return map.every((row) => row.length === firstColumnCount);
};

const rotateMapCounterClockwise = (
  map: Map2048,
  degree: 0 | 90 | 180 | 270,
): Map2048 => {
  const rowLength = map.length;
  const columnLength = map[0].length;

  switch (degree) {
    case 0:
      return map;
    case 90:
      return Array.from({ length: columnLength }, (_, columnIndex) =>
        Array.from(
          { length: rowLength },
          (_, rowIndex) => map[rowIndex][columnLength - columnIndex - 1],
        ),
      );
    case 180:
      return Array.from({ length: rowLength }, (_, rowIndex) =>
        Array.from(
          { length: columnLength },
          (_, columnIndex) =>
            map[rowLength - rowIndex - 1][columnLength - columnIndex - 1],
        ),
      );
    case 270:
      return Array.from({ length: columnLength }, (_, columnIndex) =>
        Array.from(
          { length: rowLength },
          (_, rowIndex) => map[rowLength - rowIndex - 1][columnIndex],
        ),
      );
  }
};

const moveLeft = (map: Map2048): MoveResult => {
  const movedRows = map.map(moveRowLeft);
  const result = movedRows.map((m) => m.result);
  const isMoved = movedRows.some((m) => m.isMoved);
  const gained = movedRows.reduce((sum, m) => sum + m.gained, 0);
  return { result, isMoved, gained };
};

const moveRowLeft = (row: Cell[]): { result: Cell[]; isMoved: boolean; gained: number } => {
  const reduced = row.reduce(
    (acc: { lastCell: Cell; result: Cell[]; gained: number }, cell) => {
      if (cell === null) {
        return acc;
      } else if (acc.lastCell === null) {
        return { ...acc, lastCell: cell };
      } else if (acc.lastCell === cell) {
        const merged = cell * 2;
        return {
          result: [...acc.result, merged],
          lastCell: null,
          gained: acc.gained + merged,
        };
      } else {
        return { result: [...acc.result, acc.lastCell], lastCell: cell, gained: acc.gained };
      }
    },
    { lastCell: null, result: [], gained: 0 },
  );

  const result = [...reduced.result, reduced.lastCell];
  const resultRow = Array.from({ length: row.length }, (_, i) => result[i] ?? null);
  const isMoved = row.some((cell, i) => cell !== resultRow[i]);
  return { result: resultRow, isMoved, gained: reduced.gained };
};

const rotateDegreeMap: DirectionDegreeMap = {
  up: 90,
  right: 180,
  down: 270,
  left: 0,
};

const revertDegreeMap: DirectionDegreeMap = {
  up: 270,
  right: 180,
  down: 90,
  left: 0,
};
