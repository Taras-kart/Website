import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import './FilterSidebar.css'

const uniq = (arr) => Array.from(new Set(arr.filter(Boolean).map((x) => String(x).trim()).filter(Boolean)))
const norm = (v) => String(v ?? '').trim().toLowerCase()

export default function FilterSidebar({ source = [], onFilterChange }) {
  const [activeChip, setActiveChip] = useState('')
  const [openDropdown, setOpenDropdown] = useState(false)

  const [selectedBrands, setSelectedBrands] = useState(new Set())
  const [selectedColors, setSelectedColors] = useState(new Set())
  const [selectedSizes, setSelectedSizes] = useState(new Set())
  const [onlyInStock, setOnlyInStock] = useState(false)

  const pendingRef = useRef({ brands: new Set(), colors: new Set(), sizes: new Set(), stock: false })

  const { brands, colors, sizes } = useMemo(() => {
    const b = []
    const c = []
    const s = []
    ;(Array.isArray(source) ? source : []).forEach((p) => {
      b.push(p?.brand)
      c.push(p?.color)
      s.push(p?.size)
    })
    return {
      brands: uniq(b).sort((a, b1) => a.localeCompare(b1)),
      colors: uniq(c).sort((a, b1) => a.localeCompare(b1)),
      sizes: uniq(s).sort((a, b1) => a.localeCompare(b1))
    }
  }, [source])

  const counts = useMemo(() => {
    const out = { brand: 0, color: 0, size: 0, stock: 0 }
    out.brand = selectedBrands.size
    out.color = selectedColors.size
    out.size = selectedSizes.size
    out.stock = onlyInStock ? 1 : 0
    return out
  }, [selectedBrands, selectedColors, selectedSizes, onlyInStock])

  const applyFilter = (brandsSet, colorsSet, sizesSet, stockFlag) => {
    const list = Array.isArray(source) ? source : []
    const res = list.filter((p) => {
      const bOk = brandsSet.size === 0 || brandsSet.has(norm(p?.brand))
      const cOk = colorsSet.size === 0 || colorsSet.has(norm(p?.color))
      const sOk = sizesSet.size === 0 || sizesSet.has(norm(p?.size))
      const stockOk = !stockFlag || !p?.is_out_of_stock
      return bOk && cOk && sOk && stockOk
    })
    if (typeof onFilterChange === 'function') onFilterChange(res)
  }

  useEffect(() => {
    pendingRef.current = {
      brands: new Set(Array.from(selectedBrands)),
      colors: new Set(Array.from(selectedColors)),
      sizes: new Set(Array.from(selectedSizes)),
      stock: onlyInStock
    }
    applyFilter(selectedBrands, selectedColors, selectedSizes, onlyInStock)
  }, [selectedBrands, selectedColors, selectedSizes, onlyInStock])

  const toggleChip = (key) => {
    if (activeChip === key) {
      setOpenDropdown((v) => !v)
      return
    }
    setActiveChip(key)
    setOpenDropdown(true)
  }

  const clearAll = () => {
    setSelectedBrands(new Set())
    setSelectedColors(new Set())
    setSelectedSizes(new Set())
    setOnlyInStock(false)
    setActiveChip('')
    setOpenDropdown(false)
  }

  const resetAndClose = () => {
    clearAll()
    applyFilter(new Set(), new Set(), new Set(), false)
  }

  const applyPending = () => {
    const p = pendingRef.current
    setSelectedBrands(new Set(p.brands))
    setSelectedColors(new Set(p.colors))
    setSelectedSizes(new Set(p.sizes))
    setOnlyInStock(!!p.stock)
    setOpenDropdown(false)
  }

  const setPendingToggle = (type, value) => {
    const p = pendingRef.current
    if (type === 'stock') {
      p.stock = !p.stock
      pendingRef.current = p
      setOnlyInStock(p.stock)
      return
    }

    const key = norm(value)
    const setRef = type === 'brand' ? p.brands : type === 'color' ? p.colors : p.sizes
    if (setRef.has(key)) setRef.delete(key)
    else setRef.add(key)
    pendingRef.current = p

    if (type === 'brand') setSelectedBrands(new Set(setRef))
    if (type === 'color') setSelectedColors(new Set(setRef))
    if (type === 'size') setSelectedSizes(new Set(setRef))
  }

  const optionsFor = (chip) => {
    if (chip === 'brand') return brands
    if (chip === 'color') return colors
    if (chip === 'size') return sizes
    return []
  }

  const isChecked = (type, value) => {
    const key = norm(value)
    if (type === 'brand') return selectedBrands.has(key)
    if (type === 'color') return selectedColors.has(key)
    if (type === 'size') return selectedSizes.has(key)
    return false
  }

  return (
    <>
      <div className="filterbar-wrap">
        <div className="filterbar-inner">
          <div className="filter-bar">
            <div className="filter-left">
              <div className="filter-title-wrap">
                <FaFilter className="filter-icon" />
                <h3 className="filter-title">Filters</h3>
                <span className="title-glow" />
              </div>
            </div>

            <div className="chips" aria-label="Filter chips">
              <button
                type="button"
                className={`filter-chip ${activeChip === 'brand' && openDropdown ? 'active' : ''}`}
                onClick={() => toggleChip('brand')}
              >
                <span className="chip-label">Brand</span>
                {counts.brand > 0 && <span className="count-badge">{counts.brand}</span>}
                <span className="chip-chevron">{activeChip === 'brand' && openDropdown ? <FaChevronUp /> : <FaChevronDown />}</span>
              </button>

              <button
                type="button"
                className={`filter-chip ${activeChip === 'color' && openDropdown ? 'active' : ''}`}
                onClick={() => toggleChip('color')}
              >
                <span className="chip-label">Color</span>
                {counts.color > 0 && <span className="count-badge">{counts.color}</span>}
                <span className="chip-chevron">{activeChip === 'color' && openDropdown ? <FaChevronUp /> : <FaChevronDown />}</span>
              </button>

              <button
                type="button"
                className={`filter-chip ${activeChip === 'size' && openDropdown ? 'active' : ''}`}
                onClick={() => toggleChip('size')}
              >
                <span className="chip-label">Size</span>
                {counts.size > 0 && <span className="count-badge">{counts.size}</span>}
                <span className="chip-chevron">{activeChip === 'size' && openDropdown ? <FaChevronUp /> : <FaChevronDown />}</span>
              </button>

              <button type="button" className={`filter-chip ${onlyInStock ? 'active' : ''}`} onClick={() => setPendingToggle('stock')}>
                <span className="chip-label">In Stock</span>
                {onlyInStock && <span className="count-badge">1</span>}
              </button>
            </div>

            <div className="filter-actions">
              <button type="button" className="reset-btn" onClick={resetAndClose}>
                Reset
              </button>
            </div>

            <div className="filter-mobile-controls">
              <button type="button" className="mobile-control-btn" onClick={() => toggleChip('brand')}>
                <span className="mobile-control-label">Filters</span>
              </button>
              <button type="button" className="mobile-control-btn" onClick={() => toggleChip('size')}>
                <span className="mobile-control-label">Sizes</span>
              </button>
            </div>
          </div>

          <div className={`filter-dropdown ${openDropdown ? 'open' : ''}`}>
            <ul className={`filter-options ${activeChip === 'brand' || activeChip === 'color' || activeChip === 'size' ? 'horizontal' : ''}`}>
              {activeChip === 'brand' || activeChip === 'color' || activeChip === 'size' ? (
                optionsFor(activeChip).map((v) => (
                  <li key={`${activeChip}:${v}`}>
                    <label className="chk">
                      <input type="checkbox" checked={isChecked(activeChip, v)} onChange={() => setPendingToggle(activeChip, v)} />
                      <span className="box" />
                      <span className="txt">{v}</span>
                    </label>
                  </li>
                ))
              ) : (
                <li />
              )}
            </ul>

            <div className="apply-row">
              <button type="button" className="clear-btn" onClick={clearAll}>
                Clear
              </button>
              <span className="spacer" />
              <button type="button" className="apply-btn" onClick={applyPending}>
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`filter-overlay ${openDropdown ? 'show' : ''}`} onClick={() => setOpenDropdown(false)} />
    </>
  )
}
