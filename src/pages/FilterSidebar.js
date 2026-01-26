import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import './FilterSidebar.css'

const uniq = (arr) => Array.from(new Set(arr.filter(Boolean).map((x) => String(x).trim()).filter(Boolean)))
const norm = (v) => String(v ?? '').trim().toLowerCase()

export default function FilterSidebar({ source = [], onFilterChange }) {
  const [activeChip, setActiveChip] = useState('')
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
    return {
      brand: selectedBrands.size,
      color: selectedColors.size,
      size: selectedSizes.size,
      stock: onlyInStock ? 1 : 0
    }
  }, [selectedBrands, selectedColors, selectedSizes, onlyInStock])

  const applyFilter = useCallback(
    (brandsSet, colorsSet, sizesSet, stockFlag) => {
      const list = Array.isArray(source) ? source : []
      const res = list.filter((p) => {
        const bOk = brandsSet.size === 0 || brandsSet.has(norm(p?.brand))
        const cOk = colorsSet.size === 0 || colorsSet.has(norm(p?.color))
        const sOk = sizesSet.size === 0 || sizesSet.has(norm(p?.size))
        const stockOk = !stockFlag || !p?.is_out_of_stock
        return bOk && cOk && sOk && stockOk
      })
      if (typeof onFilterChange === 'function') onFilterChange(res)
    },
    [source, onFilterChange]
  )

  useEffect(() => {
    pendingRef.current = {
      brands: new Set(Array.from(selectedBrands)),
      colors: new Set(Array.from(selectedColors)),
      sizes: new Set(Array.from(selectedSizes)),
      stock: onlyInStock
    }
    applyFilter(selectedBrands, selectedColors, selectedSizes, onlyInStock)
  }, [selectedBrands, selectedColors, selectedSizes, onlyInStock, applyFilter])

  const toggleSection = (key) => {
    setActiveChip((prev) => (prev === key ? '' : key))
  }

  const clearAll = () => {
    setSelectedBrands(new Set())
    setSelectedColors(new Set())
    setSelectedSizes(new Set())
    setOnlyInStock(false)
    setActiveChip('')
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

  const Chip = ({ k, label, count }) => {
    const open = activeChip === k
    return (
      <div className={`fs-chip ${open ? 'open' : ''}`}>
        <button type="button" className="fs-chip-btn" onClick={() => toggleSection(k)}>
          <span className="fs-chip-left">
            <span className="fs-chip-label">{label}</span>
            {count > 0 && <span className="fs-badge">{count}</span>}
          </span>
          <span className="fs-chip-right">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
        </button>

        <div className={`fs-panel ${open ? 'show' : ''}`}>
          <div className="fs-panel-inner">
            <div className="fs-panel-grid">
              {optionsFor(k).length === 0 ? (
                <div className="fs-empty">No options</div>
              ) : (
                optionsFor(k).map((v) => (
                  <label key={`${k}:${v}`} className="fs-opt">
                    <input type="checkbox" checked={isChecked(k, v)} onChange={() => setPendingToggle(k, v)} />
                    <span className="fs-box" />
                    <span className="fs-txt">{v}</span>
                  </label>
                ))
              )}
            </div>

            <div className="fs-panel-actions">
              <button
                type="button"
                className="fs-clear"
                onClick={() => {
                  if (k === 'brand') setSelectedBrands(new Set())
                  if (k === 'color') setSelectedColors(new Set())
                  if (k === 'size') setSelectedSizes(new Set())
                }}
              >
                Clear {label}
              </button>
              <span className="fs-spacer" />
              <button type="button" className="fs-close" onClick={() => setActiveChip('')}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="filterbar-wrap">
      <div className="filterbar-inner">
        <div className="fs-head">
          <div className="fs-title">
            <span className="fs-ico">
              <FaFilter />
            </span>
            <span>Filters</span>
          </div>

          <button
            type="button"
            className="fs-reset"
            onClick={() => {
              clearAll()
              applyFilter(new Set(), new Set(), new Set(), false)
            }}
          >
            Reset
          </button>
        </div>

        <div className="fs-body">
          <Chip k="brand" label="Brands" count={counts.brand} />
          <Chip k="color" label="Colors" count={counts.color} />
          <Chip k="size" label="Sizes" count={counts.size} />

          <div className={`fs-chip ${onlyInStock ? 'open' : ''}`}>
            <button type="button" className="fs-chip-btn" onClick={() => setPendingToggle('stock')}>
              <span className="fs-chip-left">
                <span className="fs-chip-label">In Stock</span>
                {onlyInStock && <span className="fs-badge">1</span>}
              </span>
              <span className="fs-chip-right">
                <span className={`fs-pill ${onlyInStock ? 'on' : ''}`}>{onlyInStock ? 'ON' : 'OFF'}</span>
              </span>
            </button>
          </div>
        </div>

        <div className="fs-footer">
          <div className="fs-foot-left">
            <span className="fs-foot-k">Selected</span>
            <span className="fs-foot-v">{counts.brand + counts.color + counts.size + counts.stock}</span>
          </div>
          <button
            type="button"
            className="fs-clear-all"
            onClick={() => {
              clearAll()
              applyFilter(new Set(), new Set(), new Set(), false)
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}
