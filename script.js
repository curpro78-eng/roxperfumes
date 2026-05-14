(async () => {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
  const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  const { getFirestore, collection, addDoc, getDocs, doc, updateDoc, getDoc, query, orderBy, onSnapshot, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js');
  
  const firebaseConfig = {
    apiKey: "AIzaSyBuluSg5DW4hE8875ulBA_SNotJPL615Ks",
    authDomain: "roxluxury-3a482.firebaseapp.com",
    projectId: "roxluxury-3a482",
    storageBucket: "roxluxury-3a482.appspot.com",
    messagingSenderId: "779276423931",
    appId: "1:779276423931:web:dd5649f8ea0a3a3712965e"
  };
  try {
    const app = initializeApp(firebaseConfig);
    window.fbAuth = getAuth(app);
    window.fbDB = getFirestore(app);
    window.fbStorage = getStorage(app);
    window.fbFns = { collection, addDoc, getDocs, doc, updateDoc, getDoc, query, orderBy, onSnapshot, setDoc, ref, uploadBytesResumable, getDownloadURL };
    window.firebaseReady = true;
  } catch (e) {
    window.firebaseReady = false;
  }
  document.dispatchEvent(new Event('firebaseReady'));
})();


/* ═══════════════════════════════
   PARTICLES
═══════════════════════════════ */
(()=>{
  const canvas=document.getElementById('particles-canvas');
  const ctx=canvas.getContext('2d');
  let W,H,particles=[];
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize,{passive:true});
  class Particle{
    constructor(){this.reset();}
    reset(){this.x=Math.random()*W;this.y=Math.random()*H;this.size=Math.random()*1.5+.3;this.vx=(Math.random()-.5)*.3;this.vy=(Math.random()-.5)*.3;this.alpha=Math.random()*.5+.1;this.life=Math.random()*200+100;this.age=0;}
    update(){this.x+=this.vx;this.y+=this.vy;this.age++;if(this.age>this.life||this.x<0||this.x>W||this.y<0||this.y>H)this.reset();}
    draw(){ctx.save();ctx.globalAlpha=this.alpha*(1-this.age/this.life);ctx.fillStyle='#C9A84C';ctx.shadowBlur=4;ctx.shadowColor='#C9A84C';ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fill();ctx.restore();}
  }
  for(let i=0;i<60;i++)particles.push(new Particle());
  function loop(){ctx.clearRect(0,0,W,H);particles.forEach(p=>{p.update();p.draw();});requestAnimationFrame(loop);}
  loop();
})();

/* ═══════════════════════════════
   TICKER
═══════════════════════════════ */
// (()=>{
//   const msgs=['✦ Free delivery on orders above ₹999','✦ 100% authentic luxury fragrances','✦ ROX 1974 — Crafted for timeless presence','✦ New arrivals every season','✦ WhatsApp: +91 97875 02040','✦ Premium ingredients sourced worldwide','✦ Gift wrapping available','✦ Exclusive member discounts','✦ Use code ROX10FIRST for 10% off','✦ Buy 2 Get 1 Free — code ROXBUNDLE3'];
//   const html=msgs.map(m=>`<span class="t-item">${m}<span class="t-dot"></span></span>`).join('');
//   document.getElementById('ticker-track').innerHTML=html+html;
// })();
(()=>{
  const msgs=[
    '✦ Inspired by world’s finest fragrances',
    '✦ Long-lasting premium luxury perfumes',
    '✦ Free delivery across India',
    '✦ Crafted for bold & elegant personalities',
    '✦ Premium glass bottle packaging',
    '✦ Luxury scents at affordable prices',
    '✦ Perfect gift for every occasion',
    '✦ Exclusive combo offers available',
    '✦ Smooth, rich & signature fragrances',
    '✦ WhatsApp Orders: +91 97875 02040',
    '✦ Trusted by fragrance lovers',
    '✦ New premium collections dropping soon',
    '✦ Feel confident. Smell unforgettable.',
    '✦ ROX — Luxury in every spray',
    '✦ Designed for everyday luxury'
  ];

  const html = msgs.map(m =>
    `<span class="t-item">${m}<span class="t-dot"></span></span>`
  ).join('');

  document.getElementById('ticker-track').innerHTML = html + html;
})();

