import './Divider.css'

export default function Divider({ direction = 'ltr', height = 40, speed = 18 }) {
  const directionClass = direction === 'rtl' ? 'dv2-rtl' : 'dv2-ltr'
  const style = { '--dv2-h': `${height}px`, '--dv2-speed': `${speed}s` }
  const items = Array.from({ length: 12 })
  return <div className={`dv2 ${directionClass}`} style={style} aria-hidden="true"><div className="dv2-marquee"><div className="dv2-strip">{items.map((_, index) => <div className="dv2-set" key={`a-${index}`}><img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" /></div>)}{items.map((_, index) => <div className="dv2-set" key={`b-${index}`}><img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" /></div>)}</div></div></div>
}
