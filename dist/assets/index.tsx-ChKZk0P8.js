import{S as m,C as a,U as y,P as h,s as g,T as w}from"./storage-CE-gbFcj.js";function A(){const t=[];let r=document.querySelectorAll(m.RESTAURANT_CARD);return r.length===0&&(console.warn("[GetirFiltre] Primary selector failed, using fallback"),r=N()),r.forEach(n=>{if(n.classList.contains(a.PROCESSED))return;const e=I(n);e&&t.push(e)}),t}function N(){const t=document.querySelectorAll(m.RESTAURANT_LINK),r=new Set;t.forEach(e=>{let o=e.parentElement,i=0;const s=5;for(;o&&i<s;){if(o.tagName==="ARTICLE"){r.add(o);break}o=o.parentElement,i++}});const n=document.createElement("div");return r.forEach(e=>n.appendChild(e.cloneNode(!1))),Array.from(r)}function I(t){var r,n;try{const e=t.querySelector(m.RESTAURANT_LINK);if(!e)return null;const o=e.getAttribute("href");if(!o)return null;const i=o.match(y.RESTAURANT_DETAIL);if(!i)return null;const s=i[1],l=t.querySelector(m.RESTAURANT_NAME),f=((r=l==null?void 0:l.textContent)==null?void 0:r.trim())||"Unknown Restaurant",{rating:u,reviewCount:p}=L(t),T=B(t),x=G(t),v=D(t),k=((n=t.textContent)==null?void 0:n.includes("Sponsorlu"))||!1;return{element:t,slug:s,name:f,rating:u,reviewCount:p,minBasket:T,deliveryTime:x,distance:v,isSponsored:k}}catch(e){return console.error("[GetirFiltre] Error extracting card data:",e),null}}function L(t){var o;const n=(t.textContent||"").match(h.RATING_WITH_REVIEWS);if(n){const i=parseFloat(n[1]),s=parseInt(n[2],10);if(i>=1&&i<=5)return{rating:i,reviewCount:s}}const e=t.querySelectorAll(m.RATING_WRAPPER);for(const i of e){const l=(((o=i.textContent)==null?void 0:o.trim())||"").split(/\s+/);for(const f of l){const u=f.match(h.RATING);if(u){const p=parseFloat(u[1]);if(p>=1&&p<=5)return{rating:p,reviewCount:null}}}}return{rating:null,reviewCount:null}}function D(t){const n=(t.innerText||"").match(/(?:^|[\s\n])(\d+[,.]?\d*)\s*km/i);if(n){const e=n[1].replace(",","."),o=parseFloat(e);if(o>=0&&o<=50)return o}return null}function B(t){const n=(t.innerText||"").match(/Min\.\s*₺?(\d+)(?=\s|$|[^\d])/i);if(n){const e=parseInt(n[1],10);if(e>0&&e<=2e3)return e}return null}function G(t){var o;const r=t.querySelector(m.DELIVERY_TIME);if(r)return((o=r.textContent)==null?void 0:o.trim())||null;const e=(t.textContent||"").match(h.DELIVERY_TIME);return e?`${e[1]} dk`:null}function _(t){if(t.element.querySelector(`.${a.BLOCK_BUTTON_CONTAINER}`))return;const r=document.createElement("div");r.className=a.BLOCK_BUTTON_CONTAINER;const n=document.createElement("button");n.className=a.BLOCK_BUTTON,n.innerHTML="×",n.title="Gizle (Hide)",n.setAttribute("aria-label",`Hide ${t.name}`),n.addEventListener("mousedown",e=>{e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation()},!0),n.addEventListener("touchstart",e=>{e.stopPropagation(),e.stopImmediatePropagation()},{capture:!0,passive:!1}),n.addEventListener("click",async e=>{e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),t.slug,t.name,await g.blockRestaurant(t.slug),c(t.element),F(t.slug),console.log(`[GetirFiltre] Blocked: ${t.name} (${t.slug})`)}),r.appendChild(n),t.element.style.position="relative",t.element.appendChild(r)}function F(t){const r=document.querySelector(`a[href*="/yemek/restoran/${t}/"]`);if(!r)return;let n=r;for(;n&&n.parentElement;){const e=n.parentElement,o=e.children;let i=!1;for(const s of o)if(s!==n&&(s.querySelector('article[type="list-view-with-image"]')||s.classList.contains("sc-f5b1a14a-2"))){i=!0;break}if(i){let s=n.nextElementSibling;for(;s&&!(s.querySelector('article[type="list-view-with-image"]')||s.querySelector('a[href*="/yemek/restoran/"]'));)c(s),s=s.nextElementSibling;break}n=e}}function c(t){t.classList.add(a.HIDDEN)}function R(t){t.classList.remove(a.HIDDEN)}function O(t){t.classList.add(a.PROCESSED)}function P(t,r){let n=0;return t.forEach(e=>{if(O(e.element),r.blockedRestaurants.includes(e.slug)){c(e.element),n++;return}if(r.minRating!==null&&e.rating!==null&&e.rating<r.minRating){c(e.element),n++;return}if(r.maxMinBasket!==null&&e.minBasket!==null&&e.minBasket>r.maxMinBasket){c(e.element),n++;return}if(r.minReviewCount!==null&&e.reviewCount!==null&&e.reviewCount<r.minReviewCount){c(e.element),n++;return}if(r.maxDistance!==null&&e.distance!==null&&e.distance>r.maxDistance){c(e.element),n++;return}r.isEnabled&&_(e)}),n}const M=`
/* GetirFiltre Content Script Styles */
.getirfiltre-hidden {
  display: none !important;
}

.getirfiltre-btn-container {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: auto;
}

article:hover .getirfiltre-btn-container,
[class*="restaurant"]:hover .getirfiltre-btn-container,
[class*="Restaurant"]:hover .getirfiltre-btn-container {
  opacity: 1;
}

.getirfiltre-block-btn {
  pointer-events: auto;
  cursor: pointer;
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
`;function U(){if(document.getElementById("getirfiltre-styles"))return;const t=document.createElement("style");t.id="getirfiltre-styles",t.textContent=M,document.head.appendChild(t)}let d=null,E=!1;function q(t,r){let n=null;return((...e)=>{n&&clearTimeout(n),n=setTimeout(()=>t(...e),r)})}function S(){if(!d||!d.isEnabled)return;const t=A();if(t.length>0){const r=P(t,d);r>0&&console.log(`[GetirFiltre] Processed ${t.length} cards, hid ${r}`)}}const $=q(S,w.DEBOUNCE_MS);function H(t,r){if(!t.isEnabled){const e=document.querySelectorAll(`.${a.HIDDEN}`);e.forEach(o=>R(o)),console.log(`[GetirFiltre] Disabled - showed ${e.length} cards`);return}document.querySelectorAll(`.${a.PROCESSED}`).forEach(e=>{const o=e.querySelector('a[href*="/yemek/restoran/"]');if(!o)return;const i=o.getAttribute("href");if(!i)return;const s=i.match(/\/yemek\/restoran\/([^/]+)\//);if(!s)return;const l=s[1],f=t.blockedRestaurants.includes(l),u=(r==null?void 0:r.blockedRestaurants.includes(l))??!1;u&&!f?(R(e),console.log(`[GetirFiltre] Unblocked: ${l}`)):!u&&f&&(c(e),console.log(`[GetirFiltre] Blocked: ${l}`))}),S()}function z(){new MutationObserver(r=>{var e;let n=!1;for(const o of r){if(o.addedNodes.length>0){for(const i of o.addedNodes)if(i instanceof HTMLElement&&(i.tagName==="ARTICLE"||(e=i.querySelector)!=null&&e.call(i,"article"))){n=!0;break}}if(n)break}n&&$()}).observe(document.body,{childList:!0,subtree:!0}),console.log("[GetirFiltre] MutationObserver active")}async function b(){if(!y.RESTAURANTS_PAGE.test(window.location.href)){console.log("[GetirFiltre] Not on restaurants page, skipping");return}E||(console.log("[GetirFiltre] Initializing on GetirYemek..."),U(),d=await g.getSettings(),console.log("[GetirFiltre] Settings loaded:",d),g.onSettingsChange(t=>{console.log("[GetirFiltre] Settings updated:",t);const r=d;d=t,H(t,r)}),S(),z(),E=!0,console.log("[GetirFiltre] Ready! 🚀"))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):b();let C=window.location.href;const K=new MutationObserver(()=>{window.location.href!==C&&(C=window.location.href,E=!1,b())});K.observe(document.body,{childList:!0,subtree:!0});
