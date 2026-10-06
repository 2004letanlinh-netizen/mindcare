export const libraryPage = {
  render() {
    return `
      <section class="page-heading reveal"><div><p class="eyebrow">GÓC BÌNH YÊN</p><h1>Một chút dịu dàng cho hôm nay.</h1><p class="muted">Những thực hành nhỏ để bạn thư giãn và tìm hiểu về sức khỏe tinh thần.</p></div><span class="date-stamp">THƯ VIỆN<br><strong>01</strong></span></section>
      <section class="library-grid"><article class="panel practice-panel reveal"><div class="practice-art breath-art"><span class="breath-ring" id="breath-ring"></span><span class="breath-label" id="breath-label">Sẵn sàng?</span></div><div class="practice-copy"><p class="eyebrow">THỰC HÀNH · 2 PHÚT</p><h2>Thở chậm, trở về hiện tại</h2><p class="muted">Hít vào nhẹ nhàng trong 4 nhịp, thở ra trong 6 nhịp. Dừng lại nếu bạn cảm thấy không thoải mái.</p><button class="button button-dark" id="breath-button" type="button">Bắt đầu bài thở</button></div></article><article class="panel knowledge-panel reveal"><p class="eyebrow">TÌM HIỂU</p><h2>Sức khỏe tinh thần cũng cần được chăm sóc.</h2><p class="muted">Cảm xúc có thể thay đổi theo thời gian. Ghi nhận điều mình trải qua là một khởi đầu hữu ích, nhưng kết quả tự đánh giá không thay thế chẩn đoán của chuyên gia.</p><a class="text-link" href="https://www.who.int/health-topics/mental-health" target="_blank" rel="noreferrer">Đọc thông tin từ WHO <span aria-hidden="true">↗</span></a></article><article class="panel audio-panel reveal"><span class="audio-icon" aria-hidden="true">♫</span><div><p class="eyebrow">THƯ VIỆN ÂM THANH</p><h2>Âm thanh thư giãn</h2><p class="muted">Thêm tệp nhạc thiền, tiếng mưa hoặc sóng biển vào thư mục <code>public/audio</code> để mở rộng thư viện.</p></div><p class="form-message">Chưa có tệp âm thanh. Hãy chỉ sử dụng nội dung bạn có quyền phân phối.</p></article></section>`;
  },
  mount(outlet) {
    const button = outlet.querySelector('#breath-button');
    const label = outlet.querySelector('#breath-label');
    const ring = outlet.querySelector('#breath-ring');
    let timer;
    let phase = 0;
    const phases = [{ text: 'Hít vào', duration: 4000 }, { text: 'Thở ra', duration: 6000 }];
    const next = () => {
      const current = phases[phase % phases.length];
      label.textContent = current.text;
      ring.classList.toggle('is-inhaling', phase % phases.length === 0);
      phase += 1;
      timer = window.setTimeout(next, current.duration);
    };
    button.addEventListener('click', () => {
      if (timer) {
        window.clearTimeout(timer);
        timer = undefined;
        label.textContent = 'Đã tạm dừng';
        ring.classList.remove('is-inhaling');
        button.textContent = 'Tiếp tục bài thở';
      } else {
        button.textContent = 'Tạm dừng';
        next();
      }
    });
    return () => window.clearTimeout(timer);
  }
};
