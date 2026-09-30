/**
 * Authentication & Role Management Controller
 * Supports: Citizen, Nagar Nigam Ward Officer, Sweeper/Sanitation Worker, Municipal Admin
 */

const Auth = {
  init() {
    this.bindEvents();
    this.renderCurrentUser();
  },

  bindEvents() {
    // Login form submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Register form submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Role switcher dropdown
    const roleSwitcher = document.getElementById('quickRoleSwitcher');
    if (roleSwitcher) {
      roleSwitcher.addEventListener('change', (e) => {
        this.switchRole(e.target.value);
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }

    // Listen for auth changes to re-render UI
    window.addEventListener('auth:change', (e) => {
      this.renderCurrentUser(e.detail);
      if (window.app) {
        window.app.applyRolePermissions();
      }
    });
  },

  handleLogin() {
    const emailOrPhone = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = window.appStore.getUsers();

    const user = users.find(u => 
      (u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone === emailOrPhone) &&
      u.password === password
    );

    if (user) {
      window.appStore.setCurrentUser(user);
      this.showToast(`Welcome back, ${user.name}!`, 'success');
      this.closeAuthModal();
    } else {
      this.showToast('Invalid credentials. Please check your email/mobile or password.', 'error');
    }
  },

  handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const ward = document.getElementById('regWard').value;
    const address = document.getElementById('regAddress').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!name || !phone || !email || !ward || !password) {
      this.showToast('Please fill all mandatory fields.', 'warning');
      return;
    }

    const users = window.appStore.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone)) {
      this.showToast('A user with this email or mobile already exists.', 'error');
      return;
    }

    const newUser = {
      id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
      name,
      phone,
      email,
      role: 'citizen',
      ward,
      address,
      password
    };

    window.appStore.saveUser(newUser);
    window.appStore.setCurrentUser(newUser);
    this.showToast(`Registration successful! Welcome to Swachh Nagar, ${newUser.name}.`, 'success');
    this.closeAuthModal();
  },

  switchRole(roleType) {
    const users = window.appStore.getUsers();
    let targetUser = null;

    if (roleType === 'citizen') {
      targetUser = users.find(u => u.role === 'citizen') || users[0];
    } else if (roleType === 'officer') {
      targetUser = users.find(u => u.role === 'officer');
    } else if (roleType === 'sweeper') {
      targetUser = users.find(u => u.role === 'sweeper');
    } else if (roleType === 'admin') {
      targetUser = users.find(u => u.role === 'admin');
    }

    if (targetUser) {
      window.appStore.setCurrentUser(targetUser);
      this.showToast(`Switched active view to: ${targetUser.name} (${targetUser.role.toUpperCase()})`, 'info');
    }
  },

  handleLogout() {
    window.appStore.logout();
    this.showToast('Logged out successfully.', 'info');
  },

  renderCurrentUser(user = window.appStore.getCurrentUser()) {
    const userBadge = document.getElementById('userProfileBadge');
    const userNameEl = document.getElementById('navUserName');
    const userRoleEl = document.getElementById('navUserRole');
    const roleSwitcher = document.getElementById('quickRoleSwitcher');
    const authActions = document.getElementById('authActionButtons');
    const userMenu = document.getElementById('userMenuWrapper');

    if (user) {
      if (userNameEl) userNameEl.textContent = user.name;
      if (userRoleEl) {
        const roleLabels = {
          citizen: 'Citizen Portal',
          officer: 'Nagar Nigam Ward Officer',
          sweeper: 'Sanitation Worker / Sweeper',
          admin: 'Municipal Commissioner (Admin)'
        };
        userRoleEl.textContent = roleLabels[user.role] || user.role;
      }
      if (roleSwitcher) roleSwitcher.value = user.role;
      if (authActions) authActions.classList.add('hidden');
      if (userMenu) userMenu.classList.remove('hidden');
    } else {
      if (authActions) authActions.classList.remove('hidden');
      if (userMenu) userMenu.classList.add('hidden');
    }
  },

  openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.switchAuthTab(tab);
  },

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  switchAuthTab(tab) {
    const loginTabBtn = document.getElementById('tabLoginBtn');
    const registerTabBtn = document.getElementById('tabRegisterBtn');
    const loginContent = document.getElementById('loginTabContent');
    const regContent = document.getElementById('registerTabContent');

    if (tab === 'login') {
      loginTabBtn.className = 'flex-1 py-3 text-sm font-semibold border-b-2 border-emerald-600 text-emerald-600';
      registerTabBtn.className = 'flex-1 py-3 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700';
      loginContent.classList.remove('hidden');
      regContent.classList.add('hidden');
    } else {
      registerTabBtn.className = 'flex-1 py-3 text-sm font-semibold border-b-2 border-emerald-600 text-emerald-600';
      loginTabBtn.className = 'flex-1 py-3 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700';
      regContent.classList.remove('hidden');
      loginContent.classList.add('hidden');
    }
  },

  showToast(message, type = 'info') {
    if (window.toastNotification) {
      window.toastNotification(message, type);
    } else {
      alert(message);
    }
  }
};

window.Auth = Auth;