/* ═══════════════════════════════
   NAVBAR + SCROLL
═══════════════════════════════ */
window.addEventListener('scroll',()=>{
  const s=scrollY>60;
  document.getElementById('navbar').classList.toggle('scrolled',s);
  document.getElementById('back-top').classList.toggle('show',s);
},{passive:true});
function goTo(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'});}

/* ═══════════════════════════════
   DRAWER
═══════════════════════════════ */
function toggleDrawer(){
  const open=document.getElementById('mob-drawer').classList.toggle('open');
  document.getElementById('mob-backdrop').classList.toggle('show',open);
  document.getElementById('hamburger').classList.toggle('open',open);
  document.body.style.overflow=open?'hidden':'';
}
function closeDrawer(){
  document.getElementById('mob-drawer').classList.remove('open');
  document.getElementById('mob-backdrop').classList.remove('show');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow='';
}

/* ═══════════════════════════════
   HERO SLIDESHOW
═══════════════════════════════ */
const SLIDES=document.querySelectorAll('.hero-slide');
const TOTAL=SLIDES.length;
let cur=0,timer=null;
const DELAY=5000;
function buildDots(){
  const w=document.getElementById('heroDots');w.innerHTML='';
  SLIDES.forEach((_,i)=>{
    const b=document.createElement('button');b.className='h-dot'+(i===0?' on':'');
    b.onclick=()=>{clearInterval(timer);goSlide(i);startTimer();};w.appendChild(b);
  });
}
function goSlide(n){
  SLIDES[cur].classList.remove('active');
  document.querySelectorAll('.h-dot')[cur]?.classList.remove('on');
  cur=(n+TOTAL)%TOTAL;
  SLIDES[cur].classList.add('active');
  document.querySelectorAll('.h-dot')[cur]?.classList.add('on');
  document.getElementById('heroCounter').textContent=`${cur+1} / ${TOTAL}`;
}
function heroStep(d){clearInterval(timer);goSlide(cur+d);startTimer();}
function startTimer(){timer=setInterval(()=>goSlide(cur+1),DELAY);}
(()=>{let sx=0;const h=document.getElementById('hero');
  h.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  h.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>45)heroStep(dx<0?1:-1);},{passive:true});
})();
buildDots();startTimer();

