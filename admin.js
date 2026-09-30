/**
 * Admin & Nagar Nigam Operations Dashboard Controller
 * Includes GIS Leaflet Map, Chart.js Visualizations, KPI counters, and worker leaderboard.
 */

const Admin = {
  map: null,
  markers: [],
  statusChart: null,
  wardChart: null,

  init() {
    this.renderKPIs();
    this.initMap();
    this.initCharts();
    this.renderSweeperTable();
    this.renderActivityLogs();
    this.bindEvents();

    window.addEventListener('complaints:update', () => {
      this.renderKPIs();
      this.updateMapMarkers();
      this.updateCharts();
      this.renderSweeperTable();
      this.renderActivityLogs();
    });
  },

  bindEvents() {
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportComplaintsCSV();
      });
    }

    const resetBtn = document.getElementById('btnResetDemoData');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all demo complaints and workers to default state?')) {
          window.appStore.resetDemoData();
        }
      });
    }
  },

  renderKPIs() {
    const complaints = window.appStore.getComplaints();
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const inProgress = complaints.filter(c => c.status === 'Sweeper Dispatched' || c.status === 'In Progress').length;
    const pending = complaints.filter(c => c.status === 'Pending Verification' || c.status === 'Nagar Nigam Verified').length;

    // Calculate ratings
    const rated = complaints.filter(c => c.citizenRating > 0);
    const avgRating = rated.length > 0 ? (rated.reduce((acc, c) => acc + c.citizenRating, 0) / rated.length).toFixed(1) : '4.8';

    // Update DOM
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('kpiTotalComplaints', total);
    setVal('kpiResolvedComplaints', resolved);
    setVal('kpiInProgressComplaints', inProgress);
    setVal('kpiPendingComplaints', pending);
    setVal('kpiSatisfactionRating', `${avgRating} ★`);
    setVal('kpiWasteTons', `${(resolved * 1.4 + 2.5).toFixed(1)} MT`);
  },

  initMap() {
    const mapContainer = document.getElementById('adminGisMap');
    if (!mapContainer || this.map || typeof L === 'undefined') return;

    // Centered around city coordinates (e.g. Lucknow / Central Nagar Nigam)
    this.map = L.map('adminGisMap', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([26.8524, 80.9421], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Nagar Nigam Swachh GIS'
    }).addTo(this.map);

    this.updateMapMarkers();
  },

  updateMapMarkers() {
    if (!this.map || typeof L === 'undefined') return;

    // Clear old markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    const complaints = window.appStore.getComplaints();

    complaints.forEach(c => {
      const isResolved = c.status === 'Resolved';
      const isDispatched = c.status === 'Sweeper Dispatched' || c.status === 'In Progress';
      
      const pinColor = isResolved ? '#10b981' : (isDispatched ? '#0284c7' : '#ef4444');
      const iconHtml = `
        <div style="background-color: ${pinColor}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            ${isResolved ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>'}
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const marker = L.marker([c.lat || 26.8524, c.lng || 80.9421], { icon: customIcon }).addTo(this.map);

      const popupContent = `
        <div style="min-width: 200px; font-family: sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="font-size: 12px; color: #0f172a;">${c.id}</strong>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 9999px; background: ${pinColor}20; color: ${pinColor}; font-weight: bold;">${c.status}</span>
          </div>
          <img src="${c.photoBefore}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
          <p style="font-size: 11px; font-weight: 600; margin: 0 0 3px 0; color: #1e293b;">${c.wasteType}</p>
          <p style="font-size: 10px; margin: 0 0 6px 0; color: #64748b;">${c.address}</p>
          <button onclick="Tracking.searchAndDisplayComplaint('${c.id}'); window.app.navigateTo('tracking');" 
            style="width: 100%; background: #10b981; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
            Track Full Ticket
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      this.markers.push(marker);
    });
  },

  initCharts() {
    if (typeof Chart === 'undefined') return;

    // Status Doughnut Chart
    const statusCtx = document.getElementById('statusDoughnutChart');
    if (statusCtx && !this.statusChart) {
      this.statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: this.getStatusChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          },
          cutout: '70%'
        }
      });
    }

    // Ward Bar Chart
    const wardCtx = document.getElementById('wardBarChart');
    if (wardCtx && !this.wardChart) {
      this.wardChart = new Chart(wardCtx, {
        type: 'bar',
        data: this.getWardChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
          },
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }
  },

  getStatusChartData() {
    const complaints = window.appStore.getComplaints();
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const inProgress = complaints.filter(c => c.status === 'Sweeper Dispatched' || c.status === 'In Progress').length;
    const pending = complaints.filter(c => c.status === 'Pending Verification' || c.status === 'Nagar Nigam Verified').length;

    return {
      labels: ['Resolved & Cleaned', 'Sweeper Dispatched', 'Pending Verification'],
      datasets: [{
        data: [resolved, inProgress, pending],
        backgroundColor: ['#10b981', '#0284c7', '#ef4444'],
        borderWidth: 0
      }]
    };
  },

  getWardChartData() {
    const wards = window.appStore.getWards();
    const complaints = window.appStore.getComplaints();

    const labels = wards.map(w => w.name.split('/')[0].replace('Ward ', 'W'));
    const resolvedData = wards.map(w => complaints.filter(c => c.wardId === w.id && c.status === 'Resolved').length);
    const pendingData = wards.map(w => complaints.filter(c => c.wardId === w.id && c.status !== 'Resolved').length);

    return {
      labels,
      datasets: [
        {
          label: 'Resolved',
          data: resolvedData,
          backgroundColor: '#10b981',
          borderRadius: 4
        },
        {
          label: 'Active / Pending',
          data: pendingData,
          backgroundColor: '#f59e0b',
          borderRadius: 4
        }
      ]
    };
  },

  updateCharts() {
    if (this.statusChart) {
      this.statusChart.data = this.getStatusChartData();
      this.statusChart.update();
    }
    if (this.wardChart) {
      this.wardChart.data = this.getWardChartData();
      this.wardChart.update();
    }
  },

  renderSweeperTable() {
    const tbody = document.getElementById('adminSweeperTableBody');
    if (!tbody) return;

    const sweepers = window.appStore.getSweepers();
    const complaints = window.appStore.getComplaints();

    tbody.innerHTML = sweepers.map(s => {
      const activeTasks = complaints.filter(c => c.assignedSweeperId === s.id && c.status !== 'Resolved').length;
      return `
        <tr class="hover:bg-slate-50/70 border-b border-slate-100 text-xs">
          <td class="py-3 px-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                ${s.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p class="font-bold text-slate-800">${s.name}</p>
                <p class="text-[11px] text-slate-400">${s.phone}</p>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 font-medium text-slate-700">${s.wardName.split('/')[0]}</td>
          <td class="py-3 px-4 text-slate-600">${s.vehicle}</td>
          <td class="py-3 px-4 text-center">
            ${activeTasks > 0 ? 
              `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">${activeTasks} Active</span>` :
              `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Idle / Ready</span>`}
          </td>
          <td class="py-3 px-4 text-center font-bold text-slate-800">${s.tasksCompleted}</td>
          <td class="py-3 px-4 text-right">
            <span class="inline-flex items-center gap-1 font-bold text-amber-500">
              <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i> ${s.rating}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  renderActivityLogs() {
    const container = document.getElementById('adminActivityStream');
    if (!container) return;

    const logs = window.appStore.getActivityLogs().slice(0, 8);
    if (logs.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No recent activity logs.</p>';
      return;
    }

    container.innerHTML = logs.map(l => {
      const time = new Date(l.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="flex items-start gap-2.5 text-xs py-2 border-b border-slate-100 last:border-0">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
          <div class="flex-1">
            <p class="text-slate-700 leading-snug">${l.text}</p>
            <span class="text-[10px] text-slate-400 mt-0.5 block">${time}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  exportComplaintsCSV() {
    const complaints = window.appStore.getComplaints();
    const headers = ['Complaint ID', 'Date Reported', 'Waste Type', 'Ward', 'Citizen Name', 'Phone', 'Address', 'Status', 'Sweeper Assigned', 'Officer Instructions', 'Rating'];
    
    const rows = complaints.map(c => [
      `"${c.id}"`,
      `"${c.createdAt}"`,
      `"${c.wasteType}"`,
      `"${c.wardName}"`,
      `"${c.citizenName}"`,
      `"${c.citizenPhone}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${c.assignedSweeperName || 'None'}"`,
      `"${(c.officerInstruction || '').replace(/"/g, '""')}"`,
      `"${c.citizenRating || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nagar_nigam_waste_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Auth.showToast('Complaints report exported as CSV successfully!', 'success');
  }
};

window.Admin = Admin;
