import React,{useEffect,useState} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import {FiArrowRight,FiSearch} from 'react-icons/fi'
import {fetchFacets} from '../services/productsApi'
import {brands} from '../services/brands'
import brandAssets from '../services/brandAssets.json'
import './Brands.css'
import CatalogImage from '../components/CatalogImage'
const slug=value=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-')
export default function Brands(){
  const {brandSlug,categoryId}=useParams(),navigate=useNavigate()
  const brand=[...brands.map(([name])=>name),'Fashion'].find(name=>slug(name)===brandSlug)||''
  const [data,setData]=useState({brands:[],categories:[]}),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('')
  useEffect(()=>{let active=true;setLoading(true);setError('');fetchFacets({brand,images:brand?'true':'false'}).then(result=>{if(active)setData(result)}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[brand])
  const selected=data.categories.find(row=>String(row.id)===categoryId)
  const children=data.categories.filter(row=>categoryId?String(row.parent_id)===categoryId:Number(row.level)===1)
  const shop=id=>navigate(`/category-display?brand=${encodeURIComponent(brand)}${id?`&categoryId=${id}`:''}`)
  const open=row=>data.categories.some(child=>Number(child.parent_id)===Number(row.id))?navigate(`/brands/${slug(brand)}/${row.id}`):shop(row.id)
  return <main className="tara-brands tb-compact"><header className="tb-header"><nav className="tb-breadcrumb" aria-label="Breadcrumb"><Link to="/brands">All brands</Link>{brand&&<><span>/</span><Link to={`/brands/${slug(brand)}`}>{brand}</Link></>}{selected&&<><span>/</span><span>{selected.name}</span></>}</nav><div className="tb-title"><h1>{selected?.name||brand||'Shop by brand'}</h1>{brand?<button onClick={()=>shop(selected?.id)}>Shop all {selected?.name||brand} <FiArrowRight/></button>:<label><FiSearch/><input aria-label="Search brands" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Find a brand"/></label>}</div></header>
    {error&&<p role="alert">{error}</p>}{loading?<section className="tara-brand-grid">{Array.from({length:8},(_,i)=><div className="tara-brand-skeleton" key={i}/>)}</section>:!brand?<section className="tara-brand-grid">{data.brands.filter(item=>item.name.toLowerCase().includes(query.toLowerCase())).map(item=><Link key={item.name} className="tara-brand-card tara-brand-logo-card" to={`/brands/${slug(item.name)}`}><div className="tara-brand-logo">{brandAssets[item.name]?.image?<img src={brandAssets[item.name].image} alt={item.name} style={item.name==='Gokul'?{objectFit:'cover',objectPosition:'top'}:undefined} loading="lazy" onError={event=>{event.currentTarget.style.display='none'}}/>:<strong>{item.name}</strong>}</div><span><strong>{item.name}</strong><i>Explore collection <FiArrowRight/></i></span></Link>)}</section>:<section className="tara-category-directory">{children.map(row=><button key={row.id} onClick={()=>open(row)}><div className="tb-category-image"><CatalogImage record={row} alt={row.name}/></div><div className="tb-category-copy"><small>{row.gender}</small><h2>{row.name}</h2><FiArrowRight/></div></button>)}{!children.length&&<div className="tara-brand-empty">{selected?'View products in this category.':'This brand has no active products yet.'}</div>}</section>}
  </main>
}