/* ═══════════════════════════════
   SCROLL REVEAL
═══════════════════════════════ */
const obs=new IntersectionObserver(en=>en.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

/* ═══════════════════════════════
   PRODUCTS DATA
═══════════════════════════════ */
let allP=[],activeGender='All';
function waitFB(fn){if(window.firebaseReady!==undefined)fn();else document.addEventListener('firebaseReady',fn);}

const DEMO_PRODUCTS=[
  {id:'d1',name:'Noir Royale',price:2999,ml:'100ml',category:'Premium',imageURL:'',
   description:'Bergamot, Black Pepper\nOud, Leather\nSandalwood, Musk',
   notes:['Woody','Oriental'],occasion:'Evening',stock:15,soldCount:142,rating:4.9,ratingCount:38},
  {id:'d2',name:"Fleur d'Or",price:3499,ml:'50ml',category:'Classic',imageURL:'',
   description:'Rose, Peach\nJasmine, Iris\nVanilla, White Musk',
   notes:['Floral'],occasion:'Special',stock:8,soldCount:267,rating:4.8,ratingCount:74},
  {id:'d3',name:'Velvet Oud',price:4999,ml:'75ml',category:'Premium',imageURL:'',
   description:'Saffron, Cardamom\nOud, Amber\nPatchouli, Vetiver',
   notes:['Woody','Oriental'],occasion:'Evening',stock:5,soldCount:89,rating:5.0,ratingCount:22},
  {id:'d4',name:'Crystal Blanc',price:1999,ml:'50ml',category:'Classic',imageURL:'',
   description:'Lemon, Green Tea\nLily, Freesia\nCedarwood, Musks',
   notes:['Fresh','Floral'],occasion:'Daily',stock:20,soldCount:189,rating:4.7,ratingCount:55},
  {id:'d5',name:'Dark Ember',price:3299,ml:'100ml',category:'Premium',imageURL:'',
   description:'Grapefruit, Ginger\nTobacco, Cedarwood\nSmoked Vetiver',
   notes:['Woody'],occasion:'Night',stock:0,soldCount:135,rating:4.8,ratingCount:43},
  {id:'d6',name:'Mystique Rose',price:2799,ml:'75ml',category:'Classic',imageURL:'',
   description:'Raspberry, Mandarin\nBulgarian Rose\nVanilla, Sandalwood',
   notes:['Floral','Oriental'],occasion:'Special',stock:12,soldCount:204,rating:4.9,ratingCount:61},
  {id:'d7',name:'Amber Soleil',price:5499,ml:'100ml',category:'Premium',imageURL:'',
   description:'Bergamot, Pink Pepper\nRose, Ylang-Ylang\nAmber, Musk, Cedarwood',
   notes:['Floral','Oriental'],occasion:'Evening',stock:4,soldCount:67,rating:4.9,ratingCount:19},
  {id:'d8',name:'Aqua Royale',price:1799,ml:'50ml',category:'Classic',imageURL:'',
   description:'Lemon, Mint, Sea Breeze\nGeranium, Lavender\nWarm Wood, Musk',
   notes:['Fresh','Citrus'],occasion:'Daily',stock:25,soldCount:310,rating:4.6,ratingCount:88},
];

function loadProducts(){
  if(window.fbDB){
    try{
      const{collection,onSnapshot,query,orderBy}=window.fbFns;
      onSnapshot(query(collection(window.fbDB,'products'),orderBy('name')), s=>{
        allP=s.docs.map(d=>({id:d.id,...d.data()}));
        if(!allP.length)allP=DEMO_PRODUCTS;
        renderProducts();
        renderTrending();
        renderBundleItems();
      }, err=>{
        if(!allP.length)allP=DEMO_PRODUCTS;
        renderProducts();
        renderTrending();
        renderBundleItems();
      });
    }catch(e){
      if(!allP.length)allP=DEMO_PRODUCTS;
      renderProducts();
      renderTrending();
      renderBundleItems();
    }
  } else {
    if(!allP.length)allP=DEMO_PRODUCTS;
    renderProducts();
    renderTrending();
    renderBundleItems();
  }
}

function getFilteredProducts(){
  let list=[...allP];
  if(activeGender!=='All')list=list.filter(p=>p.category===activeGender);
  return list;
}

function renderProducts(){
  const g=document.getElementById('products-grid');
  const list=getFilteredProducts();
  if(!list.length){g.innerHTML='<p class="loading" style="color:var(--white-dim)">No products match your filter.</p>';return;}
  g.innerHTML=list.map(p=>{
    const isBest=(p.soldCount||0)>150;
    const discount=p.originalPrice?Math.round((1-(p.prices&&p.prices['50ml']?p.prices['50ml']:p.price)/p.originalPrice)*100):0;
    const defMl = p.defaultMl || '50ml';
    const displayPrice = p.prices && p.prices[defMl] ? p.prices[defMl] : (p.price || 0);
    return `
    <div class="product-card" onclick="openOv('${p.id}')">
      <div class="p-img-wrap">
        ${p.imageURL?`<img src="${p.imageURL}" alt="${p.name}" loading="lazy">`:`<div class="p-ph">ROX</div>`}
        <div style="position:absolute;top:.7rem;left:.7rem;display:flex;flex-direction:column;gap:.3rem;">
          <span class="p-badge${isBest?' bestseller':''}" style="position:relative;top:0;left:0;">${isBest?'🔥 Best Seller':p.category}</span>
        </div>
        ${p.stock===0?'<span class="oos-badge">Out of Stock</span>':''}
        ${discount>0&&p.stock>0?`<span class="oos-badge" style="background:rgba(20,100,20,.88);color:#7fff7f">-${discount}%</span>`:''}
      </div>
      <div class="p-info">
        <p class="p-cat">${p.category}</p>
        <h3 class="p-name">${p.name}</h3>
        <div class="p-stars">
          <span class="stars">${'★'.repeat(Math.round(p.rating||5))}</span>
          <span class="count">(${p.ratingCount||0})</span>
        </div>
        <div class="p-price-row">
          <p class="p-price">Starting at ₹${displayPrice.toLocaleString('en-IN')}</p>
          ${p.originalPrice?`<p class="p-orig-price">₹${p.originalPrice.toLocaleString('en-IN')}</p>`:''}
        </div>
        <button class="p-add" onclick="event.stopPropagation();quickAdd('${p.id}')" ${p.stock===0?'disabled style="opacity:.38;cursor:not-allowed"':''}>
          <span>${p.stock===0?'Out of Stock':'Add to Cart'}</span>
        </button>
      </div>
    </div>`;
  }).join('');
}

/* ── GENDER FILTER ── */
function setGender(val,btn){
  activeGender=val;
  document.querySelectorAll('.gb-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderProducts();
  // Scroll to collection smoothly
  goTo('collection');
}

/* ── TRENDING ── */
function renderTrending(){
  const sorted=[...allP].sort((a,b)=>(b.soldCount||0)-(a.soldCount||0)).slice(0,8);
  document.getElementById('trending-scroll').innerHTML=sorted.map((p,i)=>`
    <div class="trend-chip" onclick="openOv('${p.id}')">
      <span class="trend-rank">#${i+1}</span>
      <div>
        <div class="trend-name">${p.name}</div>
        <div style="font-size:.6rem;color:var(--gold-dim)">₹${p.price.toLocaleString('en-IN')} · ${p.soldCount||0} sold</div>
      </div>
      ${i<3?'<span class="fire-icon">🔥</span>':''}
    </div>`).join('');
}

/* ── BUNDLE ── */
function renderBundleItems(){
  const top=[...allP].sort((a,b)=>(b.soldCount||0)-(a.soldCount||0)).slice(0,3);
  document.getElementById('bundle-items').innerHTML=top.map(p=>`
    <div class="b-item">
      <div>
        <div class="b-item-name">${p.name}</div>
        <div class="b-item-price">₹${p.price.toLocaleString('en-IN')}</div>
      </div>
    </div>`).join('');
}

/* ═══════════════════════════════
   OVERLAY
═══════════════════════════════ */
let ovP=null,ovQ=1,selectedMl='';
function setMl(ml,btn){
  selectedMl=ml;
  document.querySelectorAll('#ov-ml-select .ml-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(ovP && ovP.prices && ovP.prices[ml]) {
    document.getElementById('ov-price').textContent='₹'+ovP.prices[ml].toLocaleString('en-IN');
  }
}
function openOv(id){
  const p=allP.find(x=>x.id===id);if(!p)return;
  ovP=p;ovQ=1;
  const mlOrder = ['6ml','8ml','12ml','30ml','50ml','70ml','100ml'];
  const availableMls = p.prices ? Object.keys(p.prices).filter(k=>p.prices[k]>0).sort((a,b)=>mlOrder.indexOf(a)-mlOrder.indexOf(b)) : [];
  selectedMl = p.defaultMl && availableMls.includes(p.defaultMl) ? p.defaultMl : (availableMls[0] || p.ml || '50ml');
  const priceToDisplay = p.prices && p.prices[selectedMl] ? p.prices[selectedMl] : (p.price||0);
  
  if (availableMls.length) {
    document.getElementById('ov-ml-select').innerHTML=availableMls.map(ml=>`
      <button class="ml-btn ${selectedMl===ml?'active':''}" onclick="setMl('${ml}',this)">${ml}</button>
    `).join('');
  } else {
    document.getElementById('ov-ml-select').innerHTML=`<button class="ml-btn active" onclick="setMl('${selectedMl}',this)">${selectedMl}</button>`;
  }
  
  document.getElementById('ov-cat').textContent=p.category;
  document.getElementById('ov-name').textContent=p.name;
  document.getElementById('ov-ml').textContent=''; 
  document.getElementById('ov-price').textContent='₹'+priceToDisplay.toLocaleString('en-IN');
  document.getElementById('ov-qty').textContent='1';
  const starsEl=document.getElementById('ov-stars');
  if(p.rating){starsEl.innerHTML=`<span class="stars">${'★'.repeat(Math.round(p.rating||5))}</span><span class="rat-num">${(p.rating||5).toFixed(1)}</span><span class="rat-count">(${p.ratingCount||0} reviews)</span>`;}
  if(p.originalPrice){
    document.getElementById('ov-orig-price').textContent='₹'+p.originalPrice.toLocaleString('en-IN');
    document.getElementById('ov-orig-price').style.display='block';
    const disc=Math.round((1-p.price/p.originalPrice)*100);
    document.getElementById('ov-disc-tag').textContent=`${disc}% OFF`;
    document.getElementById('ov-disc-tag').style.display='inline-block';
  } else {
    document.getElementById('ov-orig-price').style.display='none';
    document.getElementById('ov-disc-tag').style.display='none';
  }
  const si=document.getElementById('ov-stock-ind');
  if(p.stock===0)si.innerHTML='<div class="stock-dot out"></div><span class="stock-text out">Out of Stock</span>';
  else if(p.stock<=5)si.innerHTML=`<div class="stock-dot low"></div><span class="stock-text low">Only ${p.stock} left</span>`;
  else si.innerHTML='<div class="stock-dot"></div><span class="stock-text">In Stock</span>';
  const im=document.getElementById('ov-img');
  im.innerHTML=p.imageURL?`<img src="${p.imageURL}" alt="${p.name}">`:`<div class="ov-ph">ROX</div>`;
  
  const notesSec = document.getElementById('ov-notes-section');
  if (p.topNotes || p.middleNotes || p.baseNotes) {
    notesSec.style.display = 'block';
    const t = document.getElementById('ov-top-notes'); if(p.topNotes) { t.style.display='flex'; t.innerHTML=`<span class="n-bullet"></span><strong>Top Notes:</strong> <span class="n-val">${p.topNotes}</span>`; } else t.style.display='none';
    const m = document.getElementById('ov-mid-notes'); if(p.middleNotes) { m.style.display='flex'; m.innerHTML=`<span class="n-bullet"></span><strong>Middle Notes:</strong> <span class="n-val">${p.middleNotes}</span>`; } else m.style.display='none';
    const b = document.getElementById('ov-base-notes'); if(p.baseNotes) { b.style.display='flex'; b.innerHTML=`<span class="n-bullet"></span><strong>Base Notes:</strong> <span class="n-val">${p.baseNotes}</span>`; } else b.style.display='none';
  } else {
    notesSec.style.display = 'none';
  }
  
  const descSec = document.getElementById('ov-desc-section');
  if (p.description) {
    descSec.style.display = 'block';
    document.getElementById('ov-desc').innerHTML = p.description.replace(/\n/g, '<br>');
  } else {
    descSec.style.display = 'none';
  }
  const noteTags=document.getElementById('ov-note-tags');
  noteTags.innerHTML=(Array.isArray(p.notes) && p.notes.length)?`<p class="n-title">Fragrance Family</p><div class="note-tags">${p.notes.map(n=>`<span class="note-tag">${n}</span>`).join('')}</div>`:'';
  const ab=document.getElementById('ov-add');
  if(p.stock===0){ab.textContent='Out of Stock';ab.disabled=true;ab.style.opacity='.5';}
  else{ab.textContent='Add to Cart';ab.disabled=false;ab.style.opacity='1';}
  document.getElementById('product-overlay').classList.add('on');
  document.body.style.overflow='hidden';
  if (!history.state || history.state.overlay !== 'open') {
    history.pushState({ overlay: 'open' }, '', '#product');
  }
}
function closeOv(fromPopState = false){
  document.getElementById('product-overlay').classList.remove('on');
  document.body.style.overflow='';
  if (!fromPopState && history.state && history.state.overlay === 'open') {
    history.back();
  }
}
function goBackFromOv() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    closeOv();
  }
}
window.addEventListener('popstate', (e) => {
  if (!e.state || e.state.overlay !== 'open') {
    if (document.getElementById('product-overlay').classList.contains('on')) {
      closeOv(true);
    }
  }
});
function chgQty(d){ovQ=Math.max(1,ovQ+d);document.getElementById('ov-qty').textContent=ovQ;}
function addFromOv(){
  if(ovP&&ovP.stock>0){
    const priceToUse = ovP.prices && ovP.prices[selectedMl] ? ovP.prices[selectedMl] : (ovP.price||0);
    const pWithMl = {...ovP, price: priceToUse, ml: selectedMl, id: ovP.id+'-'+selectedMl};
    addToCart(pWithMl,ovQ);
    const ab = document.getElementById('ov-add');
    ab.textContent = 'Added ✓';
    setTimeout(() => {
      ab.textContent = 'Add to Cart';
      closeOv();
    }, 800);
  }
}
function buyWA(){
  if(!ovP)return;
  const msg=`Hello ROX Perfumes,\n\nI'd like to order:\nProduct: ${ovP.name}\nSize: ${selectedMl}\nQuantity: ${ovQ}\nTotal: ₹${(ovP.price*ovQ).toLocaleString('en-IN')}\n\nPlease confirm.`;
  window.open(`https://wa.me/919787502040?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ═══════════════════════════════
   WISHLIST


/* ═══════════════════════════════
   CART
═══════════════════════════════ */
let cart=JSON.parse(localStorage.getItem('rox_cart')||'[]');
let appliedDiscount=0;
const COUPONS={'ROX10FIRST':10,'ROXBUNDLE3':0,'SAVE15':15};

function addToCart(p,qty=1){
  const ex=cart.find(i=>i.id===p.id);
  if(ex)ex.qty+=qty;else cart.push({id:p.id,name:p.name,price:p.price,ml:p.ml,imageURL:p.imageURL||'',qty});
  saveCart();updateBadge();showToast(`${p.name} added to cart`,'✦');
}
function quickAdd(id){
  const p=allP.find(x=>x.id===id);
  if(p&&p.stock>0){
    const defaultMl = p.defaultMl || (p.prices && Object.keys(p.prices).length ? Object.keys(p.prices).pop() : (p.ml||'50ml'));
    const priceToUse = p.prices && p.prices[defaultMl] ? p.prices[defaultMl] : (p.price||0);
    const pWithMl = {...p, price: priceToUse, ml: defaultMl, id: p.id+'-'+defaultMl};
    addToCart(pWithMl,1); // Do not open cart
  }
}
function removeItem(id){cart=cart.filter(i=>i.id!==id);saveCart();renderCart();updateBadge();}
function adjustQty(id,d){const it=cart.find(i=>i.id===id);if(!it)return;it.qty+=d;if(it.qty<=0)removeItem(id);else{saveCart();renderCart();updateBadge();}}
function cartSubtotal(){return cart.reduce((s,i)=>s+i.price*i.qty,0);}
function cartTotal(){return Math.max(0,cartSubtotal()-appliedDiscount);}
function saveCart(){localStorage.setItem('rox_cart',JSON.stringify(cart));}

function updateBadge(){
  const n=cart.reduce((s,i)=>s+i.qty,0);
  const b=document.getElementById('cart-badge');b.textContent=n;b.style.display=n?'flex':'none';
  const db=document.getElementById('dr-badge');db.textContent=n;db.style.display=n?'inline-block':'none';
  document.getElementById('cart-total').textContent='₹'+cartTotal().toLocaleString('en-IN');
  document.getElementById('cart-foot').style.display=cart.length?'block':'none';
  if(appliedDiscount>0){
    document.getElementById('ct-discount').style.display='flex';
    document.getElementById('ct-damt').textContent=`−₹${appliedDiscount.toLocaleString('en-IN')}`;
  } else document.getElementById('ct-discount').style.display='none';
}

function applyCoupon(){
  const code=document.getElementById('coupon-input').value.trim().toUpperCase();
  if(!COUPONS[code]&&code!=='ROXBUNDLE3'){showToast('Invalid coupon code','✕');return;}
  if(code==='ROXBUNDLE3'){
    const sorted=[...cart].sort((a,b)=>a.price-b.price);
    if(sorted.length>=3){appliedDiscount=sorted[0].price;showToast('Bundle offer applied! Free item added','🎁');}
    else{showToast('Add 3 items to apply bundle offer','ℹ');}
  } else {
    const pct=COUPONS[code];appliedDiscount=Math.round(cartSubtotal()*pct/100);
    showToast(`${pct}% discount applied!`,'🏷');
  }
  updateBadge();
}

function renderCart(){
  const l=document.getElementById('cart-list');
  if(!cart.length){l.innerHTML='<div class="cart-empty-msg">Your cart is empty</div>';return;}
  l.innerHTML=cart.map(i=>`
    <div class="c-item">
      <div class="ci-img">${i.imageURL?`<img src="${i.imageURL}" alt="">`:'ROX'}</div>
      <div>
        <p class="ci-name">${i.name} ${i.ml ? `<span class="ci-size">${i.ml}</span>` : ''}</p>
        <p class="ci-price">₹${(i.price*i.qty).toLocaleString('en-IN')}</p>
        <div class="ci-qty">
          <button class="cq-btn" onclick="adjustQty('${i.id}',-1)">−</button>
          <span style="font-size:.8rem;color:var(--white);min-width:18px;text-align:center">${i.qty}</span>
          <button class="cq-btn" onclick="adjustQty('${i.id}',1)">+</button>
        </div>
      </div>
      <button class="ci-rm" onclick="removeItem('${i.id}')">✕</button>
    </div>`).join('');
  updateBadge();
}
function openCart(){renderCart();document.getElementById('cart-sidebar').classList.add('open');document.getElementById('cart-bd').classList.add('on');document.body.style.overflow='hidden';const wa=document.querySelector('.wa-fab');if(wa)wa.style.display='none';}
function closeCart(){document.getElementById('cart-sidebar').classList.remove('open');document.getElementById('cart-bd').classList.remove('on');document.body.style.overflow='';const wa=document.querySelector('.wa-fab');if(wa)wa.style.display='flex';}
function clearCart(){
  document.getElementById('clear-cart-modal').classList.add('on');
}
function closeClearCartModal() {
  document.getElementById('clear-cart-modal').classList.remove('on');
}
function confirmClearCart() {
  cart=[];saveCart();renderCart();updateBadge();
  closeClearCartModal();
  showToast('Cart cleared successfully','✕');
}

async function loadSettings() {
  if (window.fbDB) {
    try {
      const { doc, getDoc } = window.fbFns;
      const snap = await getDoc(doc(window.fbDB, 'settings', 'general'));
      // No longer loading qrImageUrl or upiConfig
    } catch(e) { console.error("Error loading settings:", e); }
  }
}

function initRazorpay() {
  const name=document.getElementById('o-name').value.trim();
  const phone=document.getElementById('o-phone').value.trim();
  const addr=document.getElementById('o-addr').value.trim();
  
  if(!name||!phone||!addr){showToast('Please fill all required fields','⚠');return;}
  
  const amountToPay = cartTotal() * 100; // Razorpay expects amount in paise
  
  var btn = document.getElementById('pay-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Loading Payment...';
  btn.disabled = true;
  
  var options = {
      "key": "rzp_test_SoowPinKQrYUkK",
      "amount": amountToPay,
      "currency": "INR",
      "name": "ROX Perfumes",
      "description": "Perfume Order",
      "prefill": {
          "name": name,
          "contact": phone
      },
      "handler": function (response){
          btn.innerHTML = '✅ Payment Successful';
          showToast("Payment Successful", '✅');
          submitOrder(response.razorpay_payment_id);
      },
      "modal": {
          "ondismiss": function() {
              btn.innerHTML = originalText;
              btn.disabled = false;
              showToast("Payment Cancelled", '⚠');
          }
      },
      "theme": {
          "color": "#151514"
      }
  };

  try {
      var rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response){
          showToast('Payment Failed: ' + response.error.description, '❌');
          btn.innerHTML = originalText;
          btn.disabled = false;
      });
      rzp.open();
  } catch(e) {
      showToast('Error loading payment gateway', '❌');
      btn.innerHTML = originalText;
      btn.disabled = false;
  }
}

function openOrderModal(){
  const rows=cart.map(i=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:.28rem 0;color:var(--white-dim)"><span>${i.name} ${i.ml?`(${i.ml}) `:''}×${i.qty}</span><span style="color:var(--gold)">₹${(i.price*i.qty).toLocaleString('en-IN')}</span></div>`).join('');
  let discount='';
  if(appliedDiscount>0)discount=`<div style="display:flex;justify-content:space-between;padding:.2rem 0;font-size:.76rem"><span style="color:#4caf50">Discount</span><span style="color:#4caf50">−₹${appliedDiscount.toLocaleString('en-IN')}</span></div>`;
  document.getElementById('o-summary').innerHTML=rows+discount+`<div style="border-top:1px solid rgba(201,168,76,.18);margin-top:.7rem;padding-top:.7rem;display:flex;justify-content:space-between"><span style="font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--white-dim)">Total</span><span style="font-family:var(--font-h);font-size:1.15rem;color:var(--gold)">₹${cartTotal().toLocaleString('en-IN')}</span></div>`;
  
  document.getElementById('order-modal').classList.add('on');closeCart();
}
function closeOrderModal(){document.getElementById('order-modal').classList.remove('on');}

