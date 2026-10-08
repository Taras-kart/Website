import React,{useEffect,useState} from 'react'
import {imageSources} from '../services/productImages'
export default function CatalogImage({record,alt,className}){
  const sources=[...imageSources(record),'/images/defaults/product.svg'],key=sources.join('|')
  const [index,setIndex]=useState(0)
  useEffect(()=>setIndex(0),[key])
  return <img className={className} src={sources[Math.min(index,sources.length-1)]} alt={alt} loading="lazy" onError={()=>setIndex(value=>Math.min(value+1,sources.length-1))}/>
}
