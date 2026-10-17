// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
  const postListEl = document.querySelector('.post-list');
  try {
    // 读取posts目录下的文章元数据
    const res = await fetch('posts/posts.json');
    const posts = await res.json();

    // 按日期倒序（新文章放最上面）
    posts.sort((a,b) => new Date(b.date) - new Date(a.date));

    posts.forEach(post => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="date">${post.date}</span>
        <a href="${post.url}">${post.title}</a>
        <p class="desc">${post.desc}</p>
      `;
      postListEl.appendChild(li);
    });
  } catch (err) {
    postListEl.innerHTML = "<li>暂时没有文章</li>";
    console.error("加载文章失败", err);
  }
});
