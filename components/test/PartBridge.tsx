/** 파트 브릿지 — 파트 경계 리듬 부여(PRD §8). fade 1회, 담백한 격려·이어하기 상시 고지. */
export function PartBridge({
  nextPart, done, total, onContinue,
}: {
  nextPart: number;
  done: number;
  total: number;
  onContinue: () => void;
}) {
  const remain = total - done;
  return (
    <div className="card reveal" style={{ textAlign: 'center', padding: '32px 24px' }}>
      <div className="eyebrow">PART {nextPart}</div>
      <h2 className="sec">파트 {nextPart} 시작</h2>
      <p className="sec-sub" style={{ marginBottom: 20 }}>
        지금까지 {done}문항을 완료했어요. 남은 문항은 {remain}개입니다.<br />
        언제든 그만두고 이어서 할 수 있으니 편하게 진행하세요.
      </p>
      <button type="button" className="btn btn-primary" onClick={onContinue} autoFocus>계속하기</button>
    </div>
  );
}
