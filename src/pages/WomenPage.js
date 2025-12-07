import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './WomenPage.css'
import Footer from './Footer'
import FilterSidebar from './FilterSidebar'
import { useWishlist } from '../WishlistContext'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper'
import 'swiper/css'
import WomenDisplayPage from './WomenDisplayPage'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')
const CLOUD_NAME = 'deymt9uyh'
const DEFAULT_IMG = '/images/women/women20.jpeg'
const toArray = (x) => (Array.isArray(x) ? x : [])

function cloudinaryUrlByEan(ean) {
  if (!ean) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/products/${ean}`
}

export default function WomenPage() {
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [likedKeys, setLikedKeys] = useState(new Set())
  const navigate = useNavigate()
  const { addToWishlist, wishlistItems, setWishlistItems } = useWishlist()
  const userId = sessionStorage.getItem('userId')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = sessionStorage.getItem('scroll:women-page')
    const y = saved != null ? parseInt(saved, 10) : 0
    if (!Number.isNaN(y)) {
      window.scrollTo(0, y)
    } else {
      window.scrollTo(0, 0)
    }
    const handleScroll = () => {
      const pos = window.scrollY || window.pageYOffset || 0
      sessionStorage.setItem('scroll:women-page', String(pos))
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    setUserType(sessionStorage.getItem('userType'))
  }, [])

  useEffect(() => {
    setLikedKeys(
      new Set(
        toArray(wishlistItems).map(
          (it) => String(it.ean_code ?? it.product_id ?? it.id ?? `${it.image_url}`)
        )
      )
    )
  }, [wishlistItems])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/products?gender=WOMEN&limit=50000`)
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        const arr = toArray(data).map((p, i) => {
          const ean =
            p.ean_code ??
            p.EANCode ??
            p.ean ??
            p.barcode ??
            p.bar_code ??
            ''
          const img =
            p.image_url ||
            (ean ? cloudinaryUrlByEan(ean) : '') ||
            DEFAULT_IMG
          return {
            id: p.id ?? p.product_id ?? i + 1,
            product_id: p.product_id ?? p.id ?? i + 1,
            brand: p.brand ?? p.brand_name ?? '',
            product_name: p.product_name ?? p.name ?? '',
            image_url: img,
            ean_code: ean,
            gender: p.gender ?? 'WOMEN',
            color: p.color ?? '',
            size: p.size ?? '',
            original_price_b2c: p.original_price_b2c ?? p.mrp ?? p.list_price ?? 0,
            final_price_b2c: p.final_price_b2c ?? p.sale_price ?? p.price ?? p.mrp ?? 0,
            original_price_b2b: p.original_price_b2b ?? p.mrp ?? 0,
            final_price_b2b: p.final_price_b2b ?? p.sale_price ?? 0
          }
        })
        if (!cancelled) {
          setAllProducts(arr)
          setProducts(arr)
        }
      } catch {
        if (!cancelled) {
          setAllProducts([])
          setProducts([])
          setError('Unable to load products')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const keyFor = (p) => String(p.ean_code || p.product_id || p.id || p.key || `${p.images?.[0]}`)

  const toggleLike = async (group) => {
    const k = keyFor(group)
    const inList = likedKeys.has(k)
    const pid = group.product_id || group.id
    try {
      if (inList) {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: pid })
        })
        setWishlistItems((prev) =>
          prev.filter(
            (item) =>
              String(item.ean_code ?? item.product_id ?? item.id ?? `${item.image_url}`) !== k
          )
        )
        setLikedKeys((prev) => {
          const n = new Set(prev)
          n.delete(k)
          return n
        })
      } else {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: pid })
        })
        addToWishlist({ ...group, product_id: pid })
        setLikedKeys((prev) => {
          const n = new Set(prev)
          n.add(k)
          return n
        })
      }
    } catch {}
  }

  const handleProductClick = (group) => {
    const rep = group.variants?.[0] || group.rep || group
    const payload = {
      ...rep,
      ean_code: group.ean_code || rep.ean_code,
      image_url: group.images?.[group.activeIndex || 0] || rep.image_url,
      variants: group.variants,
      images: group.images
    }
    sessionStorage.setItem('selectedProduct', JSON.stringify(payload))
    navigate('/checkout')
  }

  return (
    <div className="women-page">
      <Navbar />
      <div className="filter-bar-class">
        <FilterSidebar
          source={allProducts}
          onFilterChange={(list) => setProducts(Array.isArray(list) ? list : allProducts)}
        />
        <div className="women-page-main">
          <div className="women-page-content">
            <section className="home1-hero-new-home-2">
              <div className="home1-hero-frame-new-home-2">
                <Swiper
                  className="home1-hero-swiper-new-home-2"
                  modules={[Autoplay]}
                  loop
                  slidesPerView={1}
                  autoplay={{ delay: 3500, disableOnInteraction: false }}
                  speed={900}
                >
                  <SwiperSlide>
                    <div className="home1-hero-slide-new-home-2">
                      <img src="/images/banners/banner1.jpg" alt="Women Banner" loading="eager" />
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="home1-hero-slide-new-home-2">
                      <img
                        src="/images/banners/banner2.jpg"
                        alt="Women Banner"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="home1-hero-slide-new-home-2">
                      <img
                        src="/images/banners/banner3.jpg"
                        alt="Women Banner"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>
            </section>

            <WomenDisplayPage
              products={products}
              userType={userType}
              loading={loading}
              error={error}
              likedKeys={likedKeys}
              keyFor={keyFor}
              onToggleLike={toggleLike}
              onProductClick={handleProductClick}
            />

            <section className="home-section6">
              <h2 className="home-section6-title">Trending Now....</h2>
              <div className="home-section6-grid">
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part1-big1.jpeg" alt="Printed Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Printed Sarees...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part1-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part1-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part2-big1.jpeg" alt="Lehanga" />
                  </div>
                  <div className="home-section6-right">
                    <h3> Printed Lehanga...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part2-small1.jpeg" alt="Lehanga 1" />
                      <img src="/images/trending-part2-small2.jpeg" alt="Lehanga 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part3-big1.jpeg" alt="Wedding Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Wedding Sarees...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part3-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part3-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part4-big1.jpeg" alt="Printed Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Printed Chudidars...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part4-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part4-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part5-big1.jpeg" alt="Lehanga" />
                  </div>
                  <div className="home-section6-right">
                    <h3> Printed Gowns...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part5-small1.jpeg" alt="Lehanga 1" />
                      <img src="/images/trending-part5-small2.jpeg" alt="Lehanga 2" />
                    </div>
                  </div>
                </div>
                <div className="home-section6-item">
                  <div className="home-section6-left">
                    <img src="/images/trending-part6-big1.jpeg" alt="Wedding Sarees" />
                  </div>
                  <div className="home-section6-right">
                    <h3>Half Sarees...</h3>
                    <div className="home-section6-small-images">
                      <img src="/images/trending-part6-small1.jpeg" alt="Saree 1" />
                      <img src="/images/trending-part6-small2.jpeg" alt="Saree 2" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
