import React from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import ProductCard from './ProductCard'
import './ProductSection.css'

export default function ProductSection({ eyebrow, title, products = [], userType = 'B2C', link = '/category-display', listingMode = false }) {
  if (!products.length) return null
  return <section className="tara-product-section"><div className="tara-section-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div><Link to={link}>View all <FaArrowRight /></Link></div><div className="tara-product-rail">{products.map(product => <ProductCard key={product.designKey || product.productId || product.id} product={product} userType={userType} listingMode={listingMode} />)}</div></section>
}
