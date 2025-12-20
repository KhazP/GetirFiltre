import{S as m,C as a,U as S,P as p,s as E,T as w}from"./storage-CE-gbFcj.js";function N(){const e=[];let n=document.querySelectorAll(m.RESTAURANT_CARD);return n.length===0&&(console.warn("[GetirFiltre] Primary selector failed, using fallback"),n=v()),n.forEach(r=>{if(r.classList.contains(a.PROCESSED))return;const t=I(r);t&&e.push(t)}),e}function v(){const e=document.querySelectorAll(m.RESTAURANT_LINK),n=new Set;e.forEach(t=>{let o=t.parentElement,i=0;const s=5;for(;o&&i<s;){if(o.tagName==="ARTICLE"){n.add(o);break}o=o.parentElement,i++}});const r=document.createElement("div");return n.forEach(t=>r.appendChild(t.cloneNode(!1))),Array.from(n)}function I(e){var n,r;try{const t=e.querySelector(m.RESTAURANT_LINK);if(!t)return null;const o=t.getAttribute("href");if(!o)return null;const i=o.match(S.RESTAURANT_DETAIL);if(!i)return null;const s=i[1],l=e.querySelector(m.RESTAURANT_NAME),f=((n=l==null?void 0:l.textContent)==null?void 0:n.trim())||"Unknown Restaurant",{rating:c,reviewCount:h}=L(e),x=B(e),y=G(e),A=D(e),k=((r=e.textContent)==null?void 0:r.includes("Sponsorlu"))||!1;return{element:e,slug:s,name:f,rating:c,reviewCount:h,minBasket:x,deliveryTime:y,distance:A,isSponsored:k}}catch(t){return console.error("[GetirFiltre] Error extracting card data:",t),null}}function L(e){var o;const r=(e.textContent||"").match(p.RATING_WITH_REVIEWS);if(r){const i=parseFloat(r[1]),s=parseInt(r[2],10);if(i>=1&&i<=5)return{rating:i,reviewCount:s}}const t=e.querySelectorAll(m.RATING_WRAPPER);for(const i of t){const l=(((o=i.textContent)==null?void 0:o.trim())||"").split(/\s+/);for(const f of l){const c=f.match(p.RATING);if(c){const h=parseFloat(c[1]);if(h>=1&&h<=5)return{rating:h,reviewCount:null}}}}return{rating:null,reviewCount:null}}function D(e){const r=(e.innerText||"").match(/(?:^|[\s\n])(\d+[,.]?\d*)\s*km/i);if(r){const t=r[1].replace(",","."),o=parseFloat(t);if(o>=0&&o<=50)return o}return null}function B(e){const r=(e.innerText||"").match(/Min\.\s*₺?(\d+)(?=\s|$|[^\d])/i);if(r){const t=parseInt(r[1],10);if(t>0&&t<=2e3)return t}return null}function G(e){var o;const n=e.querySelector(m.DELIVERY_TIME);if(n)return((o=n.textContent)==null?void 0:o.trim())||null;const t=(e.textContent||"").match(p.DELIVERY_TIME);return t?`${t[1]} dk`:null}function _(e){if(e.element.querySelector(`.${a.BLOCK_BUTTON_CONTAINER}`))return;const n=document.createElement("div");n.className=a.BLOCK_BUTTON_CONTAINER;const r=document.createElement("button");r.className=a.BLOCK_BUTTON,r.innerHTML="×",r.title="Gizle (Hide)",r.setAttribute("aria-label",`Hide ${e.name}`),r.addEventListener("click",async t=>{t.preventDefault(),t.stopPropagation(),e.slug,e.name,await E.blockRestaurant(e.slug),u(e.element),console.log(`[GetirFiltre] Blocked: ${e.name} (${e.slug})`)}),n.appendChild(r),e.element.style.position="relative",e.element.appendChild(n)}function u(e){e.classList.add(a.HIDDEN)}function R(e){e.classList.remove(a.HIDDEN)}function F(e){e.classList.add(a.PROCESSED)}function O(e,n){let r=0;return e.forEach(t=>{if(F(t.element),n.blockedRestaurants.includes(t.slug)){u(t.element),r++;return}if(n.minRating!==null&&t.rating!==null&&t.rating<n.minRating){u(t.element),r++;return}if(n.maxMinBasket!==null&&t.minBasket!==null&&t.minBasket>n.maxMinBasket){u(t.element),r++;return}if(n.minReviewCount!==null&&t.reviewCount!==null&&t.reviewCount<n.minReviewCount){u(t.element),r++;return}if(n.maxDistance!==null&&t.distance!==null&&t.distance>n.maxDistance){u(t.element),r++;return}n.isEnabled&&_(t)}),r}const M=`
/* GetirFiltre Content Script Styles */
.getirfiltre-hidden {
  display: none !important;
}

.getirfiltre-btn-container {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.15s ease;
}

article:hover .getirfiltre-btn-container {
  opacity: 1;
}

.getirfiltre-block-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.getirfiltre-block-btn:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.getirfiltre-block-btn:active {
  transform: scale(0.95);
}

@media (hover: none) {
  .getirfiltre-btn-container {
    opacity: 1;
  }
}
`;function U(){if(document.getElementById("getirfiltre-styles"))return;const e=document.createElement("style");e.id="getirfiltre-styles",e.textContent=M,document.head.appendChild(e)}let d=null,g=!1;function P(e,n){let r=null;return((...t)=>{r&&clearTimeout(r),r=setTimeout(()=>e(...t),n)})}function C(){if(!d||!d.isEnabled)return;const e=N();if(e.length>0){const n=O(e,d);n>0&&console.log(`[GetirFiltre] Processed ${e.length} cards, hid ${n}`)}}const $=P(C,w.DEBOUNCE_MS);function q(e,n){if(!e.isEnabled){const t=document.querySelectorAll(`.${a.HIDDEN}`);t.forEach(o=>R(o)),console.log(`[GetirFiltre] Disabled - showed ${t.length} cards`);return}document.querySelectorAll(`.${a.PROCESSED}`).forEach(t=>{const o=t.querySelector('a[href*="/yemek/restoran/"]');if(!o)return;const i=o.getAttribute("href");if(!i)return;const s=i.match(/\/yemek\/restoran\/([^/]+)\//);if(!s)return;const l=s[1],f=e.blockedRestaurants.includes(l),c=(n==null?void 0:n.blockedRestaurants.includes(l))??!1;c&&!f?(R(t),console.log(`[GetirFiltre] Unblocked: ${l}`)):!c&&f&&(u(t),console.log(`[GetirFiltre] Blocked: ${l}`))}),C()}function H(){new MutationObserver(n=>{var t;let r=!1;for(const o of n){if(o.addedNodes.length>0){for(const i of o.addedNodes)if(i instanceof HTMLElement&&(i.tagName==="ARTICLE"||(t=i.querySelector)!=null&&t.call(i,"article"))){r=!0;break}}if(r)break}r&&$()}).observe(document.body,{childList:!0,subtree:!0}),console.log("[GetirFiltre] MutationObserver active")}async function b(){if(!S.RESTAURANTS_PAGE.test(window.location.href)){console.log("[GetirFiltre] Not on restaurants page, skipping");return}g||(console.log("[GetirFiltre] Initializing on GetirYemek..."),U(),d=await E.getSettings(),console.log("[GetirFiltre] Settings loaded:",d),E.onSettingsChange(e=>{console.log("[GetirFiltre] Settings updated:",e);const n=d;d=e,q(e,n)}),C(),H(),g=!0,console.log("[GetirFiltre] Ready! 🚀"))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):b();let T=window.location.href;const z=new MutationObserver(()=>{window.location.href!==T&&(T=window.location.href,g=!1,b())});z.observe(document.body,{childList:!0,subtree:!0});