async function submitOrder(paymentId = ''){
  const name=document.getElementById('o-name').value.trim();
  const phone=document.getElementById('o-phone').value.trim();
  const addr=document.getElementById('o-addr').value.trim();
  
  if(!name||!phone||!addr){showToast('Please fill all required fields','⚠');return;}
  
  var btn = document.getElementById('pay-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Processing...';
  }

  const order={
    customerName:name,
    phone,
    address:addr,
    items:cart.map(i=>({id:i.id,name:i.name,ml:i.ml||'',qty:i.qty,price:i.price})),
    totalAmount:cartTotal(),
    discount:appliedDiscount,
    status:'Paid',
    date:new Date().toISOString(),
    paymentReference: paymentId
  };
  
  if(window.fbDB){
    try{
      const{collection,addDoc,doc,updateDoc,getDoc}=window.fbFns;
      await addDoc(collection(window.fbDB,'orders'),order);
      for(const item of cart){
        if(!item.id.startsWith('d')){
          try{const pr=doc(window.fbDB,'products',item.id);const sn=await getDoc(pr);if(sn.exists()){const d=sn.data();await updateDoc(pr,{stock:Math.max(0,(d.stock||0)-item.qty),soldCount:(d.soldCount||0)+item.qty});}}catch(e){}
        }
      }
    }catch(e){}
  }
  const lines=cart.map(i=>`• ${i.name} ${i.ml?`(${i.ml}) `:''}×${i.qty} = ₹${(i.price*i.qty).toLocaleString('en-IN')}`).join('\n');
  const discLine=appliedDiscount>0?`\nDiscount: −₹${appliedDiscount.toLocaleString('en-IN')}`:'';
  const msg=`Hello ROX Perfumes 🌹\n\nNew Order!\nName: ${name}\nPhone: ${phone}\nAddress: ${addr}\n\nItems:\n${lines}${discLine}\n\nTotal: ₹${cartTotal().toLocaleString('en-IN')}`;
  cart=[];appliedDiscount=0;saveCart();updateBadge();closeOrderModal();
  
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
  
  showToast('Order placed! Opening WhatsApp…','✅');
  setTimeout(()=>window.open(`https://wa.me/919787502040?text=${encodeURIComponent(msg)}`,'_blank'),900);
}

