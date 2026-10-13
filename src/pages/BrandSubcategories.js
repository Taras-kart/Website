import React, {useEffect, useMemo, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {FiArrowLeft, FiArrowRight} from 'react-icons/fi'
import {brands} from '../services/brands'
import {fetchFacets} from '../services/productsApi'
import {fetchSubcategories, subtypeTitle} from '../services/subcategoriesApi'
import CatalogImage from '../components/CatalogImage'
import './Brands.css'
import './BrandSubcategories.css'

const slug = value => String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')
const getBrand = value => [...brands.map(([name])=>name),'Fashion'].find(name=>slug(name)===value) || ''

export default function BrandSubcategories() {
  const {brandSlug,categoryId}=useParams()
  const navigate=useNavigate()
  const brand=useMemo(()=>getBrand(brandSlug),[brandSlug])
  const [facets,setFacets]=useState({categories:[]})
  const [subtypes,setSubtypes]=useState([])
  const [total,setTotal]=useState(0)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{
    if (!brand || !/^\d+$/.test(String(categoryId))) {setLoading(false);setError('Brand or category not found');return}
    const controller=new AbortController()
    setLoading(true);setError('');setSubtypes([])
    Promise.all([
      fetchFacets({brand,images:'true'},{signal:controller.signal}),
      fetchSubcategories({brand,categoryId},{signal:controller.signal})
    ]).then(([categoryData, subtypeData])=>{
      if(controller.signal.aborted)return
      setFacets(categoryData)
      setSubtypes(subtypeData.subcategories||[])
      setTotal(subtypeData.total||0)
    }).catch(e=>{if(!controller.signal.aborted)setError(e.message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)})
    return()=>controller.abort()
  },[brand,categoryId])

  const categories=facets.categories||[]
  const selected=categories.find(c=>String(c.id)===String(categoryId))
  const children=categories.filter(c=>String(c.parent_id)===String(categoryId))
  const collection=(id,subtype)=>{
    const q=new URLSearchParams({brand,categoryId:String(id)})
    if(subtype)q.set('subtype',subtype)
    navigate(`/category-display?${q}`)
  }
  const visitCategory=category=>{
    const hasChildren=categories.some(row=>String(row.parent_id)===String(category.id))
    if(hasChildren)navigate(`/brands/${brandSlug}/${category.id}/subcategories`)
    else collection(category.id)
  }
  const goBack=()=>{
    if(selected?.parent_id&&categories.some(c=>String(c.id)===String(selected.parent_id)&&Number(c.level)>0)){
      navigate(`/brands/${brandSlug}/${selected.parent_id}/subcategories`)
    }else navigate(`/brands/${brandSlug}`)
  }
  return <main className="tara-brands tb-compact tara-subcategory-page">
    <header className="tb-header">
      <nav className="tb-breadcrumb" aria-label="Breadcrumb">
        <Link to="/brands">All brands</Link><span>/</span>
        <Link to={`/brands/${brandSlug}`}>{brand||'Brand'}</Link><span>/</span>
        <span aria-current="page">{selected?.name||'Subcategories'}</span>
      </nav>
      <button type="button" className="tsc-back" onClick={goBack}><FiArrowLeft/> Back to categories</button>
      <div className="tb-title"><div><small className="tsc-eyebrow">Choose a subcategory</small>
        <h1>{selected?.name||'Shop subcategories'}</h1>
        <p className="tsc-description">Select a style to browse only matching {selected?.name?.toLowerCase()||'products'} from {brand}.</p></div>
        {selected&&<button type="button" onClick={()=>collection(selected.id)}>View all {selected.name}<FiArrowRight/></button>}
      </div>
    </header>
    {error?<section className="tsc-message" role="alert"><h2>Unable to load subcategories</h2><p>{error}</p><button onClick={()=>window.location.reload()}>Try again</button></section>
    :loading?<section className="tara-category-directory">{Array.from({length:4},(_,i)=><div key={i} className="tara-brand-skeleton"/>)}</section>
    :!selected?<section className="tsc-message"><h2>Category unavailable</h2><p>This category does not have active products for this brand.</p><Link to={`/brands/${brandSlug}`}>Back to {brand}</Link></section>
    :children.length?<section className="tara-category-directory" aria-label="Subcategories">
      {children.map(child=><button type="button" key={child.id} onClick={()=>visitCategory(child)}>
        <div className="tb-category-image"><CatalogImage record={child} alt={child.name}/></div>
        <div className="tb-category-copy"><small>{child.product_count||0} styles</small><h2>{child.name}</h2><FiArrowRight/></div>
      </button>)}
    </section>
    :subtypes.length?<section className="tara-category-directory" aria-label="Subcategories">
      {subtypes.map(item=><button type="button" key={item.slug} onClick={()=>collection(selected.id,item.slug)}>
        <div className="tb-category-image"><CatalogImage record={item} alt={subtypeTitle(item.slug,selected.name)}/></div>
        <div className="tb-category-copy"><small>{item.count} {item.count===1?'style':'styles'}</small><h2>{subtypeTitle(item.slug,selected.name)}</h2><FiArrowRight/></div>
      </button>)}
    </section>
    :total>0?<section className="tara-category-directory" aria-label="Subcategories">
      <button type="button" onClick={()=>collection(selected.id)}><div className="tb-category-image"><CatalogImage record={selected} alt={selected.name}/></div><div className="tb-category-copy"><small>{total} styles</small><h2>All {selected.name}</h2><FiArrowRight/></div></button>
    </section>
    :<section className="tsc-message"><h2>No available styles</h2><p>There are no active products in this category for {brand}.</p><button onClick={goBack}>Browse other categories</button></section>}
  </main>
}
