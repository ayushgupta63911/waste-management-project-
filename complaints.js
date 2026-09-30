/**
 * Complaints Management Controller
 * Handles reporting, Nagar Nigam routing, sweeper assignment, and resolution.
 */

const Complaints = {
  selectedPhotoUrl: null,

  init() {
    this.bindEvents();
    this.populateWardDropdowns();
  },

  bindEvents() {
    // Report Waste Form Submission
    const reportForm = document.getElementById('reportWasteForm');
    if (reportForm) {
      reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleReportSubmit();
      });
    }

    // Ward change in Report form -> updates assigned Nagar Nigam info card
    const wardSelect = document.getElementById('reportWard');
    if (wardSelect) {
      wardSelect.addEventListener('change', (e) => {
        this.updateWardOfficeInfo(e.target.value);
      });
    }

    // GPS location detection button
    const detectLocationBtn = document.getElementById('detectLocationBtn');
    if (detectLocationBtn) {
      detectLocationBtn.addEventListener('click', () => {
        this.simulateDetectLocation();
      });
    }

    // Photo input file change
    const photoInput = document.getElementById('reportPhotoFile');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.setPhotoPreview(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Demo photo buttons
    document.querySelectorAll('.btn-demo-photo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const photoKey = e.currentTarget.dataset.photoKey;
        const url = SAMPLE_PHOTOS[photoKey] || SAMPLE_PHOTOS.overflowing_bin;
        this.setPhotoPreview(url);
      });
    });

    // Sweeper dispatch modal form submission
    const dispatchForm = document.getElementById('sweeperDispatchForm');
    if (dispatchForm) {
      dispatchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSweeperDispatchSubmit();
      });
    }

    // Sweeper resolution modal form submission
    const sweeperResolveForm = document.getElementById('sweeperResolveForm');
    if (sweeperResolveForm) {
      sweeperResolveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSweeperResolveSubmit();
      });
    }

    // Listen for updates
    window.addEventListener('complaints:update', () => {
      this.renderOfficerComplaintsTable();
      this.renderSweeperTasks();
    });
  },

  populateWardDropdowns() {
    const wards = window.appStore.getWards();
    const selects = ['reportWard', 'regWard', 'filterOfficerWard'];

    selects.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const currentVal = el.value;
      // Preserve first option if it's "All Wards"
      const keepFirst = id === 'filterOfficerWard';
      const firstOpt = keepFirst ? el.options[0] : null;

      el.innerHTML = '';
      if (keepFirst && firstOpt) el.appendChild(firstOpt);

      wards.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = w.name;
        el.appendChild(opt);
      });

      if (currentVal) el.value = currentVal;
    });

    // Update the Nagar Nigam office indicator for current ward
    const reportWard = document.getElementById('reportWard');
    if (reportWard && reportWard.value) {
      this.updateWardOfficeInfo(reportWard.value);
    }
  },

  updateWardOfficeInfo(wardId) {
    const wards = window.appStore.getWards();
    const ward = wards.find(w => w.id === wardId);
    const infoCard = document.getElementById('wardNagarNigamCard');
    if (!infoCard) return;

    if (ward) {
      infoCard.classList.remove('hidden');
      infoCard.innerHTML = `
        <div class="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
          <div class="p-2 bg-emerald-600 text-white rounded-lg">
            <i data-lucide="building-2" class="w-4 h-4"></i>
          </div>
          <div class="flex-1">
            <p class="font-bold text-emerald-800">Assigned Routing: Local Nagar Nigam Office</p>
            <p class="mt-0.5"><span class="font-medium">Zone Desk:</span> ${ward.name}</p>
            <p class="mt-0.5"><span class="font-medium">Zonal Sanitary Officer:</span> ${ward.officer} (<a href="tel:${ward.phone}" class="underline text-emerald-700">${ward.phone}</a>)</p>
            <p class="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
              <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
              Your complaint will be routed directly to this officer's dispatch desk.
            </p>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    } else {
      infoCard.classList.add('hidden');
    }
  },

  setPhotoPreview(url) {
    this.selectedPhotoUrl = url;
    const previewContainer = document.getElementById('photoPreviewContainer');
    const previewImg = document.getElementById('photoPreviewImg');
    const uploadPrompt = document.getElementById('photoUploadPrompt');

    if (previewContainer && previewImg) {
      previewImg.src = url;
      previewContainer.classList.remove('hidden');
      if (uploadPrompt) uploadPrompt.classList.add('hidden');
    }
  },

  clearPhotoPreview() {
    this.selectedPhotoUrl = null;
    const previewContainer = document.getElementById('photoPreviewContainer');
    const previewImg = document.getElementById('photoPreviewImg');
    const uploadPrompt = document.getElementById('photoUploadPrompt');
    const fileInput = document.getElementById('reportPhotoFile');

    if (previewContainer) previewContainer.classList.add('hidden');
    if (uploadPrompt) uploadPrompt.classList.remove('hidden');
    if (fileInput) fileInput.value = '';
    if (previewImg) previewImg.src = '';
  },

  simulateDetectLocation() {
    const btn = document.getElementById('detectLocationBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Locating...`;
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      // Pick random realistic coordinates around central city
      const mockLocations = [
        { wardId: 'W-04', addr: 'Civil Lines Crossing, Near Metro Gate 2', landmark: 'Adjacent to Indian Post Office', lat: 26.8612, lng: 80.9578 },
        { wardId: 'W-01', addr: 'Hazratganj Main Market, Opposite Cathedral', landmark: 'Near Mayfair Building', lat: 26.8524, lng: 80.9421 },
        { wardId: 'W-02', addr: 'Shanti Nagar Chowk, Road No. 3', landmark: 'Near Durga Temple', lat: 26.8720, lng: 80.9310 },
        { wardId: 'W-03', addr: 'Gandhi Nagar Central Circle', landmark: 'Near Municipality Park', lat: 26.8340, lng: 80.9250 }
      ];
      const selected = mockLocations[Math.floor(Math.random() * mockLocations.length)];

      document.getElementById('reportWard').value = selected.wardId;
      document.getElementById('reportAddress').value = selected.addr;
      document.getElementById('reportLandmark').value = selected.landmark;
      document.getElementById('reportLat').value = selected.lat;
      document.getElementById('reportLng').value = selected.lng;

      this.updateWardOfficeInfo(selected.wardId);
      btn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-600"></i> Location Detected!`;
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => {
        btn.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }, 2500);
    }, 700);
  },

  handleReportSubmit() {
    const currentUser = window.appStore.getCurrentUser();
    const wardId = document.getElementById('reportWard').value;
    const wasteType = document.getElementById('reportWasteType').value;
    const severity = document.querySelector('input[name="severity"]:checked')?.value || 'Medium';
    const address = document.getElementById('reportAddress').value.trim();
    const landmark = document.getElementById('reportLandmark').value.trim();
    const description = document.getElementById('reportDescription').value.trim();
    const lat = parseFloat(document.getElementById('reportLat').value) || 26.8524;
    const lng = parseFloat(document.getElementById('reportLng').value) || 80.9421;

    if (!wardId || !wasteType || !address || !description) {
      Auth.showToast('Please fill all required fields.', 'warning');
      return;
    }

    const wards = window.appStore.getWards();
    const ward = wards.find(w => w.id === wardId);

    const complaintId = 'NN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newComplaint = {
      id: complaintId,
      citizenName: currentUser ? currentUser.name : (document.getElementById('reportCitizenName')?.value || 'Citizen Reporter'),
      citizenPhone: currentUser ? currentUser.phone : (document.getElementById('reportCitizenPhone')?.value || '9876543210'),
      citizenEmail: currentUser ? currentUser.email : 'citizen@swachhnagar.gov.in',
      wardId,
      wardName: ward ? ward.name : 'Central Nagar Nigam Ward',
      wasteType,
      severity,
      address,
      landmark,
      description,
      photoBefore: this.selectedPhotoUrl || SAMPLE_PHOTOS.overflowing_bin,
      photoAfter: null,
      status: 'Pending Verification',
      createdAt: new Date().toISOString(),
      verifiedAt: null,
      assignedOfficer: ward ? ward.officer : 'Zonal Sanitary Inspector',
      officerInstruction: null,
      assignedSweeperId: null,
      assignedSweeperName: null,
      sweeperPhone: null,
      vehicleNumber: null,
      resolvedAt: null,
      citizenRating: null,
      citizenFeedback: null,
      lat,
      lng
    };

    window.appStore.saveComplaint(newComplaint);

    // Reset Form
    document.getElementById('reportWasteForm').reset();
    this.clearPhotoPreview();

    // Show Confirmation Modal
    this.showConfirmationModal(newComplaint);
  },

  showConfirmationModal(complaint) {
    const modal = document.getElementById('complaintSuccessModal');
    if (!modal) return;

    document.getElementById('confirmComplaintId').textContent = complaint.id;
    document.getElementById('confirmWardName').textContent = complaint.wardName;
    document.getElementById('confirmOfficerName').textContent = complaint.assignedOfficer;
    document.getElementById('confirmWasteType').textContent = complaint.wasteType;
    document.getElementById('confirmAddress').textContent = complaint.address;

    // View in tracking button
    const trackBtn = document.getElementById('btnTrackComplaintNow');
    if (trackBtn) {
      trackBtn.onclick = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        window.app.navigateTo('tracking');
        window.Tracking.searchAndDisplayComplaint(complaint.id);
      };
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeConfirmationModal() {
    const modal = document.getElementById('complaintSuccessModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  // --- Nagar Nigam Officer Desk Functions ---
  renderOfficerComplaintsTable() {
    const tbody = document.getElementById('officerComplaintsTableBody');
    if (!tbody) return;

    const complaints = window.appStore.getComplaints();
    const filterWard = document.getElementById('filterOfficerWard')?.value || 'all';
    const filterStatus = document.getElementById('filterOfficerStatus')?.value || 'all';

    const filtered = complaints.filter(c => {
      const matchWard = filterWard === 'all' || c.wardId === filterWard;
      const matchStatus = filterStatus === 'all' || 
        (filterStatus === 'pending' && (c.status === 'Pending Verification' || c.status === 'Nagar Nigam Verified')) ||
        (filterStatus === 'dispatched' && (c.status === 'Sweeper Dispatched' || c.status === 'In Progress')) ||
        (filterStatus === 'resolved' && c.status === 'Resolved');
      return matchWard && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-400">
            <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
            No complaints found matching this filter criteria.
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = filtered.map(c => {
      const statusBadges = {
        'Pending Verification': '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>Pending Verification</span>',
        'Nagar Nigam Verified': '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Verified by Nigam</span>',
        'Sweeper Dispatched': '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200"><span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>Sweeper Dispatched</span>',
        'In Progress': '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>In Progress</span>',
        'Resolved': '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><i data-lucide="check-circle" class="w-3 h-3 text-emerald-600"></i>Resolved</span>'
      };

      const severityBadge = {
        'Low': '<span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">Low</span>',
        'Medium': '<span class="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-700">Medium</span>',
        'High': '<span class="px-2 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700 font-bold">High / Urgent</span>'
      };

      const dateStr = new Date(c.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <tr class="hover:bg-slate-50/80 border-b border-slate-100 transition-colors">
          <td class="py-3 px-4">
            <span class="font-mono text-xs font-bold text-slate-800">${c.id}</span>
            <p class="text-[11px] text-slate-400 mt-0.5">${dateStr}</p>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-2">
              <img src="${c.photoBefore}" alt="Waste" class="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-sm flex-shrink-0" />
              <div>
                <p class="font-semibold text-xs text-slate-800">${c.wasteType}</p>
                <p class="text-[11px] text-slate-500 line-clamp-1">${c.address}</p>
              </div>
            </div>
          </td>
          <td class="py-3 px-4">
            <span class="text-xs font-medium text-slate-700 block">${c.wardName.split('/')[0]}</span>
            <span class="text-[11px] text-slate-400">${c.citizenName}</span>
          </td>
          <td class="py-3 px-4">
            ${severityBadge[c.severity] || severityBadge['Medium']}
          </td>
          <td class="py-3 px-4">
            ${statusBadges[c.status] || c.status}
          </td>
          <td class="py-3 px-4">
            ${c.assignedSweeperName ? `
              <div class="text-xs">
                <span class="font-semibold text-slate-800">${c.assignedSweeperName}</span>
                <p class="text-[10px] text-slate-500">${c.vehicleNumber || 'Sanitation Crew'}</p>
              </div>
            ` : '<span class="text-xs text-slate-400 italic">Not Assigned</span>'}
          </td>
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              ${c.status !== 'Resolved' ? `
                <button onclick="Complaints.openDispatchModal('${c.id}')" 
                  class="px-2.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1 transition-all">
                  <i data-lucide="send" class="w-3.5 h-3.5"></i>
                  ${c.status === 'Pending Verification' ? 'Instruct & Assign' : 'Re-assign'}
                </button>
              ` : `
                <button onclick="Tracking.searchAndDisplayComplaint('${c.id}'); window.app.navigateTo('tracking');" 
                  class="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-all">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i> View Details
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openDispatchModal(complaintId) {
    const complaint = window.appStore.getComplaintById(complaintId);
    if (!complaint) return;

    const modal = document.getElementById('sweeperDispatchModal');
    if (!modal) return;

    document.getElementById('dispatchComplaintId').value = complaint.id;
    document.getElementById('modalComplaintTitle').textContent = `${complaint.id} - ${complaint.wasteType}`;
    document.getElementById('modalComplaintLocation').textContent = `${complaint.address} (${complaint.wardName})`;
    document.getElementById('modalComplaintDesc').textContent = complaint.description;
    document.getElementById('modalComplaintPhoto').src = complaint.photoBefore;

    // Populate sweepers for this complaint's ward
    const sweeperSelect = document.getElementById('dispatchSweeperSelect');
    sweeperSelect.innerHTML = '<option value="">-- Select Sanitation Worker / Sweeper --</option>';
    
    // First get sweepers for this specific ward, then others
    const allSweepers = window.appStore.getSweepers();
    const wardSweepers = allSweepers.filter(s => s.wardId === complaint.wardId);
    const otherSweepers = allSweepers.filter(s => s.wardId !== complaint.wardId);

    const groupWard = document.createElement('optgroup');
    groupWard.label = `Designated for ${complaint.wardName.split('/')[0]}`;
    wardSweepers.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} (${s.vehicle}) - ${s.status}`;
      if (complaint.assignedSweeperId === s.id) opt.selected = true;
      groupWard.appendChild(opt);
    });
    sweeperSelect.appendChild(groupWard);

    if (otherSweepers.length > 0) {
      const groupOther = document.createElement('optgroup');
      groupOther.label = 'Other Zones (Reinforcement)';
      otherSweepers.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} (${s.wardName.split('/')[0]}) - ${s.vehicle}`;
        if (complaint.assignedSweeperId === s.id) opt.selected = true;
        groupOther.appendChild(opt);
      });
      sweeperSelect.appendChild(groupOther);
    }

    // Default instruction template
    const instructionField = document.getElementById('dispatchInstruction');
    if (complaint.officerInstruction) {
      instructionField.value = complaint.officerInstruction;
    } else {
      instructionField.value = `Dispatch team immediately to ${complaint.address}. Ensure waste is completely cleared, loaded onto the tipper vehicle, and the area is disinfected with lime/bleaching powder. Upload clear after-cleaning photo upon resolution.`;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  },

  closeDispatchModal() {
    const modal = document.getElementById('sweeperDispatchModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  handleSweeperDispatchSubmit() {
    const complaintId = document.getElementById('dispatchComplaintId').value;
    const sweeperId = document.getElementById('dispatchSweeperSelect').value;
    const instructions = document.getElementById('dispatchInstruction').value.trim();
    const priority = document.getElementById('dispatchPriority').value;

    if (!sweeperId) {
      Auth.showToast('Please select a sweeper/sanitation crew to dispatch.', 'warning');
      return;
    }

    const sweeper = window.appStore.getSweepers().find(s => s.id === sweeperId);
    const currentUser = window.appStore.getCurrentUser();

    window.appStore.updateComplaint(complaintId, {
      status: 'Sweeper Dispatched',
      verifiedAt: new Date().toISOString(),
      assignedOfficer: currentUser ? currentUser.name : 'Zonal Sanitary Officer',
      assignedSweeperId: sweeper ? sweeper.id : 'SW-101',
      assignedSweeperName: sweeper ? sweeper.name : 'Designated Sanitation Worker',
      sweeperPhone: sweeper ? sweeper.phone : '+91 94150 11223',
      vehicleNumber: sweeper ? sweeper.vehicle : 'Nagar Nigam Tipper Truck',
      officerInstruction: instructions,
      severity: priority
    });

    this.closeDispatchModal();
    Auth.showToast(`Sweeper ${sweeper.name} dispatched with instructions for ${complaintId}!`, 'success');
  },

  // --- Sweeper Mode Functions ---
  renderSweeperTasks() {
    const container = document.getElementById('sweeperTasksContainer');
    if (!container) return;

    const currentUser = window.appStore.getCurrentUser();
    const complaints = window.appStore.getComplaints();

    // If logged in as sweeper, show assigned complaints; otherwise show all active dispatches
    let myTasks = complaints.filter(c => {
      if (currentUser && currentUser.role === 'sweeper') {
        return c.assignedSweeperId === currentUser.sweeperId || c.assignedSweeperName?.includes(currentUser.name.split(' ')[0]);
      }
      return c.status === 'Sweeper Dispatched' || c.status === 'In Progress';
    });

    if (myTasks.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <i data-lucide="check-check" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-slate-800">No Pending Pickup Requests</h3>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">All assigned waste complaints in your zone are currently attended to or resolved. Keep up the great work!</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = myTasks.map(c => {
      const isInProgress = c.status === 'In Progress';
      return `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
          <div class="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-emerald-50/30">
            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white text-slate-800 border border-slate-200 shadow-xs">${c.id}</span>
              <span class="text-xs font-bold text-emerald-800">${c.wasteType}</span>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isInProgress ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-sky-100 text-sky-800 border border-sky-200'}">
              <span class="w-2 h-2 rounded-full ${isInProgress ? 'bg-amber-500 animate-ping' : 'bg-sky-500'}"></span>
              ${c.status}
            </span>
          </div>

          <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="md:col-span-1">
              <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Site Photo (Reported)</p>
              <img src="${c.photoBefore}" alt="Reported Waste" class="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-inner" />
            </div>

            <div class="md:col-span-2 space-y-3">
              <div>
                <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pickup Location</p>
                <p class="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <i data-lucide="map-pin" class="w-4 h-4 text-rose-500 flex-shrink-0"></i>
                  ${c.address}
                </p>
                <p class="text-xs text-slate-500 ml-5 mt-0.5">Landmark: ${c.landmark || 'Not specified'} | Zone: ${c.wardName}</p>
              </div>

              <!-- Nagar Nigam Officer Instruction Callout -->
              <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                <div class="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                  <i data-lucide="clipboard-list" class="w-4 h-4"></i>
                  Nagar Nigam Officer Instructions:
                </div>
                <p class="italic text-slate-700">"${c.officerInstruction || 'Clear all waste, load onto vehicle, and sanitize site.'}"</p>
                <p class="text-[11px] text-amber-700 font-medium mt-1">— Assigned by ${c.assignedOfficer || 'Zonal Officer'}</p>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div class="text-xs text-slate-500">
                  <span class="font-medium text-slate-700">Citizen:</span> ${c.citizenName} (<a href="tel:${c.citizenPhone}" class="text-emerald-700 underline font-semibold">${c.citizenPhone}</a>)
                </div>

                <div class="flex items-center gap-2">
                  ${!isInProgress ? `
                    <button onclick="Complaints.startSweeperJob('${c.id}')" 
                      class="px-3.5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-all">
                      <i data-lucide="play" class="w-3.5 h-3.5"></i> Start Cleanup (En Route)
                    </button>
                  ` : ''}

                  <button onclick="Complaints.openSweeperResolveModal('${c.id}')" 
                    class="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all">
                    <i data-lucide="camera" class="w-4 h-4"></i> Complete & Upload Proof
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  startSweeperJob(complaintId) {
    window.appStore.updateComplaint(complaintId, {
      status: 'In Progress'
    });
    Auth.showToast(`Task ${complaintId} marked as 'In Progress'. Status visible on citizen tracker.`, 'info');
  },

  openSweeperResolveModal(complaintId) {
    const complaint = window.appStore.getComplaintById(complaintId);
    if (!complaint) return;

    const modal = document.getElementById('sweeperResolveModal');
    if (!modal) return;

    document.getElementById('resolveComplaintId').value = complaint.id;
    document.getElementById('resolveModalTitle').textContent = `Fulfill Task: ${complaint.id}`;
    document.getElementById('resolveBeforePhotoPreview').src = complaint.photoBefore;

    // Default after photo
    const defaultAfter = SAMPLE_PHOTOS.cleaned_street;
    document.getElementById('resolveAfterPreviewImg').src = defaultAfter;
    this.sweeperAfterPhotoUrl = defaultAfter;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  },

  closeSweeperResolveModal() {
    const modal = document.getElementById('sweeperResolveModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  handleSweeperResolveSubmit() {
    const complaintId = document.getElementById('resolveComplaintId').value;
    const notes = document.getElementById('resolveNotes').value.trim() || 'Site completely cleared and sanitized. Garbage disposed at central processing plant.';
    const wasteQuantity = document.getElementById('resolveWasteQuantity').value || '1.0';

    const afterPhoto = this.sweeperAfterPhotoUrl || SAMPLE_PHOTOS.cleaned_street;

    window.appStore.updateComplaint(complaintId, {
      status: 'Resolved',
      photoAfter: afterPhoto,
      resolutionNotes: `${notes} (Approx. ${wasteQuantity} tons collected)`,
      resolvedAt: new Date().toISOString()
    });

    this.closeSweeperResolveModal();
    Auth.showToast(`Pickup completed! Resolution proof uploaded for ${complaintId}.`, 'success');
  }
};

window.Complaints = Complaints;
