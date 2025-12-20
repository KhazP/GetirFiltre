import{S as m,C as s,U as h,P as E,s as b,T as A}from"./storage-CbNMpGo2.js";function N(){const t=[];let r=document.querySelectorAll(m.RESTAURANT_CARD);return r.length===0&&(console.warn("[GetirFiltre] Primary selector failed, using fallback"),r=L()),r.forEach(n=>{if(n.classList.contains(s.PROCESSED))return;const e=I(n);e&&t.push(e)}),t}function L(){const t=document.querySelectorAll(m.RESTAURANT_LINK),r=new Set;t.forEach(e=>{let o=e.parentElement,i=0;const a=5;for(;o&&i<a;){if(o.tagName==="ARTICLE"){r.add(o);break}o=o.parentElement,i++}});const n=document.createElement("div");return r.forEach(e=>n.appendChild(e.cloneNode(!1))),Array.from(r)}function I(t){var r,n;try{const e=t.querySelector(m.RESTAURANT_LINK);if(!e)return null;const o=e.getAttribute("href");if(!o)return null;const i=o.match(h.RESTAURANT_DETAIL);if(!i)return null;const a=i[1],l=t.querySelector(m.RESTAURANT_NAME),f=((r=l==null?void 0:l.textContent)==null?void 0:r.trim())||"Unknown Restaurant",{rating:u,reviewCount:p}=B(t),C=G(t),k=_(t),w=D(t),v=((n=t.textContent)==null?void 0:n.includes("Sponsorlu"))||!1;return{element:t,slug:a,name:f,rating:u,reviewCount:p,minBasket:C,deliveryTime:k,distance:w,isSponsored:v}}catch(e){return console.error("[GetirFiltre] Error extracting card data:",e),null}}function B(t){var o;const n=(t.textContent||"").match(E.RATING_WITH_REVIEWS);if(n){const i=parseFloat(n[1]),a=parseInt(n[2],10);if(i>=1&&i<=5)return{rating:i,reviewCount:a}}const e=t.querySelectorAll(m.RATING_WRAPPER);for(const i of e){const l=(((o=i.textContent)==null?void 0:o.trim())||"").split(/\s+/);for(const f of l){const u=f.match(E.RATING);if(u){const p=parseFloat(u[1]);if(p>=1&&p<=5)return{rating:p,reviewCount:null}}}}return{rating:null,reviewCount:null}}function D(t){const n=(t.innerText||"").match(/(?:^|[\s\n])(\d+[,.]?\d*)\s*km/i);if(n){const e=n[1].replace(",","."),o=parseFloat(e);if(o>=0&&o<=50)return o}return null}function G(t){const n=(t.innerText||"").match(/Min\.\s*₺?(\d+)(?=\s|$|[^\d])/i);if(n){const e=parseInt(n[1],10);if(e>0&&e<=2e3)return e}return null}function _(t){var o;const r=t.querySelector(m.DELIVERY_TIME);if(r)return((o=r.textContent)==null?void 0:o.trim())||null;const e=(t.textContent||"").match(E.DELIVERY_TIME);return e?`${e[1]} dk`:null}function O(t){if(t.element.querySelector(`.${s.BLOCK_BUTTON_CONTAINER}`))return;const r=document.createElement("div");r.className=s.BLOCK_BUTTON_CONTAINER;const n=document.createElement("button");n.className=s.BLOCK_BUTTON,n.innerHTML="×",n.title="Gizle (Hide)",n.setAttribute("aria-label",`Hide ${t.name}`),n.addEventListener("mousedown",e=>{e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation()},!0),n.addEventListener("touchstart",e=>{e.stopPropagation(),e.stopImmediatePropagation()},{capture:!0,passive:!1}),n.addEventListener("click",async e=>{e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),t.slug,t.name,await b.blockRestaurant(t.slug),c(t.element),P(t.slug),console.log(`[GetirFiltre] Blocked: ${t.name} (${t.slug})`)}),r.appendChild(n),t.element.style.position="relative",t.element.appendChild(r)}function P(t){const r=document.querySelector(`a[href*="/yemek/restoran/${t}/"]`);if(!r)return;let n=r;for(;n&&n.parentElement;){const e=n.parentElement,o=e.children;let i=!1;for(const a of o)if(a!==n&&(a.querySelector('article[type="list-view-with-image"]')||a.classList.contains("sc-f5b1a14a-2"))){i=!0;break}if(i){let a=n.nextElementSibling;for(;a&&!(a.querySelector('article[type="list-view-with-image"]')||a.querySelector('a[href*="/yemek/restoran/"]'));)c(a),a=a.nextElementSibling;break}n=e}}function c(t){t.classList.add(s.HIDDEN)}function x(t){t.classList.remove(s.HIDDEN)}function F(t){t.classList.add(s.PROCESSED)}function M(t,r){let n=0;return t.forEach(e=>{if(F(e.element),r.blockedRestaurants.includes(e.slug)){c(e.element),n++;return}if(r.minRating!==null&&e.rating!==null&&e.rating<r.minRating){c(e.element),n++;return}if(r.maxMinBasket!==null&&e.minBasket!==null&&e.minBasket>r.maxMinBasket){c(e.element),n++;return}if(r.minReviewCount!==null&&e.reviewCount!==null&&e.reviewCount<r.minReviewCount){c(e.element),n++;return}if(r.maxDistance!==null&&e.distance!==null&&e.distance>r.maxDistance){c(e.element),n++;return}r.isEnabled&&O(e)}),n}const U=`
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

/* Restaurant detail page block button - persistent */
.getirfiltre-restaurant-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  vertical-align: middle;
}

.getirfiltre-restaurant-page-btn:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.getirfiltre-restaurant-page-btn:active {
  transform: scale(0.95);
}
`;function q(){if(document.getElementById("getirfiltre-styles"))return;const t=document.createElement("style");t.id="getirfiltre-styles",t.textContent=U,document.head.appendChild(t)}let d=null,g=!1;function $(t,r){let n=null;return((...e)=>{n&&clearTimeout(n),n=setTimeout(()=>t(...e),r)})}function T(){if(!d||!d.isEnabled)return;const t=N();if(t.length>0){const r=M(t,d);r>0&&console.log(`[GetirFiltre] Processed ${t.length} cards, hid ${r}`)}}const H=$(T,A.DEBOUNCE_MS);function z(t,r){if(!t.isEnabled){const e=document.querySelectorAll(`.${s.HIDDEN}`);e.forEach(o=>x(o)),console.log(`[GetirFiltre] Disabled - showed ${e.length} cards`);return}document.querySelectorAll(`.${s.PROCESSED}`).forEach(e=>{const o=e.querySelector('a[href*="/yemek/restoran/"]');if(!o)return;const i=o.getAttribute("href");if(!i)return;const a=i.match(/\/yemek\/restoran\/([^/]+)\//);if(!a)return;const l=a[1],f=t.blockedRestaurants.includes(l),u=(r==null?void 0:r.blockedRestaurants.includes(l))??!1;u&&!f?(x(e),console.log(`[GetirFiltre] Unblocked: ${l}`)):!u&&f&&(c(e),console.log(`[GetirFiltre] Blocked: ${l}`))}),T()}function K(){new MutationObserver(r=>{var e;let n=!1;for(const o of r){if(o.addedNodes.length>0){for(const i of o.addedNodes)if(i instanceof HTMLElement&&(i.tagName==="ARTICLE"||(e=i.querySelector)!=null&&e.call(i,"article"))){n=!0;break}}if(n)break}n&&H()}).observe(document.body,{childList:!0,subtree:!0}),console.log("[GetirFiltre] MutationObserver active")}async function y(){if(document.querySelector(`.${s.RESTAURANT_PAGE_BLOCK_BUTTON}`))return;const t=window.location.href.match(h.RESTAURANT_DETAIL);if(!t)return;const r=t[1];let n=null;const e=document.querySelectorAll('h1, h2, [class*="RestaurantName"], [class*="restaurantName"]');for(const i of e)if(i.textContent&&i.textContent.length>2&&i.textContent.length<100){n=i;break}if(!n){const i=document.querySelector('[class*="InfoSection"], [class*="RestaurantInfo"], article');if(i){const a=i.querySelector("p, h1, h2, span");a&&a.textContent&&a.textContent.length>2&&(n=a)}}if(!n){console.log("[GetirFiltre] Could not find restaurant header on detail page");return}const o=document.createElement("button");o.className=s.RESTAURANT_PAGE_BLOCK_BUTTON,o.innerHTML="×",o.title="Restoran Gizle (Block Restaurant)",o.setAttribute("aria-label","Block this restaurant"),o.addEventListener("click",async i=>{i.preventDefault(),i.stopPropagation(),await b.blockRestaurant(r),o.innerHTML="✓",o.style.background="rgba(34, 197, 94, 0.9)",o.title="Blocked!",console.log(`[GetirFiltre] Blocked restaurant from detail page: ${r}`),setTimeout(()=>{window.history.back()},500)}),n.style.display="inline-flex",n.style.alignItems="center",n.appendChild(o),console.log(`[GetirFiltre] Injected block button on restaurant page: ${r}`)}async function R(){const t=window.location.href,r=h.RESTAURANTS_PAGE.test(t),n=h.RESTAURANT_DETAIL.test(t);if(!r&&!n){console.log("[GetirFiltre] Not on a supported page, skipping");return}if(!g){if(console.log("[GetirFiltre] Initializing on GetirYemek..."),q(),d=await b.getSettings(),console.log("[GetirFiltre] Settings loaded:",d),n){setTimeout(()=>{y()},500),new MutationObserver(()=>{y()}).observe(document.body,{childList:!0,subtree:!0}),g=!0,console.log("[GetirFiltre] Restaurant detail page ready! 🚀");return}b.onSettingsChange(e=>{console.log("[GetirFiltre] Settings updated:",e);const o=d;d=e,z(e,o)}),T(),K(),g=!0,console.log("[GetirFiltre] Ready! 🚀")}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",R):R();let S=window.location.href;const j=new MutationObserver(()=>{window.location.href!==S&&(S=window.location.href,g=!1,R())});j.observe(document.body,{childList:!0,subtree:!0});
