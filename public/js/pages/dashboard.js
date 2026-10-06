export const dashboardPage = {
  render() {
    return `
      <section class="page-heading reveal">
        <div><p class="eyebrow">THỨ HAI · MỘT KHỞI ĐẦU NHẸ NHÀNG</p><h1>Chào bạn, hôm nay bạn thế nào?</h1><p class="muted">Không cần phải ổn ngay. Mình bắt đầu từ điều nhỏ nhất nhé.</p></div>
        <span class="date-stamp">HÔM NAY<br><strong>${new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</strong></span>
      </section>
      <section class="dashboard-grid">
        <article class="panel check-card reveal">
          <div class="panel-heading"><div><p class="eyebrow">CHECK-IN NHANH</p><h2>Chọn cảm xúc gần nhất</h2></div><span class="panel-icon">✳</span></div>
          <div class="mood-options" role="group" aria-label="Chọn mức cảm xúc">
            <button type="button" data-mood="1" aria-label="Rất tệ"><span>☁</span><small>Rất tệ</small></button>
            <button type="button" data-mood="2" aria-label="Không ổn"><span>◔</span><small>Không ổn</small></button>
            <button type="button" data-mood="3" aria-label="Bình thường"><span>◌</span><small>Bình thường</small></button>
            <button type="button" data-mood="4" aria-label="Khá ổn"><span>◡</span><small>Khá ổn</small></button>
            <button type="button" data-mood="5" aria-label="Tốt"><span>☼</span><small>Tốt</small></button>
          </div>
          <p class="form-message" id="mood-message" role="status">Một lần dừng lại cũng là đang chăm sóc mình.</p>
          <a class="text-link" href="#/check-in">Ghi lại chi tiết <span aria-hidden="true">→</span></a>
        </article>
        <article class="panel breathing-card reveal">
          <div class="breathing-orbit" aria-hidden="true"><span></span><i></i></div>
          <div><p class="eyebrow">DÀNH CHO BẠN</p><h2>Cho tâm trí một nhịp nghỉ</h2><p class="muted">Bài thở ngắn 2 phút, theo nhịp của riêng bạn.</p><a class="button button-dark" href="#/library">Bắt đầu thư giãn <span aria-hidden="true">↗</span></a></div>
        </article>
        <article class="panel community-card reveal">
          <div class="panel-heading"><div><p class="eyebrow">MỘT GÓC ĐỒNG CẢM</p><h2>Không phải chỉ mình bạn</h2></div><span class="community-symbol" aria-hidden="true">♡</span></div>
          <p class="muted">Chia sẻ điều bạn đang trải qua trong một không gian tôn trọng và được kiểm duyệt.</p>
          <a class="text-link" href="#/community">Ghé cộng đồng <span aria-hidden="true">→</span></a>
        </article>
        <aside class="support-note reveal"><span class="support-line"></span><p>“Bạn không cần giải quyết cả cuộc đời trong một ngày.”</p><small>Một lời nhắc dịu dàng từ MindCare</small></aside>
      </section>`;
  },
  mount(outlet) {
    const buttons = [...outlet.querySelectorAll('[data-mood]')];
    const message = outlet.querySelector('#mood-message');
    buttons.forEach((button) => button.addEventListener('click', async () => {
      buttons.forEach((item) => item.classList.toggle('selected', item === button));
      message.textContent = 'Đang lưu check-in…';
      try {
        const { apiRequest } = await import('../api.js');
        await apiRequest('/check-ins', { method: 'POST', body: JSON.stringify({ moodScore: Number(button.dataset.mood) }) });
        message.textContent = 'Đã lưu riêng tư vào nhật ký hôm nay.';
      } catch (error) {
        message.textContent = error.message === 'Sign in is required.'
          ? 'Đăng nhập để lưu check-in riêng tư của bạn.'
          : error.message;
      }
    }));
  }
};
