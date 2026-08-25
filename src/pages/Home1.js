import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper'
import { FaArrowRight } from 'react-icons/fa'
import 'swiper/css'
import 'swiper/css/pagination'
import './Home1.css'
import './Home1Loading.css'
import Divider from './Divider'
import ProductSection from '../components/ProductSection'
import { fetchProducts } from '../services/productsApi'
import { fetchCategories } from '../services/categoriesApi'

const API_BASE = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || 'https://taras-kart-backend.vercel.app'
const clean = value => String(value || '').trim()
const upper = value => clean(value).toUpperCase()
const number = value => Number(value || 0)
const unique = values => [...new Set(values.map(clean).filter(Boolean))]
const normalize = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '')
const innerwearPattern = /INNER\s*WEAR|BRA|BRIEF|TRUNK|VEST|PANTY|SLIP|LINGERIE|CAMISOLE/i
const menExcludedPattern = /BRA|PANTY|BRIEF|SLIP|CAMISOLE|CHUDIDAR|LEHENGA|KURTI|SAREE|LEGGING|JEGGING|PALAZZO|NIGHTWEAR/i
const fallbackImages = {
  WOMEN: '/images/updated/grid1.jpg',
  MEN: '/images/men/mens13.jpeg',
  KIDS: '/images/kids/kids-girls-frock.jpg'
}

const productImageCandidates = product => unique([
  product?.shared_image_url,
  product?.front_image_url,
  product?.main_image_url,
  product?.image_url,
  ...(Array.isArray(product?.images) ? product.images : []),
  ...(Array.isArray(product?.variants) ? product.variants.flatMap(variant => [variant?.shared_image_url, variant?.front_image_url, variant?.main_image_url, variant?.image_url]) : [])
])
const firstImage = product => productImageCandidates(product)[0] || ''
const slugFor = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const shopPath = (gender, category) => `/shop/${clean(gender).toLowerCase()}/${clean(category?.slug || category?.categorySlug || category?.category_slug) || slugFor(category?.name || category?.category || 'all')}`
const productText = product => `${product?.categoryPath || product?.category_path || ''} ${product?.category || product?.category_name || ''} ${product?.name || product?.product_name || ''}`
const isInnerwear = product => innerwearPattern.test(productText(product))
const isValidForGender = (item, gender) => {
  const itemGender = upper(item?.rootName || item?.root_name || item?.gender || item?.categoryRoot || item?.category_root)
  if (!itemGender || itemGender !== gender) return false
  if (gender === 'MEN' && menExcludedPattern.test(clean(item?.name || item?.product_name || item?.category || item?.category_name))) return false
  return true
}
const productPrice = (product, userType) => userType === 'B2B'
  ? { original: number(product?.originalB2B || product?.original_price_b2b), final: number(product?.finalB2B || product?.final_price_b2b) }
  : { original: number(product?.originalB2C || product?.original_price_b2c), final: number(product?.finalB2C || product?.final_price_b2c) }
const groupHomepageProducts = rows => {
  const groups = new Map()
  ;(Array.isArray(rows) ? rows : []).forEach(product => {
    const key = `${normalize(product?.brand || product?.brand_name)}|${normalize(product?.name || product?.product_name)}`
    if (key === '|') return
    if (!groups.has(key)) groups.set(key, { ...product, variants: [], images: [], colours: [], sizes: [], designKey: key })
    const group = groups.get(key)
    group.variants = [...group.variants, ...(Array.isArray(product?.variants) ? product.variants : [product])]
    group.images = unique([...group.images, ...(Array.isArray(product?.images) ? product.images : []), product?.image_url, product?.front_image_url, product?.main_image_url])
    group.colours = unique([...group.colours, product?.colour, product?.color, ...(Array.isArray(product?.colours) ? product.colours : [])])
    group.sizes = unique([...group.sizes, product?.size, ...(Array.isArray(product?.sizes) ? product.sizes : [])])
  })
  return [...groups.values()]
}

