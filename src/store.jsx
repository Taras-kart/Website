import React,{createContext,useContext,useEffect,useMemo,useState} from 'react'
import { api } from './api'

const StoreContext=createContext(null)
const readUser=()=>{try{return JSON.parse(localStorage.getItem('tara_user')||'null')}catch{return null}}

export function StoreProvider({children}){
  const [user,setUserState]=useState(readUser)
  const [cartCount,setCartCount]=useState(0)
  const [wishlistIds,setWishlistIds]=useState(new Set())
  const setUser=value=>{setUserState(value);if(value){localStorage.setItem('tara_user',JSON.stringify(value));localStorage.setItem('userId',String(value.id||''));localStorage.setItem('userEmail',value.email||'');localStorage.setItem('userType',value.type||'B2C')}else{['tara_user','userId','userEmail','userName','userType','tk_id_token','userToken'].forEach(k=>localStorage.removeItem(k))}}
  const refresh=async()=>{if(!user?.id){setCartCount(0);setWishlistIds(new Set());return}const [count,wishlist]=await Promise.all([api.cartCount(user.id).catch(()=>({count:0})),api.wishlist(user.id).catch(()=>[])]);setCartCount(Number(count.count||0));setWishlistIds(new Set((Array.isArray(wishlist)?wishlist:[]).map(x=>String(x.variant_id||x.product_id||x.id))))}
  useEffect(()=>{refresh()},[user?.id])
  const value=useMemo(()=>({user,setUser,cartCount,wishlistIds,refresh,isB2B:String(user?.type||'B2C').toUpperCase()==='B2B'}),[user,cartCount,wishlistIds])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore=()=>useContext(StoreContext)
