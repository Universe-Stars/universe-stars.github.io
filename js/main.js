document.addEventListener('DOMContentLoaded', async () => {
  const postListEl = document.querySelector('.post-list');
  try {
    const res = await fetch('posts/posts.json');
    const posts = await res.json();
    posts.sort((a,b) => new Date(b.date) - new Date(a.date));

    posts.forEach((post) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="date">${post.date}</span>
        <a href="${post.url}">${post.title}</a>
        <p class="desc">${post.desc}</p>
      `;
      postListEl.appendChild(li);
    });

    // IntersectionObserver：元素进入视口触发动画
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      })
    }, { threshold: 0.1 });

    // 监听所有卡片
    document.querySelectorAll('.post-list li').forEach(item => {
      observer.observe(item);
    })

  } catch (err) {
    postListEl.innerHTML = "<li>暂时没有文章</li>";
    console.error("加载文章失败", err);
  }
});