function ResilientImage({ candidates = [], fallback, alt, ...props }) {
  const sourceKey = unique([...candidates, fallback]).join('|')
  const sources = useMemo(() => sourceKey.split('|').filter(Boolean), [sourceKey])
  const [index, setIndex] = useState(0)
  useEffect(() => setIndex(0), [sourceKey])
  if (!sources.length) return null
  return <img {...props} src={sources[Math.min(index, sources.length - 1)]} alt={alt} onError={() => setIndex(current => Math.min(current + 1, sources.length - 1))} />
}

function SectionHead({ eyebrow, title, link, linkText = 'View all' }) {
  return <div className="home-section-head"><div><span>{eyebrow}</span><h2>{title}</h2></div>{link && <Link to={link}>{linkText} <FaArrowRight /></Link>}</div>
}

export default function Home1() {
  const [imageMap, setImageMap] = useState({})
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const userType = upper(sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C')

  useEffect(() => {
    let active = true
    const load = async () => {
      const [homepageResult, productResult, categoryResult] = await Promise.allSettled([
        fetch(`${API_BASE}/api/homepage-images`, { cache: 'no-store' }).then(response => response.ok ? response.json() : []),
        fetchProducts({ limit: 50000, hasImage: true }),
        fetchCategories()
      ])
      if (!active) return
      if (homepageResult.status === 'fulfilled' && Array.isArray(homepageResult.value)) {
        const map = {}
        homepageResult.value.forEach(item => {
          if (item.id && item.imageUrl) map[item.id] = item.imageUrl
        })
        setImageMap(map)
      }
      if (productResult.status === 'fulfilled') setProducts(groupHomepageProducts(productResult.value))
      if (categoryResult.status === 'fulfilled') setCategories(Array.isArray(categoryResult.value) ? categoryResult.value : [])
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  const getImage = path => imageMap[path] || path
  const productsByGender = useMemo(() => ({
    WOMEN: products.filter(product => isValidForGender(product, 'WOMEN')),
    MEN: products.filter(product => isValidForGender(product, 'MEN')),
    KIDS: products.filter(product => isValidForGender(product, 'KIDS'))
  }), [products])
  const cleanProducts = useMemo(() => products.filter(product => {
    const gender = upper(product?.gender || product?.categoryRoot || product?.category_root)
    return Boolean(fallbackImages[gender]) && isValidForGender(product, gender) && !isInnerwear(product)
  }), [products])
  const discountedProducts = useMemo(() => [...cleanProducts].filter(product => {
    const price = productPrice(product, userType)
    return price.original > price.final && price.final > 0
  }).sort((a, b) => {
    const aPrice = productPrice(a, userType)
    const bPrice = productPrice(b, userType)
    return (bPrice.original - bPrice.final) / bPrice.original - (aPrice.original - aPrice.final) / aPrice.original
  }), [cleanProducts, userType])
  const under499 = useMemo(() => cleanProducts.filter(product => {
    const price = productPrice(product, userType)
    return price.final > 0 && price.final <= 499
  }), [cleanProducts, userType])
  const newArrivals = useMemo(() => [...cleanProducts].sort((a, b) => number(b.productId || b.id) - number(a.productId || a.id)), [cleanProducts])

  const categoriesFor = gender => {
    if (loading) return []
    const source = categories.filter(category => isValidForGender(category, gender) && number(category.level) > 0 && number(category.productCount || category.product_count) > 0)
    const distinct = new Map()
    source.forEach(category => {
      const key = upper(category.name)
      const current = distinct.get(key)
      if (!current || number(current.productCount || current.product_count) < number(category.productCount || category.product_count)) distinct.set(key, category)
    })
    return [...distinct.values()].sort((a, b) => number(a.sortOrder || a.sort_order) - number(b.sortOrder || b.sort_order)).slice(0, 8).map(category => {
      const match = productsByGender[gender].find(product => Number(product.categoryId || product.category_id) === Number(category.id) || upper(product.categoryPath || product.category_path).split('>').map(value => value.trim()).includes(upper(category.name)))
      return {
        ...category,
        imageCandidates: unique([firstImage(match), ...(category.imageCandidates || []), category.image, category.representativeImage, category.representative_image]),
        path: shopPath(gender, category)
      }
    })
  }

  const womenCategories = categoriesFor('WOMEN')
  const menCategories = categoriesFor('MEN')
  const kidsCategories = categoriesFor('KIDS')
  const bestGenderImage = gender => firstImage(productsByGender[gender].find(product => !isInnerwear(product) && firstImage(product))) || fallbackImages[gender]
  const genderCards = [
    { gender: 'WOMEN', title: 'Women', path: '/women' },
    { gender: 'MEN', title: 'Men', path: '/men' },
    { gender: 'KIDS', title: 'Kids', path: '/kids' }
  ].map(item => ({ ...item, image: bestGenderImage(item.gender) }))
  const brandCards = useMemo(() => {
    const map = new Map()
    cleanProducts.forEach(product => {
      const brand = clean(product.brand || product.brand_name)
      if (!brand) return
      const current = map.get(upper(brand))
      if (!current) map.set(upper(brand), { name: brand, image: firstImage(product), gender: upper(product.gender || product.categoryRoot) })
    })
    return [...map.values()].filter(item => item.image).slice(0, 8)
  }, [cleanProducts])

  const CategoryGrid = ({ items, gender }) => items.length > 0 && <div className="home-category-grid">{items.map(item => <Link to={item.path} className="home-category-card" key={`${gender}-${item.id}`}><div className="home-category-media"><ResilientImage candidates={item.imageCandidates} fallback={fallbackImages[gender]} alt={item.name} loading="lazy" /></div><div className="home-category-info"><h3>{item.name}</h3><span>Explore collection <FaArrowRight /></span></div></Link>)}</div>

  return <div className="home1-page-new-home">
    <section className="home1-hero-new-home"><div className="home1-hero-frame-new-home"><Swiper modules={[Autoplay, Pagination]} loop slidesPerView={1} autoplay={{ delay: 3500, disableOnInteraction: false }} speed={900} pagination={{ clickable: true }} grabCursor={true}>
      <SwiperSlide><div className="main-hero-slide"><img src={getImage('/images/ATTACH-BANNER.png')} alt="Home Banner 1" loading="eager" /></div></SwiperSlide>
      <SwiperSlide><div className="main-hero-slide"><img src={getImage('/images/CUCUMBER-BANNER.png')} alt="Cucumber Banner" loading="lazy" /></div></SwiperSlide>
      <SwiperSlide><div className="main-hero-slide"><img src={getImage('/images/QUICK-DRY-BANNER.png')} alt="Quick Dry Banner" loading="lazy" /></div></SwiperSlide>
      <SwiperSlide><div className="main-hero-slide"><img src={getImage('/images/JOCKEY-BANNER.png')} alt="Jockey Banner" loading="lazy" /></div></SwiperSlide>
      <SwiperSlide><div className="main-hero-slide"><img src={getImage('/images/TWIN-BIRDS-BANNER.png')} alt="Twin Birds Banner" loading="lazy" /></div></SwiperSlide>
      <SwiperSlide><div className="main-hero-slide"><img src={getImage('/images/INDIAN-FLOWER-BANNER.png')} alt="Indian Flower Banner" loading="lazy" /></div></SwiperSlide>
      <SwiperSlide><div className="main-hero-slide"><img src={getImage('/images/DAZZEL-BANNER.png')} alt="Dazzel Banner" loading="lazy" /></div></SwiperSlide>
      <SwiperSlide><div className="main-hero-slide"><img src={getImage('/images/ASWATI-BANNER.png')} alt="Aswati Banner" loading="lazy" /></div></SwiperSlide>
    </Swiper></div></section>
    <Divider label="Attach" direction="ltr" />
    <section className="home-gender-section"><SectionHead eyebrow="Explore Attach" title="Shop your way" /><div className="home-gender-grid">{loading ? ['WOMEN', 'MEN', 'KIDS'].map(item => <div className="home-gender-card home-gender-loading" key={item} />) : genderCards.map(item => <Link to={item.path} key={item.gender} className="home-gender-card"><ResilientImage candidates={[item.image]} fallback={fallbackImages[item.gender]} alt={item.title} /><div><h2>{item.title}</h2><span>Shop now <FaArrowRight /></span></div></Link>)}</div></section>
    <Divider label="Women" direction="rtl" />
    {womenCategories.length > 0 && <section className="home-category-section"><SectionHead eyebrow="For her" title="Women shop by category" link="/women" /><CategoryGrid items={womenCategories} gender="WOMEN" /></section>}
    <ProductSection eyebrow="Prices worth waiting for" title="Price drops" products={discountedProducts.slice(0, 14)} userType={userType} link="/shop/women/all" listingMode />
    <Divider label="New Prices" direction="ltr" />
    <ProductSection eyebrow="Trending now" title="Loved by women" products={productsByGender.WOMEN.filter(product => !isInnerwear(product)).slice(0, 14)} userType={userType} link="/shop/women/all" listingMode />
    <section className="home-men-editorial"><div className="home-men-editorial-main"><ResilientImage candidates={[bestGenderImage('MEN')]} fallback={fallbackImages.MEN} alt="Shop for men" /><div><span>Modern essentials</span><h2>Shop for men</h2><p>Sharp everyday pieces, comfortable fits and dependable style.</p><Link to="/men">Explore men <FaArrowRight /></Link></div></div><div className="home-men-editorial-side">{menCategories.slice(0, 4).map(item => <Link to={item.path} key={item.id}><ResilientImage candidates={item.imageCandidates} fallback={fallbackImages.MEN} alt={item.name} /><strong>{item.name}</strong><i><FaArrowRight /></i></Link>)}</div></section>
    <Divider label="Men" direction="rtl" />
    {menCategories.length > 0 && <section className="home-category-section"><SectionHead eyebrow="For him" title="Men shop by category" link="/men" /><CategoryGrid items={menCategories} gender="MEN" /></section>}
    <ProductSection eyebrow="Everyday rotation" title="Men's essentials" products={productsByGender.MEN.slice(0, 14)} userType={userType} link="/shop/men/all" listingMode />
    {brandCards.length > 0 && <section className="home-brand-section"><SectionHead eyebrow="Names you know" title="Shop by brand" link="/brands" /><div className="home-brand-grid">{brandCards.map(brand => <Link to={`/brands?brand=${encodeURIComponent(brand.name)}`} key={brand.name}><ResilientImage candidates={[brand.image]} fallback={fallbackImages[brand.gender] || fallbackImages.WOMEN} alt={brand.name} /><div><strong>{brand.name}</strong><span>Discover brand <FaArrowRight /></span></div></Link>)}</div></section>}
    <Divider label="Best Value" direction="ltr" />
    <ProductSection eyebrow="Smart shopping" title="Under ₹499" products={under499.slice(0, 14)} userType={userType} link="/shop/women/all" listingMode />
    <ProductSection eyebrow="Just landed" title="New arrivals" products={newArrivals.slice(0, 14)} userType={userType} link="/shop/women/all" listingMode />
    {kidsCategories.length > 0 && <><Divider label="Kids" direction="rtl" /><section className="home-category-section"><SectionHead eyebrow="For little ones" title="Kids shop by category" link="/kids" /><CategoryGrid items={kidsCategories} gender="KIDS" /></section><ProductSection eyebrow="Play-ready picks" title="Kids favourites" products={productsByGender.KIDS.slice(0, 14)} userType={userType} link="/shop/kids/all" listingMode /></>}
    <ProductSection eyebrow="Curated for you" title="More to explore" products={cleanProducts.slice(0, 14)} userType={userType} link="/shop/women/all" listingMode />
  </div>
}
