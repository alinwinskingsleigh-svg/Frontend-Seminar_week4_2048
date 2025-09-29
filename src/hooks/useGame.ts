import { useCallback, useEffect, useMemo, useState } from 'react';
import { moveMapIn2048Rule, type Map2048 } from '../game/2048/logic'; // 네 코드가 있는 파일 경로에 맞춰 import
type Cell = number | null;

const LS_KEY = 'game2048';

type SavedState = {
  map: Map2048;
  over: boolean;
};

const createEmptyMap = (rows = 4, cols = 4): Map2048 =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));

const getEmptyCells = (map: Map2048) => {
  const cells: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[0].length; c++) {
      if (map[r][c] === null) cells.push({ r, c });
    }
  }
  return cells;
};

const spawnRandomTile = (map: Map2048): Map2048 => {
  const empty = getEmptyCells(map);
  if (empty.length === 0) return map;

  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const next = map.map((row: Cell[])=> [...row]);
  next[r][c] = value;
  return next;
};

const initMap = (): Map2048 => {
  let m = createEmptyMap(4, 4);
  m = spawnRandomTile(m);
  m = spawnRandomTile(m);
  return m;
};

const has128 = (map: Map2048) =>
  map.some((row: Cell[]) => row.some((v: Cell) => v === 128));

export function useGame() {
  // 복원 시도
  const restored = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SavedState;
    } catch {
      return null;
    }
  }, []);

  const [map, setMap] = useState<Map2048>(restored?.map ?? initMap());
  const [over, setOver] = useState<boolean>(restored?.over ?? false);

  // 변경될 때마다 저장
  useEffect(() => {
    const state: SavedState = { map, over };
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [map, over]);

  const doMove = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (over) return;

    const { result, isMoved } = moveMapIn2048Rule(map, dir);
    if (!isMoved) return;

    const spawned = spawnRandomTile(result);
    setMap(spawned);

    if (has128(spawned)) setOver(true);
  }, [map, over]);

  // 방향키 입력
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, 'up' | 'down' | 'left' | 'right' | undefined> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };
      const dir = keyMap[e.key];
      if (!dir) return;
      e.preventDefault(); // 스크롤 방지
      doMove(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doMove]);

  const reset = () => {
    const m = initMap();
    setMap(m);
    setOver(false);
  };

  return { map, over, reset };
}
