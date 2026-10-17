# Static Blog Frontend
纯静态博客前端，原生JS+CSS，无前端框架，可部署在 Nginx / Vercel / Github Pages。

## ✨ 功能清单
- ViewTransition 页面共享元素动画
- 点击涟漪主题切换，localStorage持久主题，系统主题自动适配，FOUC防护
- 页面骨架屏，加载占位+超时兜底
- 顶部阅读进度条
- 右下角环形阅读进度回到顶部按钮 + 直达底部按钮
- 代码块一键复制、代码语言标签展示
- 文章字数统计 + 预估阅读时间（自动排除代码块）
- 自动生成文章目录TOC（PC侧边 / 移动端底部抽屉，滚动高亮当前标题）
- 文章图片懒加载 + 图片灯箱全屏预览 + 暗黑模式图片亮度滤镜
- 文章字号缩放，本地持久存储
- 静态前端全文搜索（search-index.json，关键词高亮）
- 复制文章链接 + Toast提示
- 文章底部上一篇、下一篇导航卡片
- 移动端汉堡导航菜单
- Navigation API 前进后退页面转场

## 部署
直接上传全部文件到静态服务器即可。

## 开发
- assets/css/main.css 全局样式
- assets/js/main.js 全局JS（所有页面加载）
- assets/js/post.js 仅文章页面加载
- search-index.json 搜索索引，需要脚本自动生成

## 待扩展
1. Node脚本批量读取Markdown生成search-index.json
2. 资源压缩（cssnano、esbuild）
3. 图片自动WebP
