import React, { useEffect, useMemo, useState } from 'react'
import { FiChevronDown, FiFilter, FiSearch, FiX } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import ProductCard from './ProductCard'
import { fetchFacets, fetchProductPage } from '../services/productsApi'
import './CollectionPage.css'

export default function CollectionPage({gender='',title,eyebrow='Attach collections',description='',initialCategorySlug='',searchMode=false}) {
  const location=useLocation(),navigate=useNavigate()
  const params=useMemo(()=>new URLSearchParams(location.search),[location.search])
  const [data,setData]=useState({products:[],total:0,hasMore:false})
  const [facets,setFacets]=useState({brands:[],categories:[]})
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[filtersOpen,setFiltersOpen]=useState(false)
  const [draftSearch,setDraftSearch]=useState(params.get('q')||'')
  const selectedGender=params.get('gender')||gender,brand=params.get('brand')||'',categoryId=params.get('categoryId')||'',sort=params.get('sort')||'featured'
  const currentPage=Math.max(1,Number(params.get('page'))||1),limit=24
  const query=params.get('q')||'',min=params.get('min')||'',max=params.get('max')||''
  const userType=(sessionStorage.getItem('userType')||localStorage.getItem('userType')||'B2C').toUpperCase()
  useEffect(()=>setDraftSearch(query),[query])
  useEffect(()=>{
    const controller=new AbortController()
    setLoading(true);setError('')
    const request={...Object.fromEntries(params),gender:selectedGender,categoryId,categorySlug:categoryId?'':initialCategorySlug,offset:(currentPage-1)*limit,limit}
    fetchProductPage(request,{signal:controller.signal}).then(result=>{if(!controller.signal.aborted)setData(result)}).catch(reason=>{if(!controller.signal.aborted)setError(reason.message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)})
    return()=>controller.abort()
  },[params,selectedGender,categoryId,initialCategorySlug,currentPage])
  useEffect(()=>{
    let active=true
    fetchFacets({gender:selectedGender,brand}).then(result=>{if(active)setFacets(result)}).catch(()=>{})
    return()=>{active=false}
  },[selectedGender,brand])
  const categories=facets.categories.filter(category=>Number(category.level)>0)
  const selectedCategory=categories.find(category=>String(category.id)===categoryId||(!categoryId&&category.slug===initialCategorySlug))
  const categoryPath=category=>{
    const names=[],visited=new Set();let current=category
    while(current&&!visited.has(current.id)){visited.add(current.id);names.unshift(current.name);const parent=current.parent_id;current=facets.categories.find(row=>Number(row.id)===Number(parent))}
    return names.join(' / ')
  }
  const update=changes=>{
    const next=new URLSearchParams(location.search)
    if(gender&&!next.has('gender'))next.set('gender',gender)
    if(initialCategorySlug&&!categoryId&&selectedCategory&&!Object.hasOwn(changes,'categoryId'))next.set('categoryId',selectedCategory.id)
    if(!Object.hasOwn(changes,'page'))next.delete('page')
    Object.entries(changes).forEach(([key,value])=>value?next.set(key,value):next.delete(key))
    navigate(`${initialCategorySlug?'/category-display':location.pathname}?${next}`)
  }
  const clear=()=>navigate(`/category-display${gender?`?gender=${gender}`:''}`)
  const activeCount=[brand,selectedCategory,min,max,query,params.get('inStock')].filter(Boolean).length
  const heading=title||selectedCategory?.name||brand||(query?`Results for ${query}`:'All products')
  return <main className="tara-collection">
    <section className="tara-collection-hero"><div><span>{eyebrow}</span><h1>{heading}</h1><p>{selectedCategory?categoryPath(selectedCategory):description||'Find your next favourite style.'}</p></div><div className="tara-collection-stat"><strong>{loading?'...':data.total}</strong><span>styles</span></div></section>
    {searchMode&&<form className="tara-collection-search" onSubmit={event=>{event.preventDefault();update({q:draftSearch})}}><FiSearch/><input aria-label="Search products" value={draftSearch} onChange={event=>setDraftSearch(event.target.value)} placeholder="Search by style, brand or category"/><button>Search</button></form>}
    <div className="tara-collection-toolbar"><button className="tara-filter-trigger" onClick={()=>setFiltersOpen(true)}><FiFilter/> Filters {activeCount>0&&<b>{activeCount}</b>}</button><p>{loading?'Loading styles':`${data.total} styles`}</p><label className="tara-sort">Sort by<select value={sort} onChange={event=>update({sort:event.target.value})}><option value="featured">Featured</option><option value="new">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select><FiChevronDown/></label></div>
    <div className="tara-filter-chips">{brand&&<button onClick={()=>update({brand:'',categoryId:''})}>{brand} <FiX/></button>}{selectedCategory&&<button onClick={()=>update({categoryId:''})}>{categoryPath(selectedCategory)} <FiX/></button>}{query&&<button onClick={()=>update({q:''})}>Search: {query} <FiX/></button>}</div>
    <div className="tara-collection-layout"><aside className={`tara-filter-panel ${filtersOpen?'is-open':''}`}><div className="tara-filter-head"><h2>Filters</h2><button aria-label="Close filters" onClick={()=>setFiltersOpen(false)}><FiX/></button></div>
      {!gender&&<div className="tara-filter-group"><h3>Department</h3><select aria-label="Department" value={selectedGender} onChange={event=>update({gender:event.target.value,categoryId:''})}><option value="">All departments</option>{['WOMEN','MEN','KIDS'].map(value=><option key={value}>{value}</option>)}</select></div>}
      <div className="tara-filter-group"><h3>Brand</h3><div className="tara-filter-options"><label><input type="radio" name="brand" checked={!brand} onChange={()=>update({brand:'',categoryId:''})}/>All brands</label>{facets.brands.filter(row=>row.count>0||row.name===brand).map(row=><label key={row.name}><input type="radio" name="brand" checked={brand===row.name} onChange={()=>update({brand:row.name,categoryId:''})}/><span>{row.name}</span></label>)}</div></div>
      <div className="tara-filter-group"><h3>Category and subcategory</h3><select aria-label="Category and subcategory" value={selectedCategory?.id||''} onChange={event=>update({categoryId:event.target.value})}><option value="">All categories</option>{categories.map(row=><option key={row.id} value={row.id}>{categoryPath(row)}</option>)}</select></div>
      <div className="tara-filter-group"><h3>Price</h3><div className="tara-price-fields"><label>Min<input type="number" min="0" value={min} onChange={event=>update({min:event.target.value})}/></label><label>Max<input type="number" min="0" value={max} onChange={event=>update({max:event.target.value})}/></label></div></div>
      <div className="tara-filter-group"><label><input type="checkbox" checked={params.get('inStock')==='true'} onChange={event=>update({inStock:event.target.checked?'true':''})}/> In stock only</label></div><button className="tara-filter-clear" onClick={clear}>Clear all filters</button>
    </aside>{filtersOpen&&<button className="tara-filter-backdrop" onClick={()=>setFiltersOpen(false)} aria-label="Close filters"/>}<section className="tara-collection-results" aria-busy={loading}>
      {error&&<div className="tara-collection-message" role="alert"><h2>Unable to load products</h2><p>{error}</p><button onClick={()=>window.location.reload()}>Try again</button></div>}
      {loading&&<div className="tara-product-grid">{Array.from({length:8},(_,index)=><div className="tara-product-skeleton" key={index}><i/><span/><small/></div>)}</div>}
      {!loading&&!error&&data.products.length>0&&<><div className="tara-product-grid">{data.products.map(product=><ProductCard key={product.designKey||product.id} product={product} userType={userType}/>)}</div><div className="tara-pagination"><button disabled={currentPage===1} onClick={()=>update({page:currentPage-1})}>Previous</button><span>Page {currentPage} of {Math.max(1,Math.ceil(data.total/limit))}</span><button disabled={!data.hasMore} onClick={()=>update({page:currentPage+1})}>Next</button></div></>}
      {!loading&&!error&&!data.products.length&&<div className="tara-collection-message"><h2>No matching styles</h2><p>Try changing a filter.</p><button onClick={clear}>View all products</button></div>}
    </section></div>
  </main>
}
