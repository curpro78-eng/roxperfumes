(async () => {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
  const { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  const { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, setDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
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
    window.fbFns = { signInWithEmailAndPassword, signOut, onAuthStateChanged, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, setDoc, getDoc, ref, uploadBytesResumable, getDownloadURL };
    window.firebaseReady = true;
  } catch (e) {
    window.firebaseReady = false;
  }
  document.dispatchEvent(new Event('firebaseReady'));
})();


/* ══ STATE ══ */
let allProds = [], allOrders = [], allReviews = [], editId = null, orderFilter = 'All', catFilter = 'All';
let uploadedImgURL = null;  // URL from Firebase Storage after file upload
let manualUrlValue = '';    // URL typed into the URL field — tracked separately
let uploadInProgress = false; // tracks if upload is running — save is NEVER blocked by this

const EM = {Men:'♂', Women:'♀', Unisex:'⚥', Classic:'✦', Premium:'★'};
const eh = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ══ IMAGE PREVIEW HELPERS ══ */
function updateActiveNote() {
  var note = document.getElementById('img-active-note');
  if (uploadedImgURL && manualUrlValue) {
    note.style.display = 'block';
    note.textContent = '✦ Both sources set — uploaded file will be used (takes priority over URL).';
  } else if (uploadedImgURL) {
    note.style.display = 'block';
    note.textContent = '✦ Uploaded file will be used as product image.';
  } else if (manualUrlValue) {
    note.style.display = 'block';
    note.textContent = '✦ Image URL will be used as product image.';
  } else {
    note.style.display = 'none';
  }
}

function showUploadPreview(dataURL) {
  var wrap = document.getElementById('prev-upload-wrap');
  var img  = document.getElementById('prev-upload');
  img.src = dataURL;
  wrap.style.display = 'block';
}

function hideUploadPreview() {
  document.getElementById('prev-upload-wrap').style.display = 'none';
  document.getElementById('prev-upload').src = '';
}

function showUrlPreview(url) {
  var wrap = document.getElementById('prev-url-wrap');
  var img  = document.getElementById('prev-url');
  if (!url) { hideUrlPreview(); return; }
  img.src = url;
  img.onerror = function() { hideUrlPreview(); };
  img.onload  = function() { wrap.style.display = 'block'; };
}

function hideUrlPreview() {
  document.getElementById('prev-url-wrap').style.display = 'none';
  document.getElementById('prev-url').src = '';
}

function clearUpload() {
  uploadedImgURL = null;
  hideUploadPreview();
  document.getElementById('m-file').value = '';
  document.getElementById('upload-label-text').innerHTML = '📸 Click or drag to upload image';
  document.getElementById('imgUploadArea').classList.remove('has-upload');
  document.getElementById('upload-progress').style.display = 'none';
  updateActiveNote();
  toast('Uploaded image removed', '');
}

function clearUrlPreview() {
  manualUrlValue = '';
  document.getElementById('m-img').value = '';
  hideUrlPreview();
  updateActiveNote();
}

/* ══ URL INPUT — independent from upload ══ */
function onUrlInput() {
  var val = document.getElementById('m-img').value.trim();
  manualUrlValue = val;
  if (val) {
    showUrlPreview(val);
  } else {
    hideUrlPreview();
  }
  updateActiveNote();
  // NOTE: uploadedImgURL is NOT touched here — URL field and upload are fully independent
}

/* ══ IMAGE COMPRESSION ══ */
function compressImage(file, maxPx, quality) {
  maxPx = maxPx || 900; quality = quality || 0.8;
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onerror = function(){ reject(new Error('FileReader error')); };
    reader.onload = function(e) {
      var img = new Image();
      img.onerror = function(){ reject(new Error('Image load error. Ensure file is a valid image.')); };
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var w = img.width, h = img.height;
        if (w > maxPx || h > maxPx) {
          if (w > h) { h = Math.round(h / w * maxPx); w = maxPx; }
          else { w = Math.round(w / h * maxPx); h = maxPx; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        var isPng = file.type === 'image/png';
        resolve({
          dataURL: canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality),
          type: isPng ? 'image/png' : 'image/jpeg',
          ext: isPng ? '.png' : '.jpg'
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function dataURLtoBlob(dataURL) {
  var parts = dataURL.split(',');
  var mime  = parts[0].match(/:(.*?);/)[1];
  var bstr  = atob(parts[1]);
  var n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], {type: mime});
}

/* ══ IMAGE UPLOAD — fires on file pick, uploads immediately ══ */
async function handleImg(input) {
  if (!input.files || !input.files[0]) return;

  var file = input.files[0];
  // ✅ Save button is NEVER disabled — upload runs independently in background

  // Reset upload state (but do NOT touch manualUrlValue/URL field)
  uploadedImgURL = null;
  uploadInProgress = true;
  hideUploadPreview();

  var labelEl  = document.getElementById('upload-label-text');
  var prog     = document.getElementById('upload-progress');
  var progBar  = document.getElementById('upload-progress-bar');
  var area     = document.getElementById('imgUploadArea');

  area.classList.remove('has-upload');
  labelEl.innerHTML = '⏳ Compressing image…';
  prog.style.display = 'block';
  progBar.style.width = '10%';

  try {
    // Step 1: compress
    var result = await compressImage(file);

    // Show upload preview immediately (separate from URL preview)
    showUploadPreview(result.dataURL);
    progBar.style.width = '30%';

    // Store data URL directly in Firestore (Base64 JPEG/PNG)
    uploadedImgURL = result.dataURL;
    uploadInProgress = false;
    area.classList.add('has-upload');
    labelEl.innerHTML = '✅ <strong style="color:var(--green)">Compression complete!</strong> Image ready to save.';
    toast('Image processed successfully', 'success');
    setTimeout(() => { prog.style.display = 'none'; progBar.style.width = '0'; }, 1400);

  } catch (err) {
    console.error('Image upload failed:', err);
    progBar.style.width = '0'; prog.style.display = 'none';
    area.classList.remove('has-upload');
    labelEl.innerHTML = '❌ Upload failed: ' + (err.message || err.code || 'unknown error');
    uploadedImgURL = null;
    uploadInProgress = false;
    hideUploadPreview();
    toast('Image upload failed: ' + (err.message||err.code||'error'), 'error');
  } finally {
    input.value = '';
    updateActiveNote();
  }
}

/* ══ FIREBASE INIT ══ */
function waitFB(fn){ window.firebaseReady ? fn() : document.addEventListener('firebaseReady', fn); }
waitFB(() => {
  window.fbFns.onAuthStateChanged(window.fbAuth, user => { if (user) showDash(user); });
});

async function doLogin() {
  var email = document.getElementById('a-email').value.trim();
  var pass  = document.getElementById('a-pass').value;
  var err   = document.getElementById('login-err');
  var btn   = document.getElementById('login-btn');
  err.classList.remove('show');
  if (!email || !pass) { err.classList.add('show'); return; }
  btn.disabled = true; btn.textContent = 'Signing in…';
  if (!window.fbAuth || !window.firebaseReady) { showDash({email}); return; }
  try {
    var cred = await window.fbFns.signInWithEmailAndPassword(window.fbAuth, email, pass);
    showDash(cred.user);
  } catch {
    err.classList.add('show');
    btn.disabled = false; btn.textContent = 'Enter Dashboard';
  }
}
async function doLogout() {
  if (window.fbAuth) { try { await window.fbFns.signOut(window.fbAuth); } catch {} }
  document.getElementById('dashboard').classList.remove('active');
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('login-btn').disabled = false;
  document.getElementById('login-btn').textContent = 'Enter Dashboard';
}
function showDash(user) {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('dashboard').classList.add('active');
  var email = (user && user.email) ? user.email : 'Admin';
  document.getElementById('sb-avatar').textContent = email.charAt(0).toUpperCase();
  document.getElementById('sb-uname').textContent  = email.split('@')[0];
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  loadAll();
}

/* ══ DATA LOADING ══ */
function loadAll(){ loadProds(); loadOrders(); loadReviews(); loadSettings(); }

async function loadSettings() {
  if (!window.fbDB) return;
  // Previously loaded QR and UPI settings here. Now using Razorpay.
}

function loadProds() {
  if (!window.fbDB) { demoProds(); postProds(); return; }
  try {
    var {collection, query, orderBy, onSnapshot} = window.fbFns;
    onSnapshot(query(collection(window.fbDB,'products'), orderBy('name')), snap => {
      allProds = snap.docs.map(d => ({id:d.id,...d.data()}));
      if (!allProds.length) demoProds();
      postProds();
    }, () => { demoProds(); postProds(); });
  } catch { demoProds(); postProds(); }
}
function postProds(){ renderAnalytics(); renderRecent(); renderProdsTable(); updateBadges(); }

function demoProds() {
  allProds = [
    {id:'d1',name:'Noir Royale',price:2999,ml:'100ml',category:'Premium',imageURL:'',description:'Top: Bergamot\nMiddle: Oud\nBase: Sandalwood',openingStock:50,addedStock:0,soldCount:42,stock:8,available:true},
    {id:'d2',name:"Fleur d'Or",price:3499,ml:'50ml',category:'Classic',imageURL:'',description:'Top: Rose, Peach\nMiddle: Jasmine\nBase: Vanilla',openingStock:75,addedStock:0,soldCount:67,stock:8,available:true},
    {id:'d3',name:'Velvet Oud',price:4999,ml:'75ml',category:'Premium',imageURL:'',description:'Top: Saffron\nMiddle: Oud, Amber\nBase: Patchouli',openingStock:33,addedStock:0,soldCount:28,stock:5,available:true},
    {id:'d4',name:'Crystal Blanc',price:1999,ml:'50ml',category:'Classic',imageURL:'',description:'Top: Lemon\nMiddle: Lily\nBase: Cedarwood',openingStock:100,addedStock:9,soldCount:89,stock:20,available:true},
    {id:'d5',name:'Dark Ember',price:3299,ml:'100ml',category:'Premium',imageURL:'',description:'Top: Grapefruit\nMiddle: Tobacco\nBase: Vetiver',openingStock:35,addedStock:0,soldCount:35,stock:0,available:false},
    {id:'d6',name:'Mystique Rose',price:2799,ml:'75ml',category:'Classic',imageURL:'',description:'Top: Raspberry\nMiddle: Rose\nBase: Sandalwood',openingStock:60,addedStock:6,soldCount:54,stock:12,available:true},
  ];
}

async function loadOrders() {
  if (!window.fbDB) { demoOrders(); postOrders(); return; }
  try {
    var {collection, getDocs, query, orderBy} = window.fbFns;
    var snap = await getDocs(query(collection(window.fbDB,'orders'), orderBy('date','desc')));
    allOrders = snap.docs.map(d => ({id:d.id,...d.data()}));
    if (!allOrders.length) demoOrders();
  } catch { demoOrders(); }
  postOrders();
}
function postOrders(){ renderOrdersList(); renderAnalytics(); updateBadges(); }
function demoOrders() {
  allOrders = [
    {id:'ORD001',customerName:'Arjun Kumar',phone:'9876543210',address:'12 MG Road, Chennai',totalAmount:5998,status:'Completed',date:new Date().toISOString(),items:[{name:'Noir Royale',qty:2,price:2999}]},
    {id:'ORD002',customerName:'Priya Sharma',phone:'9123456789',address:'45 Park Street, Coimbatore',totalAmount:3499,status:'Pending',date:new Date(Date.now()-86400000).toISOString(),items:[{name:"Fleur d'Or",qty:1,price:3499}]},
    {id:'ORD003',customerName:'Vikram Nair',phone:'9988776655',address:'7 Beach Ave, Madurai',totalAmount:9998,status:'Pending',date:new Date(Date.now()-172800000).toISOString(),items:[{name:'Velvet Oud',qty:2,price:4999}]},
    {id:'ORD004',customerName:'Anita Raj',phone:'9871234560',address:'3 Gandhi St, Salem',totalAmount:2799,status:'Completed',date:new Date(Date.now()-864000000).toISOString(),items:[{name:'Mystique Rose',qty:1,price:2799}]},
  ];
}

async function loadReviews() {
  if (!window.fbDB) { renderReviewsPanel(); updateBadges(); return; }
  try {
    var {collection, getDocs, query, orderBy} = window.fbFns;
    var snap = await getDocs(query(collection(window.fbDB,'reviews'), orderBy('date','desc')));
    allReviews = snap.docs.map(d => ({id:d.id,...d.data()}));
  } catch(e) { allReviews = []; }
  renderReviewsPanel(); updateBadges();
}

function updateBadges() {
  document.getElementById('sb-prod-count').textContent = allProds.length;
  var p = allOrders.filter(o => o.status==='Pending').length;
  var b = document.getElementById('sb-order-badge');
  b.textContent = p; b.style.display = p > 0 ? '' : 'none';
  document.getElementById('sb-review-count').textContent = allReviews.length;
}

/* ══ ANALYTICS ══ */
function renderAnalytics() {
  var pending = allOrders.filter(o => o.status==='Pending').length;
  var low   = allProds.filter(p => p.stock > 0 && p.stock <= 5).length;
  var out   = allProds.filter(p => p.stock === 0).length;
  var avail = allProds.filter(p => p.available !== false).length;
  var top   = [...allProds].sort((a,b) => (b.soldCount||0)-(a.soldCount||0))[0];

  // Sales Analytics (Monthly Revenue & Most Revenue Product)
  var currMonth = new Date().getMonth();
  var currYear = new Date().getFullYear();
  var monthlyOrders = allOrders.filter(o => {
    let d = new Date(o.date);
    return d.getMonth() === currMonth && d.getFullYear() === currYear;
  });
  var totalRevenue = monthlyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  // Calculate highest revenue product
  var prodRevenues = {};
  monthlyOrders.forEach(o => {
    (o.items || []).forEach(item => {
      if(!prodRevenues[item.name]) prodRevenues[item.name] = 0;
      prodRevenues[item.name] += (item.price || 0) * (item.qty || 0);
    });
  });
  var highestRevProd = Object.keys(prodRevenues).sort((a,b) => prodRevenues[b]-prodRevenues[a])[0] || "—";
  var highestRevAmount = prodRevenues[highestRevProd] || 0;

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card">
      <div class="sc-icon ic-blue"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
      <p class="sc-label">Monthly Revenue</p>
      <p class="sc-value">₹${totalRevenue.toLocaleString('en-IN')}</p>
      <p class="sc-sub">Highest Rev: ${highestRevProd} (₹${highestRevAmount.toLocaleString('en-IN')})</p>
    </div>
    <div class="stat-card">
      <div class="sc-icon ic-blue"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div>
      <p class="sc-label">Total Orders</p>
      <p class="sc-value">${allOrders.length}</p>
      <p class="sc-sub">${pending} pending <span class="pill ${pending>0?'pill-warn':'pill-up'}">${pending>0?'⚠ Action':'✓ Clear'}</span></p>
    </div>
    <div class="stat-card">
      <div class="sc-icon ic-red"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
      <p class="sc-label">Stock Alerts</p>
      <p class="sc-value ${(low+out)>0?'red':''}">${low+out}</p>
      <p class="sc-sub">${out} out of stock <span class="pill ${out>0?'pill-red':'pill-up'}">${out>0?'Urgent':'OK'}</span></p>
    </div>
    <div class="stat-card">
      <div class="sc-icon ic-gold"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
      <p class="sc-label">Most Sold Product</p>
      <p class="sc-value sm">${top ? eh(top.name) : '—'}</p>
      <p class="sc-sub">${top ? (top.soldCount||0)+' units sold' : ''}</p>
    </div>`;

  var sorted = [...allProds].sort((a,b)=>(b.soldCount||0)-(a.soldCount||0)).slice(0,5);
  document.getElementById('top-prods').innerHTML = sorted.map((p,i) =>
    `<div class="top-prod-item">
      <span class="tp-rank">${i+1}</span>
      ${p.imageURL ? `<img class="tp-img" src="${eh(p.imageURL)}" alt="">` : `<div class="tp-ph">${EM[p.category]||'🪣'}</div>`}
      <div class="tp-info"><p class="tp-name">${eh(p.name)}</p><p class="tp-meta">${eh(p.category||'')} · ${eh(p.ml||'')}</p></div>
      <div class="tp-right">
        <p class="tp-sold">${p.soldCount||0}</p>
        <p class="tp-stock"><span class="${p.stock===0?'stock-zero':p.stock<=5?'stock-low':'stock-ok'}">${p.stock} left</span></p>
      </div>
    </div>`).join('');
}

/* ══ RECENT LIST ══ */
function renderRecent() {
  var c = document.getElementById('recentList');
  document.getElementById('recent-count').textContent = allProds.length + ' items';
  if (!allProds.length) { c.innerHTML='<div class="loading-state">No products yet.</div>'; return; }
  c.innerHTML = allProds.map(p => {
    var img = p.imageURL ? `<img class="ri-img" src="${eh(p.imageURL)}" alt="">` : `<div class="ri-ph">${EM[p.category]||'🪣'}</div>`;
    return `<div class="recent-item">${img}<div class="ri-name">${eh(p.name)}</div><span class="cat-pill">${eh(p.category||'')}</span><span class="ri-price">${p.price>0?'₹'+Number(p.price).toLocaleString('en-IN'):'On Request'}</span><span class="status-badge ${p.available!==false?'avail':'unavail'}">${p.available!==false?'✅ Active':'❌ Hidden'}</span></div>`;
  }).join('');
}

/* ══ PRODUCTS TABLE ══ */
var catF = 'All';
function setCatFilter(cat,btn){ catF=cat; document.querySelectorAll('.filter-pill').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); renderProdsTable(); }
function renderProdsTable() {
  var search = (document.getElementById('prod-search')||{}).value||'';
  var list = catF==='All' ? allProds : allProds.filter(p=>p.category===catF);
  if (search.trim()) list = list.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
  var cc = {Men:'cat-men', Women:'cat-women', Unisex:'cat-unisex', Classic:'cat-classic', Premium:'cat-premium'};
  if (!list.length) { document.getElementById('prod-tbody').innerHTML=`<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">🔍</div><p class="empty-text">No products found</p><p class="empty-sub">Try adjusting your search or filter</p></div></td></tr>`; return; }
  document.getElementById('prod-tbody').innerHTML = list.map(p =>
    `<tr>
      <td data-label="Image">${p.imageURL?`<img src="${eh(p.imageURL)}" class="tbl-img" alt="">`:`<div class="tbl-ph">${EM[p.category]||'🪣'}</div>`}</td>
      <td class="tbl-name" data-label="Name">${eh(p.name)}</td>
      <td data-label="Prices" style="text-align:right">
        ${p.prices && p.prices['8ml'] ? `8ml: ₹${Number(p.prices['8ml']).toLocaleString('en-IN')}<br>` : ''}
        ${p.prices && p.prices['30ml'] ? `30ml: ₹${Number(p.prices['30ml']).toLocaleString('en-IN')}<br>` : ''}
        ${p.prices && p.prices['50ml'] ? `50ml: ₹${Number(p.prices['50ml']).toLocaleString('en-IN')}` : ''}
        ${!p.prices ? `₹${Number(p.price||0).toLocaleString('en-IN')}` : ''}
      </td>
      <td data-label="Category"><span class="cat-badge ${cc[p.category]||'cat-classic'}">${eh(p.category)}</span></td>
      <td data-label="Stock" class="${p.stock===0?'stock-zero':p.stock<=5?'stock-low':'stock-ok'}">${p.stock}</td>
      <td data-label="Sold">${p.soldCount||0}</td>
      <td data-label="Status"><span class="status-badge ${p.available!==false?'avail':'unavail'}">${p.available!==false?'Active':'Hidden'}</span></td>
      <td data-label="Actions" style="text-align:right">
        <button class="btn-tbl btn-edit" onclick="editProd('${p.id}')">Edit</button>
        <button class="btn-tbl btn-toggle ${p.available!==false?'':'off'}" onclick="toggleAvail('${p.id}')">${p.available!==false?'Hide':'Show'}</button>
        <button class="btn-tbl btn-del" onclick="delProd('${p.id}')">Del</button>
      </td>
    </tr>`).join('');
}

/* ══ MODAL ══ */
function resetImageState() {
  uploadedImgURL = null;
  manualUrlValue = '';
  hideUploadPreview();
  hideUrlPreview();
  document.getElementById('m-file').value = '';
  document.getElementById('upload-label-text').innerHTML = '📸 Click or drag to upload image';
  document.getElementById('imgUploadArea').classList.remove('has-upload');
  document.getElementById('upload-progress').style.display = 'none';
  document.getElementById('img-active-note').style.display = 'none';
}

function openModal(id) {
  editId = id || null;
  document.getElementById('modal-title').textContent = id ? 'Edit Product' : 'Add Product';
  document.getElementById('m-pid').value = id || '';

  resetImageState();

  if (!id) {
    ['m-name','m-price-base','m-price-6','m-price-30','m-price-50','m-price-70','m-price-100','m-img','m-top-notes','m-mid-notes','m-base-notes','pDescription','m-open-stock','m-add-stock'].forEach(i => { var el=document.getElementById(i); if(el) el.value=''; });
    document.getElementById('m-cat').value = 'Classic';
    document.getElementById('pSize').value = '';
    document.getElementById('m-def-ml').value = '50ml';
  }
  document.getElementById('prod-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('prod-modal').classList.remove('active');
  editId = null;
  resetImageState();
}

function editProd(id) {
  var p = allProds.find(x => x.id===id);
  if (!p) return;
  openModal(id);
  document.getElementById('m-name').value  = p.name || '';
  document.getElementById('m-price-base').value = p.price || '';
  document.getElementById('m-price-6').value = (p.prices && p.prices['8ml']) || '';
  document.getElementById('m-price-30').value = (p.prices && p.prices['30ml']) || '';
  document.getElementById('m-price-50').value = (p.prices && p.prices['50ml']) || '';
  document.getElementById('m-price-70').value = (p.prices && p.prices['70ml']) || '';
  document.getElementById('m-price-100').value = (p.prices && p.prices['100ml']) || '';
  document.getElementById('m-cat').value   = p.category || 'Classic';
  document.getElementById('pSize').value = p.size || '';
  // Use existing stock as openingStock if openingStock doesn't exist yet
  document.getElementById('m-open-stock').value = p.openingStock !== undefined ? p.openingStock : (p.stock || 0);
  document.getElementById('m-add-stock').value = p.addedStock || 0;
  document.getElementById('m-def-ml').value = p.defaultMl || '50ml';
  document.getElementById('m-top-notes').value = p.topNotes || '';
  document.getElementById('m-mid-notes').value = p.middleNotes || '';
  document.getElementById('m-base-notes').value = p.baseNotes || '';
  document.getElementById('pDescription').value = p.description || '';

  // Populate URL field if product has an image
  if (p.imageURL) {
    document.getElementById('m-img').value = p.imageURL;
    manualUrlValue = p.imageURL;
    showUrlPreview(p.imageURL);
    updateActiveNote();
  }
}

async function saveProd() {
  var name        = document.getElementById('m-name').value.trim();
  var pBase       = parseFloat(document.getElementById('m-price-base').value) || 0;
  var p6          = parseFloat(document.getElementById('m-price-6').value) || 0;
  var p30         = parseFloat(document.getElementById('m-price-30').value) || 0;
  var p50         = parseFloat(document.getElementById('m-price-50').value) || 0;
  var p70         = parseFloat(document.getElementById('m-price-70').value) || 0;
  var p100        = parseFloat(document.getElementById('m-price-100').value) || 0;
  var prices      = { '8ml': p6, '30ml': p30, '50ml': p50, '70ml': p70, '100ml': p100 };
  var category    = document.getElementById('m-cat').value;
  var size        = document.getElementById('pSize').value;
  var openingStock= parseInt(document.getElementById('m-open-stock').value) || 0;
  var addedStock  = parseInt(document.getElementById('m-add-stock').value) || 0;
  var defaultMl   = document.getElementById('m-def-ml').value;
  var topNotes = document.getElementById('m-top-notes').value.trim();
  var middleNotes = document.getElementById('m-mid-notes').value.trim();
  var baseNotes = document.getElementById('m-base-notes').value.trim();
  var description = document.getElementById('pDescription').value.trim();
  var typedURL    = document.getElementById('m-img').value.trim();

  if (!name)              { toast('Product name is required','error'); return; }

  setSaving(true);

  /*
   * Image priority (clear hierarchy, no conflicts):
   *   1. uploadedImgURL  — file was uploaded to Firebase Storage this session
   *   2. typedURL        — URL typed into the URL field
   *   3. '' (empty)      — no image set (new product)
   *   For edits: if neither 1 nor 2 is set, keep the existing imageURL unchanged
   */
  var imageURL = '';
  if (uploadedImgURL) {
    imageURL = uploadedImgURL;
  } else if (typedURL) {
    imageURL = typedURL;
  } else if (editId) {
    var existingProd = allProds.find(p => p.id === editId);
    imageURL = existingProd ? (existingProd.imageURL || '') : '';
  }

  var isEdit   = !!editId;
  var existing = isEdit ? allProds.find(p => p.id === editId) : null;
  var targetId = editId;

  var soldCount = existing ? (existing.soldCount || 0) : 0;
  var stock = openingStock + addedStock - soldCount;
  if(stock < 0) stock = 0; // Prevent negative stock

  // Remove productType from existing product if it exists
  if (existing && existing.productType !== undefined) {
    delete existing.productType;
  }

  var data = {
    name, price: pBase, prices, category, size, openingStock, addedStock, stock, topNotes, middleNotes, baseNotes, description, imageURL, defaultMl,
    soldCount : soldCount,
    available : existing ? (existing.available !== false) : true,
  };

  try {
    if (window.fbDB) {
      var {collection, addDoc, doc, updateDoc} = window.fbFns;
      if (isEdit && targetId && !targetId.startsWith('d')) {
        await updateDoc(doc(window.fbDB,'products',targetId), data);
        toast('Product updated!','success');
      } else {
        await addDoc(collection(window.fbDB,'products'), data);
        toast('Product added!','success');
      }
    } else {
      if (isEdit && targetId) {
        var idx = allProds.findIndex(p => p.id === targetId);
        if (idx >= 0) allProds[idx] = {...allProds[idx], ...data};
        else allProds.push({id:'d'+Date.now(), ...data});
        toast('Product updated (local)!','success');
      } else {
        allProds.push({id:'d'+Date.now(), ...data});
        toast('Product added (local)!','success');
      }
    }
  } catch(err) {
    console.error('Save error:', err);
    toast('Save failed: ' + err.message, 'error');
    setSaving(false); return;
  }

  setSaving(false);
  closeModal();
  renderProdsTable(); renderAnalytics(); renderRecent(); updateBadges();
}

function setSaving(on) {
  document.getElementById('save-btn').disabled = on;
  document.getElementById('save-label').style.display = on ? 'none' : '';
  document.getElementById('save-spin').style.display  = on ? 'block' : 'none';
}

async function delProd(id) {
  if (!confirm('Delete this product?')) return;
  if (window.fbDB && !id.startsWith('d')) {
    try { var {doc,deleteDoc}=window.fbFns; await deleteDoc(doc(window.fbDB,'products',id)); } catch {}
  }
  allProds = allProds.filter(p => p.id!==id);
  renderProdsTable(); renderAnalytics(); renderRecent(); updateBadges();
  toast('Product deleted','success');
}

async function toggleAvail(id) {
  var p = allProds.find(x => x.id===id); if (!p) return;
  var newVal = p.available === false;
  if (window.fbDB && !id.startsWith('d')) {
    try { var {doc,updateDoc}=window.fbFns; await updateDoc(doc(window.fbDB,'products',id),{available:newVal}); } catch {}
  }
  p.available = newVal;
  renderProdsTable(); renderRecent();
  toast(newVal ? 'Product visible on site' : 'Product hidden from site', newVal ? 'success' : '');
}

/* ══ ORDERS ══ */
function filterOrders(f,btn) {
  orderFilter = f;
  document.querySelectorAll('.fo-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderOrdersList();
}
function renderOrdersList() {
  var filtered = orderFilter==='All' ? allOrders : allOrders.filter(o=>o.status===orderFilter);
  document.getElementById('order-count').textContent = `${filtered.length} order${filtered.length!==1?'s':''}`;
  if (!filtered.length) {
    document.getElementById('orders-list').innerHTML=`<div class="empty-state"><div class="empty-icon">📋</div><p class="empty-text">No ${orderFilter==='All'?'':orderFilter.toLowerCase()} orders</p><p class="empty-sub">${orderFilter==='Pending'?'All caught up! 🎉':'Orders will appear here'}</p></div>`;
    return;
  }
  document.getElementById('orders-list').innerHTML = filtered.map(o => {
    var d  = new Date(o.date);
    var ds = d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
    var items = (o.items||[]).map(i=>`<div class="oc-item"><span>${eh(i.name)} ${i.ml?`(${eh(i.ml)})`:''} × ${i.qty}</span><span class="oc-item-price">₹${((i.price||0)*i.qty).toLocaleString('en-IN')}</span></div>`).join('');
    var sc = o.status==='Completed'?'s-completed':o.status==='Cancelled'?'s-cancelled':'s-pending';
    var waMsg = `ROX Order Update\nOrder: #${o.id.slice(-6).toUpperCase()}\nCustomer: ${o.customerName}\nTotal: ₹${(o.totalAmount||0).toLocaleString('en-IN')}\nStatus: ${o.status}`;
    return `<div class="order-card">
      <div class="oc-head" onclick="toggleOrder('${o.id}')">
        <div><p class="oc-id">#${o.id.slice(-6).toUpperCase()}</p><span class="s-badge ${sc}">${o.status||'Pending'}</span></div>
        <div><p class="oc-customer">${eh(o.customerName||'N/A')}</p><p class="oc-phone">${eh(o.phone||'')}</p></div>
        <p class="oc-date">${ds}</p>
        <p class="oc-amt">₹${(o.totalAmount||0).toLocaleString('en-IN')}</p>
        <span class="oc-chev" id="chev-${o.id}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>
      </div>
      <div class="oc-body" id="body-${o.id}">
        <div class="oc-sep"></div>${items}
        ${o.address?`<div class="oc-addr">📍 ${eh(o.address)}</div>`:''}
        ${o.paymentScreenshot ? `
        <div class="oc-payment" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed rgba(201,168,76,0.2);">
          <p style="font-size: 0.8rem; color: var(--gold); margin-bottom: 0.5rem;">Payment Screenshot</p>
          <img src="${o.paymentScreenshot}" style="max-height: 120px; border-radius: 4px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);" onclick="window.open('${o.paymentScreenshot}', '_blank')">
          ${o.paymentReference ? `<p style="font-size: 0.75rem; color: var(--white-dim); margin-top: 0.4rem;">Ref / UTR: <strong style="color:var(--white)">${eh(o.paymentReference)}</strong></p>` : ''}
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <button class="btn-oc" style="padding: 0.4rem 0.8rem; font-size: 0.7rem;" onclick="window.open('${o.paymentScreenshot}', '_blank')">🔍 View</button>
            <button class="btn-oc" style="padding: 0.4rem 0.8rem; font-size: 0.7rem;" onclick="downloadImage('${o.paymentScreenshot}', 'payment_${o.id}.png')">⬇ Download</button>
          </div>
        </div>
        ` : ''}
        <div class="oc-actions">
          ${o.status!=='Completed'?`<button class="btn-oc btn-complete" onclick="setStatus('${o.id}','Completed')">✓ Mark Completed</button>`:''}
          ${o.status!=='Cancelled'?`<button class="btn-oc btn-cancel-ord" onclick="setStatus('${o.id}','Cancelled')">✕ Cancel</button>`:''}
          <button class="btn-oc btn-wa" onclick="window.open('https://wa.me/91${(o.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(waMsg)}','_blank')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--gold)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            WhatsApp
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch(e) {
    window.open(url, '_blank');
  }
}

function toggleOrder(id) {
  document.getElementById('body-'+id).classList.toggle('open');
  document.getElementById('chev-'+id).classList.toggle('open');
}
async function setStatus(id,status) {
  if (window.fbDB && !id.startsWith('ORD')) {
    try { var {doc,updateDoc}=window.fbFns; await updateDoc(doc(window.fbDB,'orders',id),{status}); } catch {}
  }
  var o = allOrders.find(x=>x.id===id); if(o) o.status = status;
  renderOrdersList(); renderAnalytics(); updateBadges();
  toast(`Order marked as ${status}`, status==='Completed'?'success':'');
}

/* ══ REVIEWS PANEL ══ */
function renderReviewsPanel() {
  var c = document.getElementById('reviews-admin-list');
  document.getElementById('review-subtitle').textContent = allReviews.length + ' review' + (allReviews.length!==1?'s':'') + ' from customers';
  if (!allReviews.length) {
    c.innerHTML = `<div class="empty-state"><div class="empty-icon">⭐</div><p class="empty-text">No reviews yet</p><p class="empty-sub">Reviews submitted from the website will appear here</p></div>`;
    return;
  }
  c.innerHTML = allReviews.map(r => `
    <div class="review-admin-card">
      <div class="rac-avatar">${(r.name||'?')[0].toUpperCase()}</div>
      <div class="rac-body">
        <div class="rac-header">
          <span class="rac-name">${eh(r.name||'Anonymous')}</span>
          <span class="rac-product">${eh(r.product||'')}</span>
          <span class="rac-stars">${'★'.repeat(r.rating||5)}</span>
          <span class="rac-date">${r.date ? new Date(r.date).toLocaleDateString('en-IN') : 'Unknown date'}</span>
        </div>
        <p class="rac-text">"${eh(r.text||r.review||'')}"</p>
        ${r.verified ? '<p style="font-size:0.64rem;color:var(--green);margin-top:0.5rem">✓ Verified Purchase</p>' : ''}
        <div class="rac-actions">
          <button class="btn-tbl btn-del" onclick="deleteReview('${r.id}')">Delete</button>
        </div>
      </div>
    </div>`).join('');
}

async function deleteReview(id) {
  if (!confirm('Delete this review?')) return;
  if (window.fbDB && id) {
    try { var {doc,deleteDoc}=window.fbFns; await deleteDoc(doc(window.fbDB,'reviews',id)); } catch {}
  }
  allReviews = allReviews.filter(r => r.id !== id);
  renderReviewsPanel(); updateBadges();
  toast('Review deleted','success');
}

/* ══ EXPORT ══ */
function exportToExcel() {
  if (typeof XLSX === 'undefined') {
    toast('Excel library loading, please try again in a moment...', 'error');
    return;
  }

  // Monthly Revenue Data
  var currMonth = new Date().getMonth();
  var currYear = new Date().getFullYear();
  var monthlyOrders = allOrders.filter(o => {
    let d = new Date(o.date);
    return d.getMonth() === currMonth && d.getFullYear() === currYear;
  });
  
  var prodRevenues = {};
  monthlyOrders.forEach(o => {
    (o.items || []).forEach(item => {
      if(!prodRevenues[item.name]) prodRevenues[item.name] = 0;
      prodRevenues[item.name] += (item.price || 0) * (item.qty || 0);
    });
  });
  var top   = [...allProds].sort((a,b) => (b.soldCount||0)-(a.soldCount||0))[0];
  var topSellingProd = top ? top.name : "—";
  
  var exportData = allProds.map(p => {
    var monthlyRev = prodRevenues[p.name] || 0;
    return {
      "Date": new Date().toLocaleDateString('en-IN'),
      "Product Name": p.name || "",
      "Opening Stock": p.openingStock || 0,
      "Added Stock": p.addedStock || 0,
      "Total Sales": p.soldCount || 0,
      "Balance Stock": p.stock || 0,
      "Monthly Revenue": monthlyRev,
      "Top Selling Product": p.name === topSellingProd ? "Yes" : "No"
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock & Sales Data");
  
  // Save as Excel file
  XLSX.writeFile(wb, `ROX_Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  toast('Excel report downloaded!', 'success');
}

/* ══ SETTINGS ══ */
// Settings are now handled directly through Razorpay and frontend code.

function exportProducts(){
  const data = JSON.stringify(allProds, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'products.json';
  a.click();
}

function importProducts(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if(!Array.isArray(imported)) throw new Error("JSON must be an array");
      if(!window.fbDB) {
        allProds = imported;
        renderProdsTable(); updateBadges(); renderRecent(); renderAnalytics();
        toast('Products imported locally', 'success');
        return;
      }
      toast('Importing to Firebase...', '');
      var { collection, doc, setDoc } = window.fbFns;
      for(const p of imported) {
        if(p.id) {
          const id = p.id;
          const pData = {...p}; delete pData.id;
          await setDoc(doc(window.fbDB, 'products', id), pData, { merge: true });
        }
      }
      toast('Import successful!', 'success');
    } catch(err) {
      toast('Import failed: ' + err.message, 'error');
    }
    document.getElementById('importJson').value = '';
  };
  reader.readAsText(file);
}

/* ══ NAV ══ */
function showPanel(name,btn) {
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.sb-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('panel-'+name).classList.add('active');
  if(btn) btn.classList.add('active');
  if(window.innerWidth<=768) closeSidebar();
}
function toggleSidebar(){ document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sb-overlay').classList.toggle('show'); }
function closeSidebar(){ document.getElementById('sidebar').classList.remove('open'); document.getElementById('sb-overlay').classList.remove('show'); }

document.getElementById('prod-modal').addEventListener('click', function(e){ if(e.target===this) closeModal(); });

/* ══ TOAST ══ */
var toastT;
function toast(msg,type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type?' t-'+type:'');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 3200);
}