/* ═══════════════════════════════
   REVIEWS
═══════════════════════════════ */
const SAMPLE_REVIEWS=[
  {name:'Priya M.',avatar:'P',product:'Fleur d\'Or',rating:5,text:'Absolutely mesmerizing. The rose notes last all day and I keep getting compliments everywhere I go. Worth every rupee!',date:'2 days ago',verified:true},
  {name:'Karthik R.',avatar:'K',product:'Noir Royale',rating:5,text:'This is my signature scent now. The oud is rich but not overpowering. Perfect for evening occasions.',date:'5 days ago',verified:true},
  {name:'Ananya S.',avatar:'A',product:'Crystal Blanc',rating:4,text:'Fresh, clean, and elegant. Great for daily wear. The longevity could be slightly better but overall a wonderful fragrance.',date:'1 week ago',verified:true},
  {name:'Rahul V.',avatar:'R',product:'Dark Ember',rating:5,text:'The smoked vetiver is extraordinary. Got so many compliments on a first date. Will definitely order again!',date:'2 weeks ago',verified:true},
  {name:'Deepika T.',avatar:'D',product:'Velvet Oud',rating:5,text:'I\'ve tried many luxury perfumes but Velvet Oud is on another level. The saffron opening is divine.',date:'3 weeks ago',verified:false},
  {name:'Arjun P.',avatar:'A',product:'Mystique Rose',rating:5,text:'My wife and I both use this. Perfect unisex scent — romantic and sophisticated at the same time.',date:'1 month ago',verified:true},
];

