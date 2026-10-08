import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiHeart, FiHelpCircle, FiMinus, FiPackage, FiPlus, FiShare2, FiShoppingBag } from 'react-icons/fi';
import Footer from './Footer';
import ProductSection from '../components/ProductSection';
import './ProductDetailsPage.css';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { fetchProducts } from '../services/productsApi';
import { apiRequest } from '../services/api';
import { displayBrand } from '../services/brands';
import { packSizeFor } from '../services/checkoutApi';
const CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD || 'deymt9uyh';
const clean = value => String(value || '').trim();
const unique = values => [...new Set(values.map(clean).filter(Boolean))];
const positiveId = value => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};
const fallbackFor = gender => clean(gender).toUpperCase() === 'MEN' ? '/images/defaults/attach-men.svg' : clean(gender).toUpperCase() === 'KIDS' ? '/images/defaults/attach-kids.svg' : '/images/defaults/attach-women.svg';
const imageCandidates = product => {
  const ean = clean(product?.ean_code);
  const sharedImages = unique([product?.shared_image_url, product?.front_image_url, product?.back_image_url, product?.main_image_url, ...(Array.isArray(product?.images) ? product.images : [])]);
  const images = sharedImages.length ? sharedImages : unique([product?.variant_image_url, product?.ean_image_url, product?.image_url]);
  return images.length ? images : unique([ean ? `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/products/${encodeURIComponent(ean)}` : '']);
};
const pricingFor = (product, type) => {
  const b2b = clean(type).toUpperCase() === 'B2B';
  const mrp = Number(b2b ? product?.original_price_b2b || product?.mrp : product?.original_price_b2c || product?.mrp) || 0;
  const price = Number((b2b ? product?.final_price_b2b ?? product?.sale_price : product?.final_price_b2c ?? product?.sale_price) ?? mrp);
  return {
    mrp,
    price,
    discount: mrp > price && mrp > 0 ? Math.round((mrp - price) / mrp * 100) : 0
  };
};
const money = value => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function SafeImage({
  sources,
  alt,
  className
}) {
  const key = sources.join('|');
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [key]);
  return <img className={className} src={sources[Math.min(index, sources.length - 1)]} alt={alt} onError={() => setIndex(current => Math.min(current + 1, sources.length - 1))} />;
}
export default function ProductDetailsPage() {
  const {
    variantId
  } = useParams();
  const navigate = useNavigate();
  const {
    addToCart
  } = useCart();
  const {
    addToWishlist
  } = useWishlist();
  const [baseProduct, setBaseProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(positiveId(variantId));
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const colourRail = useRef(null);
  const [adding,setAdding] = useState(false);
  const userType = typeof window === 'undefined' ? 'B2C' : sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C';
  useEffect(() => {
    const id = positiveId(variantId);
    if (!id) {
      setError('Invalid product link');
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const payload = await apiRequest(`/api/products/${id}/family`, {signal:controller.signal});
        if(controller.signal.aborted) return;
        const product=payload.product;
        setBaseProduct(product);
        setVariants(payload.variants || [product]);
        setSelectedVariantId(id);
        setQuantity(1);
        setLoading(false);
        fetchProducts({gender:product.gender,categoryId:product.category_id,limit:12}).then(rows => { if(!controller.signal.aborted) setSimilarProducts(rows.filter(row=>row.style_key!==product.style_key).slice(0,10)); }).catch(()=>{});
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError?.message || 'Unable to load this product');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [variantId]);
  const selected = useMemo(() => variants.find(item => Number(item?.id) === Number(selectedVariantId)) || baseProduct, [variants, selectedVariantId, baseProduct]);
  const colourGroups = useMemo(() => {
    const groups = new Map();
    variants.forEach(item => {
      const colour = clean(item?.color || item?.colour) || 'Default';
      if (!groups.has(colour)) groups.set(colour, {
        colour,
        item,
        images: []
      });
      groups.get(colour).images = unique([...groups.get(colour).images, ...imageCandidates(item)]);
    });
    return [...groups.values()];
  }, [variants]);
  const selectedColour = clean(selected?.color || selected?.colour) || 'Default';
  const sizes = useMemo(() => unique(variants.filter(item => (clean(item?.color || item?.colour) || 'Default') === selectedColour).map(item => item?.size)), [variants, selectedColour]);
  const galleryImages = useMemo(() => {
    const databaseImages = unique(imageCandidates(selected));
    return databaseImages.length > 0 ? databaseImages : [fallbackFor(selected?.gender)];
  }, [selected]);
  const mainImage = activeImage && galleryImages.includes(activeImage) ? activeImage : galleryImages[0];
  const pricing = pricingFor(selected, userType);
  const packSize = packSizeFor(selected);
  const productName = clean(selected?.product_name || selected?.name || 'Product');
  const stock = Number(selected?.available_qty ?? 0);
  useEffect(() => {setActiveImage('');setQuantity(1)}, [selectedVariantId]);
  const chooseColour = colour => {
    const options=variants.filter(item => (clean(item?.color || item?.colour) || 'Default').toLowerCase() === colour.toLowerCase());
    const next=options.find(item=>clean(item.size)===clean(selected?.size)&&Number(item.available_qty)>0)||options.find(item=>Number(item.available_qty)>0)||options[0];
    if (next) setSelectedVariantId(positiveId(next.id));
  };
  const chooseSize = size => {
    const next = variants.find(item => clean(item?.size) === size && (clean(item?.color || item?.colour) || 'Default') === selectedColour);
    if (next) setSelectedVariantId(positiveId(next.id));
  };
  const notify = text => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2200);
  };
  const itemPayload = () => ({
    ...baseProduct,
    ...selected,
    variant_id: positiveId(selected?.id),
    product_id: positiveId(selected?.product_id || baseProduct?.product_id),
    selectedColor: selectedColour === 'Default' ? '' : selectedColour,
    selectedSize: clean(selected?.size),
    image_url: mainImage,
    quantity
  });
  const addBag = async destination => {
    if(adding || stock < quantity) return notify('This quantity is not available');
    const item = itemPayload();
    if (!item.variant_id) return notify('Please select a valid size and colour');
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || '';
    if (!positiveId(userId)) return notify('Please sign in to add products to your bag');
    try {
      setAdding(true);
      await apiRequest('/api/cart/tarascart',{method:'POST',body:{user_id:String(userId),product_id:item.variant_id,selected_size:item.selectedSize,selected_color:item.selectedColor,quantity}});
      addToCart(item);
      navigate(destination);
    } catch {
      notify('Unable to add this product to your bag');
    } finally {setAdding(false)}
  };
  const addWish = async () => {
    const item = itemPayload();
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || '';
    if (!positiveId(userId)) return notify('Please sign in to save products');
    try {
      await apiRequest('/api/wishlist',{method:'POST',body:{user_id:String(userId),product_id:item.product_id,ean_code:item.ean_code||'',image_url:item.image_url||'',color:item.selectedColor||''}});
      addToWishlist(item);
      notify('Added to your wishlist');
    } catch {
      notify('Unable to add this product to your wishlist');
    }
  };
  const shareProduct = async () => {
    try {
      if (navigator.share) await navigator.share({
        title: productName,
        url: window.location.href
      });else {
        await navigator.clipboard.writeText(window.location.href);
        notify('Product link copied');
      }
    } catch {}
  };
  if (loading) return <main className="tkpd-state"><span className="tkpd-spinner" /><p>Loading product...</p></main>;
  if (error || !selected) return <main className="tkpd-state"><h1>{error || 'Product not found'}</h1><p>The product may have been removed or the link is no longer available.</p><button type="button" onClick={() => navigate('/')}>Continue shopping</button></main>;
  return <><main className="tkpd-page"><div className="tkpd-shell"><button type="button" className="tkpd-back" onClick={() => navigate(-1)}><FiChevronLeft /> Back</button><div className="tkpd-layout"><section className="tkpd-gallery"><div className="tkpd-thumbs">{galleryImages.slice(0, 6).map((image, index) => <button type="button" key={image} className={image === mainImage ? 'tkpd-thumb tkpd-thumb-active' : 'tkpd-thumb'} onClick={() => setActiveImage(image)}><img src={image} alt={`${productName} view ${index + 1}`} /></button>)}</div><div className="tkpd-main"><SafeImage sources={unique([mainImage, ...galleryImages, fallbackFor(selected?.gender)])} alt={productName} className="tkpd-main-img" /><div className="tkpd-floating"><button type="button" onClick={shareProduct} aria-label="Share product"><FiShare2 /></button><button type="button" onClick={addWish} aria-label="Add to wishlist"><FiHeart /></button></div></div></section><section className="tkpd-info"><h1>{productName}</h1><p className="tkpd-brand">{displayBrand(selected?.brand || selected?.brand_name)}</p><span className="tkpd-gender">{clean(selected?.gender)}</span><p className="tkpd-path">{[selected?.gender, selected?.category_name, selected?.fit_type || selected?.fit].map(clean).filter(Boolean).join(' › ')}</p><div className="tkpd-price-row"><strong>₹{money(pricing.price)}</strong>{pricing.mrp > pricing.price && <del>₹{money(pricing.mrp)}</del>}{pricing.discount > 0 && <span>{pricing.discount}% OFF</span>}</div><p className="tkpd-name-line">{productName}</p>{packSize > 1 && <p className="tkpd-name-line"><strong>Pack of {packSize}</strong> · Price per pack · {quantity} {quantity === 1 ? "pack" : "packs"} contains {quantity * packSize} pieces</p>}{colourGroups.length > 0 && <div className="tkpd-option"><div className="tkpd-option-heading"><strong>COLOR</strong><span>{selectedColour}</span></div><div className="tkpd-colour-strip"><button type="button" className="tkpd-strip-arrow" aria-label="Previous colours" onClick={()=>colourRail.current?.scrollBy({left:-300,behavior:"smooth"})}><FiChevronLeft /></button><div className="tkpd-colour-scroll" ref={colourRail}>{colourGroups.map(group => <button type="button" key={group.colour} className={group.colour === selectedColour ? 'tkpd-colour-card tkpd-colour-active' : 'tkpd-colour-card'} onClick={() => chooseColour(group.colour)}><span><SafeImage sources={unique([...group.images, fallbackFor(selected?.gender)])} alt={group.colour} /></span><small>{group.colour}</small></button>)}</div><button type="button" className="tkpd-strip-arrow" aria-label="More colours" onClick={()=>colourRail.current?.scrollBy({left:300,behavior:"smooth"})}><FiChevronRight /></button></div></div>}{sizes.length > 0 && <div className="tkpd-option tkpd-size-option"><div className="tkpd-option-heading"><strong>SIZE</strong></div><div className="tkpd-size-list">{sizes.map(size => <button type="button" key={size} className={size === clean(selected?.size) ? 'tkpd-size tkpd-size-active' : 'tkpd-size'} onClick={() => chooseSize(size)}>{size}</button>)}</div></div>}{stock > 0 && stock <= 5 && <p className="tkpd-stock">Hurry up! Last {stock} {packSize > 1 ? stock === 1 ? 'pack' : 'packs' : stock === 1 ? 'item' : 'items'} left</p>}<div className="tkpd-quantity"><button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))}><FiMinus /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity(value => Math.min(20, stock, value + 1))}><FiPlus /></button></div><div className="tkpd-actions"><button type="button" className="tkpd-cart" disabled={stock < 1 || adding} onClick={() => addBag('/cart')}><FiShoppingBag /> {stock < 1 ? "OUT OF STOCK" : adding ? "ADDING..." : "ADD TO CART"}</button><button type="button" className="tkpd-buy" disabled={stock < 1 || adding} onClick={() => addBag('/order/checkout')}>BUY NOW</button></div><div className="tkpd-service"><p><FiPackage /><span>Estimated Delivery: 4 TO 6 DAYS</span></p><p><FiHelpCircle /><span>Ask a Question</span></p></div></section></div></div><ProductSection eyebrow="You may also like" title="Similar products" products={similarProducts} userType={userType} />{message && <div className="tkpd-toast">{message}</div>}</main><Footer /></>;
}
