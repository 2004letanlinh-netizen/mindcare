import { apiRequest, escapeHtml } from '../api.js';

export const communityPage = {
  render() {
    return `
      <section class="page-heading reveal"><div><p class="eyebrow">LẮNG NGHE VÀ ĐỒNG CẢM</p><h1>Cộng đồng MindCare</h1><p class="muted">Một nơi để chia sẻ, không phán xét. Bài viết mới sẽ được kiểm duyệt trước khi xuất hiện.</p></div><span class="date-stamp">AN TOÀN<br><strong>♡</strong></span></section>
      <div class="community-layout">
        <section class="panel compose-panel reveal">
          <p class="eyebrow">BẮT ĐẦU MỘT CUỘC TRÒ CHUYỆN</p><h2>Điều gì đang ở trong tâm trí bạn?</h2>
          <form id="post-form" class="stack-form">
            <label for="post-topic">Chủ đề</label><select id="post-topic" name="topic"><option value="lo-au">Lo âu</option><option value="tam-trang">Tâm trạng</option><option value="mat-ngu">Mất ngủ</option><option value="hoc-duong">Học đường</option><option value="khac">Khác</option></select>
            <label for="post-content">Nội dung</label><textarea id="post-content" name="content" rows="5" minlength="3" maxlength="3000" placeholder="Chia sẻ theo cách bạn thấy thoải mái…" required></textarea>
            <label class="toggle-row"><input type="checkbox" name="isAnonymous" checked /><span>Đăng ẩn danh</span><small>Không lưu UID trên bài viết</small></label>
            <button class="button button-dark" type="submit">Gửi để kiểm duyệt <span aria-hidden="true">→</span></button><p class="form-message" id="post-message" role="status"></p>
          </form>
        </section>
        <section class="community-feed reveal"><div class="feed-heading"><div><p class="eyebrow">BẢNG TIN</p><h2>Chia sẻ gần đây</h2></div><span class="live-dot">ĐANG LẮNG NGHE</span></div><div id="post-list" class="post-list"><p class="muted">Đang tải bài viết…</p></div></section>
      </div>`;
  },
  mount(outlet) {
    const list = outlet.querySelector('#post-list');
    const message = outlet.querySelector('#post-message');
    const loadPosts = async () => {
      try {
        const { posts } = await apiRequest('/posts');
        list.innerHTML = posts.length ? posts.map((post) => `
          <article class="post-item"><div class="post-meta"><span class="post-author">${post.is_anonymous ? 'Ẩn danh' : escapeHtml(post.profiles?.display_name || 'Thành viên')}</span><span class="topic-tag">#${escapeHtml(post.topic)}</span></div><p>${escapeHtml(post.content)}</p><small>${new Date(post.created_at).toLocaleDateString('vi-VN')}</small></article>`).join('') : '<p class="muted">Chưa có bài viết được duyệt. Bạn có thể là người mở đầu.</p>';
      } catch (error) {
        list.innerHTML = `<p class="muted">${escapeHtml(error.message)}<br>Thêm thông tin Supabase vào .env để tải bài viết.</p>`;
      }
    };
    loadPosts();
    const form = outlet.querySelector('#post-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      message.textContent = 'Đang gửi bài viết…';
      try {
        await apiRequest('/posts', {
          method: 'POST',
          body: JSON.stringify({ content: values.get('content'), topic: values.get('topic'), isAnonymous: values.has('isAnonymous') })
        });
        form.reset();
        form.querySelector('[name="isAnonymous"]').checked = true;
        message.textContent = 'Bài viết đã gửi và đang chờ kiểm duyệt.';
      } catch (error) {
        message.textContent = error.message === 'Sign in is required.' ? 'Đăng nhập để gửi bài viết.' : error.message;
      } finally {
        button.disabled = false;
      }
    });
  }
};
