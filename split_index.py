import re

with open('e:/finalrox/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract Style
style_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
if style_match:
    style_content = style_match.group(1).strip()
    with open('e:/finalrox/index/style.css', 'w', encoding='utf-8') as f:
        f.write(style_content)
    html = html[:style_match.start()] + html[style_match.end():]

# Extract Firebase Script
firebase_script_match = re.search(r'<script type="module">(.*?)</script>', html, re.DOTALL)
firebase_content = ''
if firebase_script_match:
    firebase_content = firebase_script_match.group(1).strip()
    html = html[:firebase_script_match.start()] + html[firebase_script_match.end():]

# Extract Main Script
main_script_match = re.search(r'<script>(.*?)</script>', html, re.DOTALL)
main_content = ''
if main_script_match:
    main_content = main_script_match.group(1).strip()
    html = html[:main_script_match.start()] + html[main_script_match.end():]

dynamic_firebase = '''(async () => {
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
'''

with open('e:/finalrox/index/script.js', 'w', encoding='utf-8') as f:
    f.write(dynamic_firebase + '\n\n' + main_content)

head_end = html.find('</head>')
if head_end != -1:
    html = html[:head_end] + '<link rel="stylesheet" href="./style.css">\n<script src="./script.js"></script>\n' + html[head_end:]

with open('e:/finalrox/index/index.html', 'w', encoding='utf-8') as f:
    f.write(html.strip())
