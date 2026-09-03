import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper'
import { FaArrowRight } from 'react-icons/fa'
import 'swiper/css'
import 'swiper/css/pagination'
import ProductSection from '../components/ProductSection'
import { fetchProducts } from '../services/productsApi'
import { fetchHomepageConfiguration } from '../services/homepageImagesApi'
import Divider from './Divider'
import './HomePage.css'

const text = value => String(value || '').trim()
const imageUrl = item => text(item?.image_url || item?.imageUrl || item?.url || item?.src)
const sectionName = item => text(item?.section || item?.section_name || item?.type).toLowerCase()
const slotNumber = item => Number(item?.slot_order ?? item?.slot ?? item?.display_order ?? 0)

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const userType = sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C'

  useEffect(() => {
    let active = true
    Promise.all([fetchProducts({ limit: 160, hasImage: true }), fetchHomepageConfiguration()])
      .then(([productRows, configuration]) => {
        if (!active) return
        setProducts(Array.isArray(productRows) ? productRows : [])
        setRows(Array.isArray(configuration?.rows) ? configuration.rows : [])
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const bySection = name => rows
    .filter(item => sectionName(item) === name && imageUrl(item))
    .sort((a, b) => slotNumber(a) - slotNumber(b))

  const legacyHero = rows.filter(item => {
    const id = text(item?.id || item?.key || item?.image_key).toLowerCase()
    return imageUrl(item) && (id.includes('banner') || id.includes('slide'))
  })

  const heroSlides = useMemo(() => {
    const configured = bySection('hero')
    const source = configured.length ? configured : legacyHero
    return [...new Map(source.map(item => [imageUrl(item), item])).values()]
  }, [rows])

  const genderProducts = gender => products.filter(item => text(item.gender).toUpperCase() === gender)
  const firstProductImage = gender => genderProducts(gender).flatMap(item => item.images || []).find(Boolean) || ''
  const configuredImage = (section, slot) => imageUrl(rows.find(item => sectionName(item) === section && slotNumber(item) === slot))
  const genderCards = [
    { title: 'Women', path: '/women', image: configuredImage('shop_gender', 1) || firstProductImage('WOMEN') },
    { title: 'Men', path: '/men', image: configuredImage('shop_gender', 2) || firstProductImage('MEN') },
    { title: 'Kids', path: '/kids', image: configuredImage('shop_gender', 3) || firstProductImage('KIDS') }
  ].filter(item => item.image)
  const women = useMemo(() => genderProducts('WOMEN'), [products])
  const men = useMemo(() => genderProducts('MEN'), [products])
  const kids = useMemo(() => genderProducts('KIDS'), [products])

  return <div className="tara-home-old">
    <main>
      <section className="tara-home-slideshow">
        {heroSlides.length > 0 && <Swiper modules={[Autoplay, Pagination]} loop={heroSlides.length > 1} slidesPerView={1} autoplay={heroSlides.length > 1 ? { delay: 3500, disableOnInteraction: false } : false} speed={850} pagination={heroSlides.length > 1 ? { clickable: true } : false}>{heroSlides.map((item, index) => <SwiperSlide key={`${imageUrl(item)}-${index}`}><Link to={text(item?.link_url || item?.link || item?.target_url) || '/women'}><img src={imageUrl(item)} alt={text(item?.alt_text || item?.title) || `Attach banner ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} /></Link></SwiperSlide>)}</Swiper>}
        {!loading && heroSlides.length === 0 && <div className="tara-home-image-empty">Add hero slideshow images from homepage image management.</div>}
        {loading && <div className="tara-home-hero-loading" />}
      </section>
      <Divider direction="ltr" />
      {genderCards.length > 0 && <section className="tara-home-category-section"><div className="tara-home-title"><span>Explore</span><h1>Shop your way</h1></div><div className="tara-home-category-grid">{genderCards.map(item => <Link to={item.path} key={item.title}><img src={item.image} alt={item.title} /><div><h2>{item.title}</h2><span>Shop now <FaArrowRight /></span></div></Link>)}</div></section>}
      <Divider direction="rtl" />
      <ProductSection eyebrow="Freshly added" title="New arrivals" products={products.slice(0, 12)} userType={userType} link="/women" />
      <Divider direction="ltr" />
      <ProductSection eyebrow="For her" title="Women’s collection" products={women.slice(0, 12)} userType={userType} link="/women" />
      <Divider direction="rtl" />
      <ProductSection eyebrow="For him" title="Men’s collection" products={men.slice(0, 12)} userType={userType} link="/men" />
      <Divider direction="ltr" />
      <ProductSection eyebrow="Little favourites" title="Kids’ collection" products={kids.slice(0, 12)} userType={userType} link="/kids" />
    </main>
  </div>
}
