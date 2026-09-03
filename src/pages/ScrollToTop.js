import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export default function ScrollToTop() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const url = `${location.pathname}${location.search}`
    let saved = null
    try { saved = JSON.parse(sessionStorage.getItem('attach:return-position') || 'null') } catch { saved = null }
    if (navigationType === 'POP' && saved?.url === url) return undefined
    window.scrollTo({ top: 0, behavior: 'auto' })
    return undefined
  }, [location.pathname, location.search, navigationType])

  return null
}
