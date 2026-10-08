const BASE=(process.env.REACT_APP_API_BASE||'https://taras-kart-backend.vercel.app').replace(/\/+$/,'')
const token=()=>localStorage.getItem('tk_id_token')||localStorage.getItem('userToken')||sessionStorage.getItem('tk_id_token')||''

export async function request(path,options={}){
  const headers={...(options.body&&!(options.body instanceof FormData)?{'Content-Type':'application/json'}:{}),...(token()?{Authorization:`Bearer ${token()}`} :{}),...(options.headers||{})}
  const response=await fetch(`${BASE}${path.startsWith('/')?path:`/${path}`}`,{...options,headers,body:options.body&&!(options.body instanceof FormData)&&typeof options.body!=='string'?JSON.stringify(options.body):options.body,cache:options.cache||'no-store'})
  const data=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(data.message||data.error||`Request failed (${response.status})`)
  return data
}

export const api={
  products:(params={})=>request(`/api/products?${new URLSearchParams(Object.entries(params).filter(([,v])=>v!==''&&v!=null)).toString()}`),
  search:q=>request(`/api/products/search?${new URLSearchParams({q,limit:'200'}).toString()}`),
  homepage:()=>request('/api/homepage-images').catch(()=>[]),
  cart:userId=>request(`/api/cart/${encodeURIComponent(userId)}`),
  cartCount:userId=>request(`/api/cart/count/${encodeURIComponent(userId)}`),
  addCart:body=>request('/api/cart/tarascart',{method:'POST',body}),
  updateCart:body=>request('/api/cart/tarascart',{method:'PUT',body}),
  removeCart:body=>request('/api/cart/tarascart',{method:'DELETE',body}),
  wishlist:userId=>request(`/api/wishlist/${encodeURIComponent(userId)}`),
  addWishlist:body=>request('/api/wishlist',{method:'POST',body}),
  removeWishlist:body=>request('/api/wishlist',{method:'DELETE',body}),
  login:body=>request('/api/auth/login',{method:'POST',body}),
  signup:body=>request('/api/b2c-customers/signup',{method:'POST',body}),
  orders:(email,mobile='')=>request(`/api/sales/web/by-user?${new URLSearchParams({email,mobile}).toString()}`),
  order:id=>request(`/api/sales/web/${encodeURIComponent(id)}`),
  placeOrder:body=>request('/api/sales/web/place',{method:'POST',body}),
  placeB2B:body=>request('/api/sales/web/b2b-place',{method:'POST',body}),
  track:id=>request(`/api/shiprocket/track/${encodeURIComponent(id)}`),
  coins:email=>request(`/api/coins/wallet?email=${encodeURIComponent(email)}`).catch(()=>({balance:0})),
  b2b:brand=>request(`/api/b2b/products?${new URLSearchParams(brand?{brand}:{})}`)
}
