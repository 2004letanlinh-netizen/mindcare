import { apiRequest } from '../api.js';

export const checkInPage = {
  render() {
    return `
      <section class="page-heading reveal"><div><p class="eyebrow">NHẬT KÝ CỦA RIÊNG BẠN</p><h1>Dành một phút cho chính mình.</h1><p class="muted">Check-in giúp bạn quan sát cảm xúc và giấc ngủ theo thời gian, không nhằm chẩn đoán.</p></div><span class="date-stamp">MỖI NGÀY<br><strong>01 phút</strong></span></section>
      <section class="panel checkin-panel reveal"><form id="checkin-form" class="stack-form"><fieldset><legend>Hôm nay tâm trạng của bạn ở mức nào?</legend><div class="rating-row">${['Rất khó khăn', 'Khó khăn', 'Bình thường', 'Khá ổn', 'Tốt'].map((label, index) => `<label><input type="radio" name="moodScore" value="${index + 1}" ${index === 2 ? 'required' : ''}><span>${index + 1}</span><small>${label}</small></label>`).join('')}</div></fieldset><label for="sleep-hours">Bạn ngủ khoảng bao nhiêu giờ?</label><input id="sleep-hours" type="number" name="sleepHours" min="0" max="24" step="0.5" placeholder="Ví dụ: 7.5"><label for="sleep-quality">Chất lượng giấc ngủ tuần này</label><select id="sleep-quality" name="sleepQuality"><option value="">Chưa đánh giá</option><option value="1">1 · Rất kém</option><option value="2">2 · Kém</option><option value="3">3 · Bình thường</option><option value="4">4 · Tốt</option><option value="5">5 · Rất tốt</option></select><label for="checkin-note">Ghi chú riêng (không bắt buộc)</label><textarea id="checkin-note" name="note" rows="3" maxlength="500" placeholder="Có điều gì bạn muốn nhớ về hôm nay không?"></textarea><button class="button button-dark" type="submit">Lưu check-in <span aria-hidden="true">→</span></button><p id="checkin-message" class="form-message" role="status"></p></form></section>`;
  },
  mount(outlet) {
    const form = outlet.querySelector('#checkin-form');
    const message = outlet.querySelector('#checkin-message');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const body = {
        moodScore: Number(values.get('moodScore')),
        sleepHours: values.get('sleepHours') ? Number(values.get('sleepHours')) : undefined,
        sleepQuality: values.get('sleepQuality') ? Number(values.get('sleepQuality')) : undefined,
        note: values.get('note')
      };
      try {
        await apiRequest('/check-ins', { method: 'POST', body: JSON.stringify(body) });
        message.textContent = 'Check-in đã được lưu riêng tư.';
      } catch (error) {
        message.textContent = error.message === 'Sign in is required.' ? 'Đăng nhập để lưu check-in riêng tư.' : error.message;
      }
    });
  }
};