let reviewsList=[...SAMPLE_REVIEWS];
let selectedStars=5;

function renderReviews(){
  document.getElementById('reviews-grid').innerHTML=reviewsList.map(r=>`
    <div class="review-card">
      <div class="rc-header">
        <div class="rc-user">
          <div class="rc-avatar">${r.avatar}</div>
          <div><div class="rc-name">${r.name}</div><div class="rc-date">${r.date}</div></div>
        </div>
        <div class="rc-stars">${'★'.repeat(r.rating)}</div>
      </div>
      <div class="rc-product">${r.product}</div>
      <p class="rc-text">"${r.text}"</p>
      ${r.verified?'<div class="rc-verified"><span>✓</span> Verified Purchase</div>':''}
      ${r.reviewerId && r.reviewerId === localStorage.getItem('rox_reviewerId') ? `<button class="btn-review" style="margin-top:0.8rem;padding:0.4rem 0.8rem" onclick="editReview('${r.id}')">Edit Review</button>` : ''}
    </div>`).join('');
}

function openReviewModal(){document.getElementById('review-modal').classList.add('on');setStars(5);}
function closeReviewModal(){document.getElementById('review-modal').classList.remove('on');}
function setStars(n){
  selectedStars=n;
  document.querySelectorAll('.star-btn').forEach((b,i)=>{b.classList.toggle('filled',i<n);});
}

