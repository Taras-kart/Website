import './Divider.css'

export default function Divider({ direction = 'ltr', height = 40, speed = 18 }) {
  const dirClass = direction === 'rtl' ? 'dv2-rtl' : 'dv2-ltr'
  const style = { '--dv2-h': `${height}px`, '--dv2-speed': `${speed}s` }

  return (
    <div className={`dv2 ${dirClass}`} style={style} aria-hidden="true">
      <div className="dv2-marquee">
        <div className="dv2-strip">
          <div className="dv2-set">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>

          <div className="dv2-set" aria-hidden="true">
            <img src="/images/updated/scrolling1.avif" alt="" className="dv2-ic" />
          </div>
        </div>
      </div>
    </div>
  )
}