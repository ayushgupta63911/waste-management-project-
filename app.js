/**
 * Main Application Controller for Swachh Nagar
 * Orchestrates navigation, views, role permissions, and global toast notifications.
 */

class App {
  constructor() {
    this.currentView = 'report';
  }

  init() {
    // Setup global toast
    window.toastNotification = (msg, type = 'info') => this.showToast(msg, type);

    // Initialize sub-modules
    if (window.Auth) window.Auth.init();
    if (window.Complaints) window.Complaints.init();
    if (window.Tracking) window.Tracking.init();
    if (window.Admin) window.Admin.init();
    if (window.Awareness) window.Awareness.init();

    this.bindNavigation();
    this.applyRolePermissions();

    // Default to report view
    this.navigateTo('report');

    // Create Lucide icons
    if (window.lucide) window.lucide.createIcons();
  }

  bindNavigation() {
    document.querySelectorAll('[data-view-target]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.dataset.viewTarget;
        this.navigateTo(target);

        // Close mobile drawer if open
        const mobileNav = document.getElementById('mobileNavDrawer');
        if (mobileNav) mobileNav.classList.add('hidden');
      });
    });

    // Mobile menu toggle
    const toggleBtn = document.getElementById('mobileMenuToggleBtn');
    const drawer = document.getElementById('mobileNavDrawer');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.toggle('hidden');
      });
    }

    // Role switcher triggers re-evaluation of current view
    window.addEventListener('auth:change', () => {
      this.applyRolePermissions();
    });
  }

  navigateTo(viewId) {
    this.currentView = viewId;

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.add('hidden');
    });

    // Show target section
    const activeSection = document.getElementById(`view-${viewId}`);
    if (activeSection) {
      activeSection.classList.remove('hidden');
    }

    // Update nav links styling
    document.querySelectorAll('[data-view-target]').forEach(link => {
      if (link.dataset.viewTarget === viewId) {
        link.classList.add('text-emerald-600', 'font-bold', 'border-b-2', 'border-emerald-600');
        link.classList.remove('text-slate-600', 'font-medium', 'border-transparent');
      } else {
        link.classList.remove('text-emerald-600', 'font-bold', 'border-b-2', 'border-emerald-600');
        link.classList.add('text-slate-600', 'font-medium', 'border-transparent');
      }
    });

    // If navigating to Admin, ensure Leaflet map adjusts size
    if (viewId === 'admin' && window.Admin && window.Admin.map) {
      setTimeout(() => {
        window.Admin.map.invalidateSize();
      }, 200);
    }

    // If navigating to Officer Desk, render table
    if (viewId === 'officer' && window.Complaints) {
      window.Complaints.renderOfficerComplaintsTable();
    }

    // If navigating to Sweeper Mode, render tasks
    if (viewId === 'sweeper' && window.Complaints) {
      window.Complaints.renderSweeperTasks();
    }

    // Re-create icons
    if (window.lucide) window.lucide.createIcons();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  applyRolePermissions() {
    const user = window.appStore.getCurrentUser();
    const role = user ? user.role : 'citizen';

    // Update role badges or highlights
    const roleNotice = document.getElementById('roleContextBanner');
    if (roleNotice) {
      const descriptions = {
        citizen: '👤 Active View: <strong>Citizen Mode</strong>. You can report waste issues, track complaints in real-time, rate services, and learn segregation.',
        officer: '🏢 Active View: <strong>Nagar Nigam Ward Officer Desk</strong>. You can review complaints, issue instructions, and dispatch sanitation sweepers.',
        sweeper: '🧹 Active View: <strong>Sweeper / Sanitation Worker Mode</strong>. View assigned pickup tickets, see officer instructions, and upload proof of cleaning.',
        admin: '👑 Active View: <strong>Municipal Commissioner (Admin)</strong>. Full system visibility: GIS waste heatmap, workforce leaderboard, and city analytics.'
      };
      roleNotice.innerHTML = descriptions[role] || descriptions.citizen;
    }

    // If current role is sweeper, guide to sweeper view
    if (role === 'sweeper' && this.currentView === 'report') {
      this.navigateTo('sweeper');
    } else if (role === 'officer' && this.currentView === 'report') {
      this.navigateTo('officer');
    } else if (role === 'admin' && this.currentView === 'report') {
      this.navigateTo('admin');
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const borderColors = {
      success: 'border-emerald-500 bg-emerald-950 text-emerald-100',
      error: 'border-rose-500 bg-rose-950 text-rose-100',
      warning: 'border-amber-500 bg-amber-950 text-amber-100',
      info: 'border-sky-500 bg-slate-900 text-slate-100'
    };

    const icons = {
      success: 'check-circle-2',
      error: 'alert-triangle',
      warning: 'alert-circle',
      info: 'info'
    };

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-xl text-xs font-medium toast-slide-in pointer-events-auto ${borderColors[type] || borderColors.info}`;
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 flex-shrink-0"></i>
      <span class="flex-1">${message}</span>
      <button class="text-slate-400 hover:text-white" onclick="this.parentElement.remove()">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
