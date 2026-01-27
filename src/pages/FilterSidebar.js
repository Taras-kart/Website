import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FaFilter, FaSortAmountDown, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import './FilterSidebar.css'

const uniq = (arr) => Array.from(new Set(arr.filter(Boolean).map((x) => String(x).trim()).filter(Boolean)))
const norm = (v) => String(v ?? '').trim().toLowerCase()

export default function FilterSidebar({
  source = [],
  onFilterChange,
  sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'new', label: 'New Arrivals' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' }
  ],
  sortValue = 'featured',
  onSortChange
}) {
  const [desktopOpen, setDesktopOpen] = useState('brand')
  const [mobilePanel, setMobilePanel] = useState('')
  const [selectedBrands, setSelectedBrands] = useState(() => new Set())
  const [selectedColors, setSelectedColors] = useState(() => new Set())
  const [selectedSizes, setSelectedSizes] = useState(() => new Set())
  const [onlyInStock, setOnlyInStock] = useState(false)

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
      stock: onlyInStock ? 1 : 0,
      total: selectedBrands.size + selectedColors.size + selectedSizes.size + (onlyInStock ? 1 : 0)
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
    applyFilter(selectedBrands, selectedColors, selectedSizes, onlyInStock)
  }, [selectedBrands, selectedColors, selectedSizes, onlyInStock, applyFilter])

  useEffect(() => {
    if (!mobilePanel) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobilePanel])

  const clearAll = () => {
    setSelectedBrands(new Set())
    setSelectedColors(new Set())
    setSelectedSizes(new Set())
    setOnlyInStock(false)
  }

  const toggleValue = (type, value) => {
    if (type === 'stock') {
      setOnlyInStock((v) => !v)
      return
    }
    const key = norm(value)
    if (type === 'brand') {
      setSelectedBrands((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
      return
    }
    if (type === 'color') {
      setSelectedColors((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
      return
    }
    if (type === 'size') {
      setSelectedSizes((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
    }
  }

  const isChecked = (type, value) => {
    const key = norm(value)
    if (type === 'brand') return selectedBrands.has(key)
    if (type === 'color') return selectedColors.has(key)
    if (type === 'size') return selectedSizes.has(key)
    return false
  }

  const Section = ({ id, title, count, options }) => {
    const open = desktopOpen === id
    return (
      <div className={`fs-sec ${open ? 'open' : ''}`}>
        <button type="button" className="fs-sec-head" onClick={() => setDesktopOpen((p) => (p === id ? '' : id))}>
          <span className="fs-sec-title">
            {title}
            {count > 0 ? <span className="fs-pill-count">{count}</span> : null}
          </span>
          <span className="fs-sec-ico">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
        </button>

        {open ? (
          <div className="fs-sec-body">
            <div className="fs-list">
              {options.length === 0 ? (
                <div className="fs-empty">No options</div>
              ) : (
                options.map((v) => (
                  <label key={`${id}:${v}`} className="fs-item">
                    <input type="checkbox" checked={isChecked(id, v)} onChange={() => toggleValue(id, v)} />
                    <span className="fs-check" />
                    <span className="fs-text">{v}</span>
                  </label>
                ))
              )}
            </div>

            <div className="fs-sec-actions">
              <button
                type="button"
                className="fs-btn ghost"
                onClick={() => {
                  if (id === 'brand') setSelectedBrands(new Set())
                  if (id === 'color') setSelectedColors(new Set())
                  if (id === 'size') setSelectedSizes(new Set())
                }}
              >
                Clear
              </button>
              <button type="button" className="fs-btn solid" onClick={() => setDesktopOpen('')}>
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  const Desktop = () => (
    <div className="fs-desktop">
      <div className="fs-top">
        <div className="fs-top-left">
          <span className="fs-top-ico">
            <FaFilter />
          </span>
          <span className="fs-top-title">Filters</span>
        </div>

        <button
          type="button"
          className="fs-top-reset"
          onClick={() => {
            clearAll()
            applyFilter(new Set(), new Set(), new Set(), false)
          }}
        >
          Reset
        </button>
      </div>

      <div className="fs-mid">
        <Section id="brand" title="Brands" count={counts.brand} options={brands} />
        <Section id="color" title="Colors" count={counts.color} options={colors} />
        <Section id="size" title="Sizes" count={counts.size} options={sizes} />

        <div className="fs-sec open">
          <button type="button" className="fs-sec-head" onClick={() => toggleValue('stock')} aria-pressed={onlyInStock}>
            <span className="fs-sec-title">
              In Stock
              {onlyInStock ? <span className="fs-pill-count">1</span> : null}
            </span>
            <span className={`fs-toggle ${onlyInStock ? 'on' : ''}`}>{onlyInStock ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <div className="fs-bottom">
        <div className="fs-bottom-left">
          <span className="k">Selected</span>
          <span className="v">{counts.total}</span>
        </div>

        <button
          type="button"
          className="fs-bottom-clear"
          onClick={() => {
            clearAll()
            applyFilter(new Set(), new Set(), new Set(), false)
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  )

  const MobileFilters = () => (
    <div className="m-sheet" role="dialog" aria-modal="true">
      <div className="m-head">
        <div className="m-title">
          <span className="m-dot" />
          <span>Filters</span>
        </div>
        <button type="button" className="m-x" onClick={() => setMobilePanel('')}>
          Close
        </button>
      </div>

      <div className="m-body">
        <Section id="brand" title="Brands" count={counts.brand} options={brands} />
        <Section id="color" title="Colors" count={counts.color} options={colors} />
        <Section id="size" title="Sizes" count={counts.size} options={sizes} />

        <div className="fs-sec open">
          <button type="button" className="fs-sec-head" onClick={() => toggleValue('stock')} aria-pressed={onlyInStock}>
            <span className="fs-sec-title">
              In Stock
              {onlyInStock ? <span className="fs-pill-count">1</span> : null}
            </span>
            <span className={`fs-toggle ${onlyInStock ? 'on' : ''}`}>{onlyInStock ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <div className="m-foot">
        <button
          type="button"
          className="m-ghost"
          onClick={() => {
            clearAll()
            applyFilter(new Set(), new Set(), new Set(), false)
          }}
        >
          Clear All
        </button>
        <button type="button" className="m-primary" onClick={() => setMobilePanel('')}>
          Done
        </button>
      </div>
    </div>
  )

  const MobileSort = () => (
    <div className="m-sheet" role="dialog" aria-modal="true">
      <div className="m-head">
        <div className="m-title">
          <span className="m-dot" />
          <span>Sort By</span>
        </div>
        <button type="button" className="m-x" onClick={() => setMobilePanel('')}>
          Close
        </button>
      </div>

      <div className="m-body">
        <div className="m-sort-list">
          {sortOptions.map((opt) => {
            const active = opt.value === sortValue
            return (
              <button
                key={opt.value}
                type="button"
                className={`m-sort-item ${active ? 'active' : ''}`}
                onClick={() => {
                  if (typeof onSortChange === 'function') onSortChange(opt.value)
                  setMobilePanel('')
                }}
              >
                <span className="m-sort-label">{opt.label}</span>
                <span className="m-sort-mark">{active ? '●' : '○'}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="m-foot">
        <button type="button" className="m-primary" onClick={() => setMobilePanel('')}>
          Done
        </button>
      </div>
    </div>
  )

  return (
    <div className="filterbar-wrap">
      <Desktop />

      <div className="m-bar">
        <button
          type="button"
          className="m-bar-btn"
          onClick={() => {
            setDesktopOpen('brand')
            setMobilePanel((v) => (v === 'filters' ? '' : 'filters'))
          }}
        >
          <span className="m-ico">
            <FaFilter />
          </span>
          <span>Filters</span>
          <span className="m-badge">{counts.total}</span>
        </button>

        <button
          type="button"
          className="m-bar-btn"
          onClick={() => {
            setMobilePanel((v) => (v === 'sort' ? '' : 'sort'))
          }}
        >
          <span className="m-ico">
            <FaSortAmountDown />
          </span>
          <span>Sort By</span>
          <span className="m-mini">{sortOptions.find((x) => x.value === sortValue)?.label || 'Featured'}</span>
        </button>
      </div>

      <div className={`m-overlay ${mobilePanel ? 'show' : ''}`} onClick={() => setMobilePanel('')} />

      {mobilePanel === 'filters' ? <MobileFilters /> : null}
      {mobilePanel === 'sort' ? <MobileSort /> : null}
    </div>
  )
}
