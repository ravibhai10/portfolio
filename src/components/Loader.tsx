interface Props {
  progress: number // 0..1
  done: boolean
}

export default function Loader({ progress, done }: Props) {
  const pct = Math.round(progress * 100)
  return (
    <div className={`loader${done ? ' is-done' : ''}`} aria-hidden={done}>
      <div className="loader__logo">ravikumar gupta</div>
      <div className="loader__label">Loading experience</div>
      <div className="loader__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="loader__pct">{pct}%</div>
    </div>
  )
}
