import React, { useState } from 'react'
import './BrandMark.css'

export default function BrandMark({ className = '' }) {
  const [missing, setMissing] = useState(false)
  return missing
    ? <span className={`attach-brand-mark ${className}`}>ATTACH</span>
    : <img src="/logo1.png" className={className} alt="Attach" onError={() => setMissing(true)} />
}
