/**
 * post.js 文章页专属脚本
 * 仅在posts/[slug].html加载
 */
document.addEventListener('DOMContentLoaded', () => {
  // ========== 文章顶部阅读进度条 ==========
  const progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    function updateReadingProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight <= 0 ? 0 : (scrollTop / docHeight) * 100;
      progressBar.style.setProperty('--progress', `${percent}%`);
    }
    window.addEventListener('scroll', updateReadingProgress);
    window.addEventListener('resize', updateReadingProgress);
    updateReadingProgress();
  }

  // ========== 环形进度悬浮回到顶部 + 直达底部 ==========
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const scrollBottomBtn = document.getElementById('scrollBottomBtn');
  const progressCircleWrap = document.getElementById('progressCircleWrap');
  const progressCircle = document.getElementById('progressCircle');
  const circumference = 125.6;

  function updateFloatBtnState() {
    if(!scrollTopBtn || !scrollBottomBtn) return;
    const scrollY = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    let percent = 0;
    if(scrollHeight > 0) {
      percent = scrollY / scrollHeight;
    }
    const dashOffset = circumference * (1 - percent);
    progressCircle.style.strokeDashoffset = dashOffset;

    if (scrollY > 300) {
      progressCircleWrap.classList.add('show');
      scrollBottomBtn.classList.add('show');
    } else {
      progressCircleWrap.classList.remove('show');
      scrollBottomBtn.classList.remove('show');
    }
  }
  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  scrollBottomBtn?.addEventListener('click', () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
  window.addEventListener('scroll', updateFloatBtnState);
  window.addEventListener('resize', updateFloatBtnState);
  updateFloatBtnState();

  // ========== 代码块复制按钮 ==========
  const codeBlocks = document.querySelectorAll('pre');
  codeBlocks.forEach(preEl => {
    if (preEl.querySelector('.copy-btn')) return;
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '复制';
    copyBtn.addEventListener('click', async () => {
      const codeText = preEl.querySelector('code')?.innerText || preEl.innerText;
      try {
        await navigator.clipboard.writeText(codeText);
        copyBtn.textContent = '已复制';
      } catch (err) {
        copyBtn.textContent = '复制失败';
      }
      setTimeout(() => copyBtn.textContent = '复制', 1500);
    });
    preEl.appendChild(copyBtn);
  });

  // ========== 代码语言标签 ==========
  document.querySelectorAll('pre code').forEach(codeEl => {
    const clsList = Array.from(codeEl.classList);
    const langClass = clsList.find(c => c.startsWith('language-'));
    if (!langClass) return;
    const langName = langClass.replace('language-', '');
    const label = document.createElement('span');
    label.className = 'code-lang-label';
    label.textContent = langName;
    codeEl.parentElement.appendChild(label);
  });

  // ========== 字数统计 & 预估阅读时间 ==========
  const articleEl = document.querySelector('article');
  const wordCountEl = document.getElementById('wordCount');
  const readTimeEl = document.getElementById('readTime');
  if(articleEl && wordCountEl && readTimeEl){
    const clone = articleEl.cloneNode(true);
    clone.querySelectorAll('pre').forEach(p=>p.remove());
    const rawText = clone.innerText || '';
    const cnChars = (rawText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const enWords = rawText.replace(/[\u4e00-\u9fa5]/g, '').trim().split(/\s+/).filter(w=>w).length;
    const totalWords = cnChars + enWords;
    const min = Math.ceil(totalWords / 300);
    wordCountEl.textContent = `共 ${totalWords} 字`;
    readTimeEl.textContent = `阅读约 ${min} 分钟`;
  }

  // ========== TOC文章目录 ==========
  const tocWrap = document.getElementById('tocWrap');
  const tocList = document.getElementById('tocList');
  const tocToggle = document.getElementById('tocToggle');
  const headings = document.querySelectorAll('h1, h2, h3');
  const headingData = [];
  if(tocWrap && tocList && headings.length > 0) {
    headings.forEach((h) => {
      if(!h.id) h.id = h.textContent.trim().replace(/\s+/g,'-').replace(/[^\w\-]/g,'');
      headingData.push({el: h, id: h.id, tag: h.tagName.toLowerCase()});
    });
    headingData.forEach(item => {
      const li = document.createElement('li');
      li.className = `toc-${item.tag}`;
      const a = document.createElement('a');
      a.href = `#${item.id}`;
      a.textContent = item.el.textContent;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        item.el.scrollIntoView({behavior:'smooth'});
        if(window.innerWidth <= 1024) tocWrap.classList.remove('open');
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });
    tocToggle?.addEventListener('click', () => tocWrap.classList.toggle('open'));
    function highlightToc() {
      const scrollY = window.scrollY;
      let currentId = null;
      for(const hd of headingData) {
        if(hd.el.offsetTop - 120 <= scrollY) currentId = hd.id;
        else break;
      }
      document.querySelectorAll('#tocList a').forEach(link => {
        link.classList.remove('active');
        if(currentId && link.getAttribute('href') === `#${currentId}`) link.classList.add('active');
      });
    }
    window.addEventListener('scroll', highlightToc);
    highlightToc();
  }

  // ========== 静态搜索 ==========
  const searchWrap = document.getElementById('searchWrap');
  const searchInput = document.getElementById('searchInput');
  const searchResult = document.getElementById('searchResult');
  const searchToggle = document.getElementById('searchToggle');
  let postIndex = [];
  async function loadSearchIndex() {
    try {
      const res = await fetch('/search-index.json');
      postIndex = await res.json();
    } catch(e) { console.warn("搜索索引加载失败",e); }
  }
  loadSearchIndex();
  function highlightText(text,keyword){
    if(!keyword) return text;
    const reg = new RegExp(`(${keyword})`,"gi");
    return text.replace(reg,`<span class="search-highlight">$1</span>`);
  }
  function doSearch(key) {
    searchResult.innerHTML = "";
    if(!key.trim() || postIndex.length === 0) return;
    const kw = key.trim().toLowerCase();
    const filtered = postIndex.filter(item=>{
      const t = item.title?.toLowerCase() || "";
      const s = item.summary?.toLowerCase() || "";
      const c = item.content?.toLowerCase() || "";
      return t.includes(kw) || s.includes(kw) || c.includes(kw);
    });
    if(filtered.length === 0){
      searchResult.innerHTML = `<li style="padding:0.5rem;">未找到结果</li>`;
      return;
    }
    filtered.forEach(item=>{
      const li = document.createElement('li');
      li.className = "search-result-item";
      const a = document.createElement('a');
      a.href = item.url;
      a.innerHTML = highlightText(item.title, kw);
      a.addEventListener('click',()=>{
        if(window.innerWidth <= 1024) searchWrap.classList.remove('open');
      });
      li.appendChild(a);
      searchResult.appendChild(li);
    })
  }
  searchInput?.addEventListener('input',(e)=> doSearch(e.target.value));
  searchToggle?.addEventListener('click',()=> searchWrap.classList.toggle('open'));

  // ========== 复制文章链接 + Toast ==========
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const copyToast = document.getElementById('copyToast');
  if(copyLinkBtn && copyToast){
    copyLinkBtn.addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText(window.location.href);
        copyToast.textContent = "链接已复制";
      }catch(err){
        copyToast.textContent = "复制失败";
      }
      copyToast.classList.add('show');
      setTimeout(()=>copyToast.classList.remove('show'),1800);
    })
  }

  // ========== 文章字号调节 ==========
  const fontMinus = document.getElementById('fontMinus');
  const fontReset = document.getElementById('fontReset');
  const fontPlus = document.getElementById('fontPlus');
  const articleBox = document.querySelector('article');
  const baseFont = 16;
  let currentSize = Number(localStorage.getItem('articleFontSize')) || baseFont;
  if(fontMinus && fontReset && fontPlus && articleBox) {
    function applyFont(size) {
      articleBox.style.fontSize = `${size}px`;
      localStorage.setItem('articleFontSize', size);
    }
    applyFont(currentSize);
    fontMinus.addEventListener('click', () => {
      currentSize = Math.max(13, currentSize - 1);
      applyFont(currentSize);
    });
    fontPlus.addEventListener('click', () => {
      currentSize = Math.min(24, currentSize + 1);
      applyFont(currentSize);
    });
    fontReset.addEventListener('click', () => {
      currentSize = baseFont;
      applyFont(currentSize);
    });
  }

  // ========== 图片懒加载 ==========
  const lazyImages = document.querySelectorAll('article img:not([loading])');
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    lazyImages.forEach(img => {
      if(!img.dataset.src) {
        img.dataset.src = img.src;
        img.src = '';
      }
      img.classList.add('lazy');
      imgObserver.observe(img);
    });
  } else {
    lazyImages.forEach(img => {
      if(img.dataset.src) img.src = img.dataset.src;
    });
  }

  // ========== 图片灯箱 ==========
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const articleImgs = document.querySelectorAll('article img');
  if(lightbox && lightboxImg) {
    function openLightbox(src) {
      lightboxImg.src = src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    articleImgs.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openLightbox(img.src));
    });
    lightbox.addEventListener('click', (e) => {
      if(e.target === lightbox) closeLightbox();
    });
    lightboxClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  // ========== 上一篇 / 下一篇导航 ==========
  const postNav = document.getElementById('postNav');
  const prevCard = document.getElementById('prevCard');
  const prevLink = document.getElementById('prevLink');
  const prevTitle = document.getElementById('prevTitle');
  const nextCard = document.getElementById('nextCard');
  const nextLink = document.getElementById('nextLink');
  const nextTitle = document.getElementById('nextTitle');
  if(postNav){
    if(typeof prevPost !== 'undefined' && prevPost){
      prevLink.href = prevPost.url;
      prevTitle.textContent = prevPost.title;
    }else{
      prevCard.classList.add('empty');
      prevTitle.textContent = "暂无上一篇";
    }
    if(typeof nextPost !== 'undefined' && nextPost){
      nextLink.href = nextPost.url;
      nextTitle.textContent = nextPost.title;
    }else{
      nextCard.classList.add('empty');
      nextTitle.textContent = "暂无下一篇";
    }
  }
});