async function loadReviews(){
  if(window.fbDB){
    try{
      const{collection,onSnapshot,query,orderBy}=window.fbFns;
      onSnapshot(query(collection(window.fbDB,'reviews'),orderBy('date','desc')), s=>{
        if(!s.empty){
          reviewsList = s.docs.map(d=>{
            let data = d.data();
            if(data.date && data.date.includes('T')) {
              data.date = new Date(data.date).toLocaleDateString('en-IN');
            }
            return {id:d.id,...data};
          });
        }
        renderReviews();
      }, err=>{renderReviews();});
    }catch(e){renderReviews();}
  } else {
    renderReviews();
  }
}

async function submitReview(){
  const name=document.getElementById('rv-name').value.trim();
  const product=document.getElementById('rv-product').value.trim();
  const text=document.getElementById('rv-text').value.trim();
  if(!name||!text){showToast('Please fill in your name and review','⚠');return;}
  
  let revId = localStorage.getItem('rox_reviewerId');
  if(!revId) { revId = 'rev_'+Math.random().toString(36).substr(2,9); localStorage.setItem('rox_reviewerId', revId); }

  const rev = {reviewerId:revId, name,avatar:name[0].toUpperCase(),product:product||'ROX Collection',rating:selectedStars,text,date:new Date().toISOString(),verified:false};

  if(window.fbDB){
    try{
      const {collection, addDoc, doc, updateDoc} = window.fbFns;
      const existingId = document.getElementById('review-modal').dataset.editId;
      if (existingId) {
        await updateDoc(doc(window.fbDB, 'reviews', existingId), {rating:selectedStars, text, product});
      } else {
        await addDoc(collection(window.fbDB, 'reviews'), rev);
        // Update product rating
        const pMatch = allP.find(p => p.name.toLowerCase() === (product||'').toLowerCase());
        if(pMatch) {
          const oldRC = pMatch.ratingCount || 0;
          const oldR = pMatch.rating || 5;
          const newRC = oldRC + 1;
          const newR = ((oldR * oldRC) + selectedStars) / newRC;
          await updateDoc(doc(window.fbDB, 'products', pMatch.id), { ratingCount: newRC, rating: newR });
        }
      }
    }catch(e){console.error(e);}
  }
  
  delete document.getElementById('review-modal').dataset.editId;
  closeReviewModal();
  showToast('Thank you for your review!','⭐');
  document.getElementById('rv-name').value='';document.getElementById('rv-product').value='';document.getElementById('rv-text').value='';
}

