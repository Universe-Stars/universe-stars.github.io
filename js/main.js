document.addEventListener('DOMContentLoaded', async () => {
  const postListEl = document.querySelector('.post-list');
  try {
    const res = await fetch('posts/posts.json');
    const posts = await res.json();
    posts.sort((a,b) => new Date(b.date) - new Date(a.date));

    posts.forEach((post, index) => {
      const li = document.createElement('li');
      li.style.opacity = "0";
      li.style.transform = "translateY(16px)";
      li.style.transition = `all 0.45s ease ${index * 0.12}s`;
      li.innerHTML = `
        <span class="date">${post.date}</span>
        <a href="${post.url}">${post.title}</a>
        <p class="desc">${post.desc}</p>
      `;
      postListEl.appendChild(li);
      setTimeout(()=>{
        li.style.opacity = "1";
        li.style.transform = "translateY(0)";
      }, 50)
    });
  } catch (err) {
    postListEl.innerHTML = "<li>暂时没有文章</li>";
    console.error("加载文章失败", err);
  }
});
