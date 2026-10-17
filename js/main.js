// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) target.scrollIntoView({behavior: 'smooth'});
    });
});

// 卡片悬浮动画
document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('mouseenter', ()=>{
        card.style.transform = "translateY(-4px)";
        card.style.boxShadow = "0 8px 24px rgba(59, 130, 246, 0.2)";
    })
    card.addEventListener('mouseleave', ()=>{
        card.style.transform = "translateY(0)";
        card.style.boxShadow = "none";
    })
})
