import { useGame } from './hooks/useGame';
import './app.css';

type Cell = number | null;

export default function App() {
  const { map, over, score, reset } = useGame();

  return (
    <div style={{ padding: 16 }}>
      <h1>2048 (128 만들면 종료)</h1>
      <div style={{ marginBottom: 8 }}>
        <button onClick={reset}>새 게임</button>
        <span style={{ marginLeft: 12 }}>Score: <b>{score}</b></span>
        {over && <span style={{ marginLeft: 12, fontWeight: 700 }}>게임 종료 🎉</span>}
      </div>

      {/* 보드 렌더링 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${map[0].length}, 72px)`,
          gap: 8,
          background: '#bbada0',
          padding: 8,
          borderRadius: 8,
          width: 'max-content',
        }}
      >
        {map.flatMap((row: Cell[], r: number) =>
          row.map((v: Cell, c: number) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: 72, height: 72,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 20,
                borderRadius: 6,
                background: v ? '#eee4da' : '#cdc1b4',
              }}
            >
              {v ?? ''}
            </div>
          )),
        )}
      </div>

      <p style={{ marginTop: 12, color: '#666' }}>
        방향키로 움직여보세요. 새로고침해도 현재 보드와 점수가 유지됩니다.
      </p>
    </div>
  );
}
