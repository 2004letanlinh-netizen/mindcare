import { apiRequest } from '../api.js';

export const accountPage = {
  render() {
    return `
      <section class="page-heading reveal"><div><p class="eyebrow">TÀI KHOẢN MINDCARE</p><h1>Bắt đầu từ sự riêng tư.</h1><p class="muted">Tài khoản giúp lưu check-in của bạn và gửi bài viết đến cộng đồng.</p></div></section>
      <section class="panel account-panel reveal"><div id="auth-section"><div class="auth-tabs" role="tablist"><button class="auth-tab is-selected" type="button" data-mode="login">Đăng nhập</button><button class="auth-tab" type="button" data-mode="signup">Tạo tài khoản</button></div><form id="auth-form" class="stack-form"><label for="display-name" id="display-name-label" hidden>Tên hiển thị</label><input id="display-name" name="displayName" maxlength="40" placeholder="Tên hiển thị" hidden><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required><label for="password">Mật khẩu</label><input id="password" name="password" type="password" minlength="8" autocomplete="current-password" required><button class="button button-dark" type="submit" id="auth-submit">Đăng nhập <span aria-hidden="true">→</span></button><p class="form-message" id="auth-message" role="status"></p></form></div><div id="profile-section" hidden><p class="eyebrow">HỒ SƠ CỦA BẠN</p><h2 id="profile-email"></h2><form id="profile-form" class="stack-form"><label for="profile-display-name">Tên hiển thị</label><input id="profile-display-name" name="displayName" maxlength="40" required><button class="button button-dark" type="submit">Lưu thay đổi <span aria-hidden="true">→</span></button><p class="form-message" id="profile-message" role="status"></p></form><p class="muted">Tên hiển thị không được đính kèm vào bài viết ẩn danh.</p><button class="text-link signout-button" id="signout-button" type="button">Đăng xuất <span aria-hidden="true">↗</span></button></div></section>`;
  },
  mount(outlet) {
    const form = outlet.querySelector('#auth-form');
    const message = outlet.querySelector('#auth-message');
    const nameInput = outlet.querySelector('#display-name');
    const nameLabel = outlet.querySelector('#display-name-label');
    const submit = outlet.querySelector('#auth-submit');
    const signOut = outlet.querySelector('#signout-button');
    const authSection = outlet.querySelector('#auth-section');
    const profileSection = outlet.querySelector('#profile-section');
    const profileForm = outlet.querySelector('#profile-form');
    const profileMessage = outlet.querySelector('#profile-message');
    const showProfile = async () => {
      authSection.hidden = true;
      profileSection.hidden = false;
      try {
        const { user, profile } = await apiRequest('/auth/me');
        outlet.querySelector('#profile-email').textContent = user.email || 'Tài khoản MindCare';
        outlet.querySelector('#profile-display-name').value = profile.display_name;
      } catch (error) {
        profileMessage.textContent = error.message;
      }
    };
    let mode = 'login';
    const setMode = (nextMode) => {
      mode = nextMode;
      const signup = mode === 'signup';
      nameInput.hidden = nameLabel.hidden = !signup;
      nameInput.required = signup;
      outlet.querySelectorAll('[data-mode]').forEach((tab) => tab.classList.toggle('is-selected', tab.dataset.mode === mode));
      submit.innerHTML = signup ? 'Tạo tài khoản <span aria-hidden="true">→</span>' : 'Đăng nhập <span aria-hidden="true">→</span>';
      outlet.querySelector('#password').autocomplete = signup ? 'new-password' : 'current-password';
    };
    outlet.querySelectorAll('[data-mode]').forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
    if (localStorage.getItem('mindcare_access_token')) showProfile();
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const values = new FormData(form);
      try {
        const result = await apiRequest(`/auth/${mode}`, {
          method: 'POST',
          body: JSON.stringify({ email: values.get('email'), password: values.get('password'), displayName: values.get('displayName') })
        });
        if (result.session?.access_token) {
          localStorage.setItem('mindcare_access_token', result.session.access_token);
          await showProfile();
        } else {
          message.textContent = 'Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.';
        }
      } catch (error) {
        message.textContent = error.message;
      }
    });
    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const values = new FormData(profileForm);
      try {
        await apiRequest('/auth/me', { method: 'PATCH', body: JSON.stringify({ displayName: values.get('displayName') }) });
        profileMessage.textContent = 'Tên hiển thị đã được cập nhật.';
      } catch (error) {
        profileMessage.textContent = error.message;
      }
    });
    signOut.addEventListener('click', () => {
      localStorage.removeItem('mindcare_access_token');
      profileSection.hidden = true;
      authSection.hidden = false;
      message.textContent = 'Bạn đã đăng xuất.';
    });
  }
};
