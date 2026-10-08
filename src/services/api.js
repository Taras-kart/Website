const API_BASE=String(process.env.REACT_APP_API_BASE||'https://taras-kart-backend.vercel.app').replace(/\/+$/,'')
const getToken=()=>sessionStorage.getItem('userToken')||localStorage.getItem('userToken')||''
const cache=new Map(),pending=new Map()
export async function apiRequest(path,options={}){
  const url=`${API_BASE}${path.startsWith('/')?path:`/${path}`}`,method=(options.method||'GET').toUpperCase()
  const publicRead=method==='GET'&&/^\/api\/(products\/(catalogue|facets|\d+\/family)|categories\?|homepage-images)/.test(path)
  const saved=cache.get(url)
  if(publicRead&&saved&&saved.expiry>Date.now())return saved.value
  if(publicRead&&!options.signal&&pending.has(url))return pending.get(url)
  const request=async()=>{
    const token=getToken(),isForm=options.body instanceof FormData
    const response=await fetch(url,{...options,headers:{...(options.body&&!isForm?{'Content-Type':'application/json'}:{}),...(!publicRead&&token?{Authorization:`Bearer ${token}`} :{}),...(options.headers||{})},body:options.body&&!isForm&&typeof options.body!=='string'?JSON.stringify(options.body):options.body})
    const data=await response.json().catch(()=>({}))
    if(!response.ok){const error=new Error(data.message||data.error||`Request failed (${response.status})`);error.status=response.status;throw error}
    if(publicRead){if(cache.size>80)cache.delete(cache.keys().next().value);cache.set(url,{value:data,expiry:Date.now()+15000})}
    if(method!=='GET')cache.clear()
    return data
  }
  const promise=request()
  if(publicRead&&!options.signal){pending.set(url,promise);try{return await promise}finally{pending.delete(url)}}
  return promise
}
export {API_BASE,getToken}