function editReview(id) {
  const r = reviewsList.find(x => x.id === id);
  if(!r) return;
  document.getElementById('rv-name').value = r.name;
  document.getElementById('rv-product').value = r.product;
  document.getElementById('rv-text').value = r.text;
  document.getElementById('review-modal').dataset.editId = id;
  openReviewModal();
  setStars(r.rating || 5);
}

/* ═══════════════════════════════
   DISCOUNT POPUP
═══════════════════════════════ */
function closePopup(){document.getElementById('discount-popup').classList.remove('on');}
function copyCode(){
  navigator.clipboard?.writeText('ROX10FIRST').catch(()=>{});
  const el=document.getElementById('dp-code-box');
  el.style.background='rgba(201,168,76,.25)';
  setTimeout(()=>el.style.background='',800);
  showToast('Code copied: ROX10FIRST','🏷');
}
if(!localStorage.getItem('rox_popup_shown')){
  setTimeout(()=>{
    document.getElementById('discount-popup').classList.add('on');
    localStorage.setItem('rox_popup_shown','1');
  },4000);
}

/* ═══════════════════════════════
   TOAST
═══════════════════════════════ */
function showToast(msg,icon='✦'){
  const t=document.getElementById('toast');
  document.getElementById('toast-icon').textContent=icon;
  document.getElementById('toast-msg').textContent=msg;
  t.classList.add('show');clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove('show'),3000);
}

/* ═══════════════════════════════
   SEARCH MODAL
═══════════════════════════════ */
function openSearch(){
  document.getElementById('search-modal').style.display='flex';
  document.getElementById('search-input-modal').focus();
  document.body.style.overflow='hidden';
}
function closeSearch(){
  document.getElementById('search-modal').style.display='none';
  document.body.style.overflow='';
}
function doSearchModal(){
  const q = document.getElementById('search-input-modal').value.toLowerCase().trim();
  const resEl = document.getElementById('search-results');
  if(!q){ resEl.innerHTML=''; return; }
  const matches = allP.filter(p=>p.name.toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
  if(!matches.length){ resEl.innerHTML='<p style="color:var(--white-dim)">No matches found.</p>'; return; }
  resEl.innerHTML = matches.map(p=>`
    <div style="display:flex;align-items:center;gap:1rem;padding:1rem;background:var(--black-card);border:1px solid rgba(201,168,76,.1);cursor:pointer;transition:all .3s;" onclick="closeSearch();openOv('${p.id}')">
      <div style="width:60px;height:60px;background:var(--black-mid);display:flex;align-items:center;justify-content:center;border-radius:4px;overflow:hidden;flex-shrink:0;">
        ${p.imageURL?`<img src="${p.imageURL}" style="width:100%;height:100%;object-fit:contain;">`:`<span style="font-family:var(--font-h);color:var(--gold-dim);font-size:.8rem;">ROX</span>`}
      </div>
      <div>
        <h4 style="font-family:var(--font-h);font-size:1.1rem;color:var(--white);margin-bottom:.2rem;">${p.name}</h4>
        <p style="font-size:.7rem;color:var(--white-dim);">${p.category} · ${p.ml}</p>
      </div>
      <div style="margin-left:auto;color:var(--gold);font-family:var(--font-h);font-size:1.1rem;">₹${p.price.toLocaleString('en-IN')}</div>
    </div>
  `).join('');
}

/* ═══════════════════════════════
   KEYBOARD
═══════════════════════════════ */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeDrawer();closeOv();closeCart();closeOrderModal();closeReviewModal();closePopup();closeSearch();}
});

/* ═══════════════════════════════
   INIT
═══════════════════════════════ */
waitFB(()=>{loadProducts();updateBadge();loadReviews();loadSettings();});