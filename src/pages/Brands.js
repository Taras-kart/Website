import React, { useEffect, useMemo, useState } from 'react'
import { FiArrowRight, FiSearch } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../services/productsApi'
import './Brands.css'

export default function Brands(){
  const navigate=useNavigate()
  const [products,setProducts]=useState([])
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{let active=true;Promise.all(['WOMEN', 'MEN', 'KIDS'].map(gender => fetchProducts({ gender, limit: 50000 }))).then(groups => groups.flat()).then(rows=>{if(active)setProducts(rows)}).catch(reason=>{if(active)setError(reason.message || 'Unable to load brands')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[])
  const brands=useMemo(()=>{
    const map=new Map()
    products.forEach(product=>{const name=String(product.brand||'Attach').trim();const key=name.toLowerCase();if(!map.has(key))map.set(key,{name,count:0,image:product.images?.[0]});map.get(key).count+=1})
    return [...map.values()].filter(item=>item.name.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name))
  },[products,query])
  return <main className="tara-brands"><section className="tara-brands-hero"><span>Our labels</span><h1>Brands at Attach</h1><p>Discover trusted names and shop their complete collections with live prices and availability.</p><label><FiSearch/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search brands" /></label></section>{error && <p role="alert">{error}</p>}<section className="tara-brand-grid">{loading?Array.from({length:8},(_,index)=><div className="tara-brand-skeleton" key={index}/>):brands.map(brand=><button key={brand.name} className="tara-brand-card" onClick={()=>navigate(`/category-display?brand=${encodeURIComponent(brand.name)}`)}><img src={brand.image} alt=""/><span><small>{brand.count} styles</small><strong>{brand.name}</strong><i>Explore collection <FiArrowRight/></i></span></button>)}</section>{!loading&&!brands.length&&<div className="tara-brand-empty">No brands match “{query}”.</div>}</main>
}
