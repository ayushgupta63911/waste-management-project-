/**
 * Complaint Tracking Controller
 * Provides visual step timeline, status indicators, before/after proof comparisons, and citizen feedback.
 */

const Tracking = {
  currentComplaint: null,

  init() {
    this.bindEvents();
    this.renderRecentTrackingList();
    // Default load first complaint to display initial state
    const complaints = window.appStore.getComplaints();
    if (complaints.length > 0) {
      this.displayComplaintDetails(complaints[0]);
    }
  },

  bindEvents() {
    const searchForm = document.getElementById('trackingSearchForm');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('trackingSearchInput').value.trim();
        this.searchAndDisplayComplaint(query);
      });
    }

    // Feedback star ratings
    document.querySelectorAll('.star-rating-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rating = parseInt(e.currentTarget.dataset.rating, 10);
        this.setStarRating(rating);
      });
    });

    // Feedback submit button
    const feedbackForm = document.getElementById('citizenFeedbackForm');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFeedbackSubmit();
      });
    }

    // Re-render when complaints update
    window.addEventListener('complaints:update', (e) => {
      this.renderRecentTrackingList();
      if (this.currentComplaint && this.currentComplaint.id === e.detail.id) {
        this.displayComplaintDetails(e.detail);
      }
    });
  },

  searchAndDisplayComplaint(query) {
    if (!query) {
      Auth.showToast('Please enter a Complaint ID or mobile number.', 'warning');
      return;
    }

    const complaints = window.appStore.getComplaints();
    const found = complaints.find(c => 
      c.id.toLowerCase() === query.toLowerCase() ||
      c.citizenPhone.includes(query) ||
      c.id.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      this.displayComplaintDetails(found);
      const input = document.getElementById('trackingSearchInput');
      if (input) input.value = found.id;
    } else {
      Auth.showToast(`No complaint found with ID or query "${query}".`, 'error');
    }
  },

  renderRecentTrackingList() {
    const container = document.getElementById('recentTrackingCards');
    if (!container) return;

    const complaints = window.appStore.getComplaints().slice(0, 5);
    container.innerHTML = complaints.map(c => {
      const isSelected = this.currentComplaint && this.currentComplaint.id === c.id;
      const statusColors = {
        'Pending Verification': 'bg-rose-500',
        'Nagar Nigam Verified': 'bg-amber-500',
        'Sweeper Dispatched': 'bg-sky-500',
        'In Progress': 'bg-indigo-500',
        'Resolved': 'bg-emerald-500'
      };
      const dotColor = statusColors[c.status] || 'bg-slate-400';

      return `
        <button onclick="Tracking.searchAndDisplayComplaint('${c.id}')"
          class="w-full text-left p-3.5 rounded-xl border ${isSelected ? 'border-emerald-500 bg-emerald-50/50 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'} transition-all">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="font-mono font-bold text-slate-800">${c.id}</span>
            <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
              <span class="w-2 h-2 rounded-full ${dotColor}"></span>
              ${c.status}
            </span>
          </div>
          <p class="text-xs font-semibold text-slate-700 truncate">${c.wasteType}</p>
          <p class="text-[11px] text-slate-400 truncate mt-0.5">${c.address}</p>
        </button>
      `;
    }).join('');
  },

  displayComplaintDetails(c) {
    this.currentComplaint = c;
    const detailBox = document.getElementById('trackingDetailContainer');
    if (!detailBox) return;

    // Calculate active timeline steps
    // Step 1: Reported (Always complete)
    // Step 2: Nagar Nigam Verified (Complete if status != 'Pending Verification')
    // Step 3: Sweeper Dispatched (Complete if status in ['Sweeper Dispatched', 'In Progress', 'Resolved'])
    // Step 4: Work In Progress (Complete if status in ['In Progress', 'Resolved'])
    // Step 5: Resolved (Complete if status == 'Resolved')

    const s1Done = true;
    const s2Done = c.status !== 'Pending Verification';
    const s3Done = ['Sweeper Dispatched', 'In Progress', 'Resolved'].includes(c.status);
    const s4Done = ['In Progress', 'Resolved'].includes(c.status);
    const s5Done = c.status === 'Resolved';

    // Format dates
    const formatDate = (iso) => {
      if (!iso) return 'Pending';
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const statusBadge = `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s5Done ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">
        <span class="w-2 h-2 rounded-full ${s5Done ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}"></span>
        ${c.status.toUpperCase()}
      </span>
    `;

    detailBox.innerHTML = `
      <!-- Header Banner -->
      <div class="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold font-mono tracking-tight">${c.id}</h2>
            ${statusBadge}
          </div>
          <p class="text-sm text-slate-300 mt-1">${c.wasteType} &bull; ${c.wardName}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-400">Reported On</p>
          <p class="text-sm font-semibold text-slate-200">${formatDate(c.createdAt)}</p>
        </div>
      </div>

      <!-- Main Tracking Timeline -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
          <i data-lucide="route" class="w-4 h-4 text-emerald-600"></i>
          Live Nagar Nigam Redressal Progress Timeline
        </h3>

        <div class="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-0.5 ${s5Done ? 'before:bg-emerald-500' : 'before:bg-slate-200'}">

          <!-- STEP 1: Reported -->
          <div class="relative flex items-start gap-4">
            <div class="absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${s1Done ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50' : 'bg-slate-300 text-slate-600'}">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold text-slate-800">1. Citizen Grievance Lodged</h4>
                <span class="text-xs text-slate-400">${formatDate(c.createdAt)}</span>
              </div>
              <p class="text-xs text-slate-600 mt-1">Logged by citizen <strong>${c.citizenName}</strong> (${c.citizenPhone})</p>
              <p class="text-xs text-slate-500 mt-0.5">Location: ${c.address} (Landmark: ${c.landmark || 'None'})</p>
              <div class="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 italic">
                "${c.description}"
              </div>
            </div>
          </div>

          <!-- STEP 2: Nagar Nigam Ward Office Verified -->
          <div class="relative flex items-start gap-4">
            <div class="absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${s2Done ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50' : 'bg-slate-200 text-slate-400'}">
              <i data-lucide="${s2Done ? 'check' : 'clock'}" class="w-3.5 h-3.5"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold ${s2Done ? 'text-slate-800' : 'text-slate-400'}">2. Routed to Local Area Nagar Nigam Office</h4>
                <span class="text-xs text-slate-400">${formatDate(c.verifiedAt)}</span>
              </div>
              <p class="text-xs ${s2Done ? 'text-slate-600' : 'text-slate-400'} mt-1">
                Desk Officer: <strong>${c.assignedOfficer || 'Zonal Sanitary Inspector'}</strong>
              </p>
              <p class="text-xs text-slate-500 mt-0.5">Municipal Zone: ${c.wardName}</p>
            </div>
          </div>

          <!-- STEP 3: Sweeper Dispatched with Instructions -->
          <div class="relative flex items-start gap-4">
            <div class="absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${s3Done ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50' : 'bg-slate-200 text-slate-400'}">
              <i data-lucide="${s3Done ? 'check' : 'truck'}" class="w-3.5 h-3.5"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold ${s3Done ? 'text-slate-800' : 'text-slate-400'}">3. Sweeper Dispatched & Work Instructions Issued</h4>
                <span class="text-xs text-slate-400">${s3Done ? formatDate(c.verifiedAt) : 'Awaiting Assignment'}</span>
              </div>
              ${s3Done ? `
                <div class="mt-2 bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-sky-950 flex items-center gap-1.5">
                      <i data-lucide="user-check" class="w-4 h-4 text-sky-600"></i>
                      Assigned Sweeper: ${c.assignedSweeperName}
                    </span>
                    <a href="tel:${c.sweeperPhone}" class="px-2 py-0.5 bg-white text-sky-700 font-bold border border-sky-300 rounded shadow-xs flex items-center gap-1">
                      <i data-lucide="phone" class="w-3 h-3"></i> ${c.sweeperPhone}
                    </a>
                  </div>
                  <p><span class="font-medium">Sanitation Vehicle:</span> ${c.vehicleNumber || 'Auto Tipper Van'}</p>
                  <div class="mt-1 pt-1.5 border-t border-sky-200/60 text-sky-800">
                    <span class="font-bold">Official Instruction from Nagar Nigam:</span>
                    <p class="italic mt-0.5">"${c.officerInstruction || 'Clear area immediately and disinfect.'}"</p>
                  </div>
                </div>
              ` : `
                <p class="text-xs text-slate-400 mt-1 italic">Nagar Nigam sanitary officer is assessing the required vehicle and crew allocation.</p>
              `}
            </div>
          </div>

          <!-- STEP 4: In Progress -->
          <div class="relative flex items-start gap-4">
            <div class="absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${s4Done ? 'bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-50' : 'bg-slate-200 text-slate-400'}">
              <i data-lucide="${s4Done ? 'refresh-cw' : 'circle-ellipsis'}" class="w-3.5 h-3.5 ${s4Done && !s5Done ? 'animate-spin' : ''}"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold ${s4Done ? 'text-slate-800' : 'text-slate-400'}">4. Cleaning & Pickup In Progress</h4>
                <span class="text-xs text-slate-400">${s4Done ? 'Active on site' : 'Queued'}</span>
              </div>
              <p class="text-xs ${s4Done ? 'text-slate-600' : 'text-slate-400'} mt-1">
                ${s4Done ? 'Sanitation team is on-site gathering waste, loading onto transport trucks, and sanitizing the street pavement.' : 'Team will commence work once current route allows.'}
              </p>
            </div>
          </div>

          <!-- STEP 5: Resolved -->
          <div class="relative flex items-start gap-4">
            <div class="absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${s5Done ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50' : 'bg-slate-200 text-slate-400'}">
              <i data-lucide="${s5Done ? 'award' : 'check-circle'}" class="w-3.5 h-3.5"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold ${s5Done ? 'text-emerald-700' : 'text-slate-400'}">5. Resolved & Verified</h4>
                <span class="text-xs text-slate-400">${s5Done ? formatDate(c.resolvedAt) : 'Pending Resolution'}</span>
              </div>
              ${s5Done ? `
                <div class="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
                  <p class="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
                    Cleaned & Cleared Successfully
                  </p>
                  <p class="mt-1">${c.resolutionNotes || 'Site deep-cleaned and waste transferred to secondary transfer station.'}</p>
                </div>
              ` : `
                <p class="text-xs text-slate-400 mt-1 italic">Resolution proof photo will be uploaded once the sanitation crew completes pickup.</p>
              `}
            </div>
          </div>
        </div>
      </div>

      <!-- Photographic Proof: Before vs After -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i data-lucide="image" class="w-4 h-4 text-emerald-600"></i>
          Photographic Verification (Before & After)
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Before Photo -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                Before (Citizen Reported)
              </span>
              <span class="text-[11px] text-slate-400">${formatDate(c.createdAt)}</span>
            </div>
            <div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center shadow-inner">
              <img src="${c.photoBefore}" alt="Before Cleaning" class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- After Photo -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold ${c.photoAfter ? 'text-emerald-700' : 'text-slate-400'} uppercase tracking-wider flex items-center gap-1">
                <span class="w-2 h-2 rounded-full ${c.photoAfter ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
                After (Nagar Nigam Resolution Proof)
              </span>
              <span class="text-[11px] text-slate-400">${c.photoAfter ? formatDate(c.resolvedAt) : 'Pending Clearance'}</span>
            </div>
            <div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center shadow-inner">
              ${c.photoAfter ? `
                <img src="${c.photoAfter}" alt="After Cleaning" class="w-full h-full object-cover" />
              ` : `
                <div class="text-center p-6 text-slate-400">
                  <i data-lucide="camera-off" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
                  <p class="text-xs font-medium">After-cleaning photo will appear here</p>
                  <p class="text-[10px] text-slate-400 mt-0.5">Uploaded directly by the dispatched sweeper</p>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>

      <!-- Citizen Feedback Section -->
      ${s5Done ? `
        <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
          <h3 class="text-sm font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-2">
            <i data-lucide="star" class="w-4 h-4 text-amber-500"></i>
            Citizen Satisfaction Feedback
          </h3>

          ${c.citizenRating ? `
            <div class="bg-white rounded-xl p-4 border border-emerald-100 shadow-xs">
              <div class="flex items-center gap-1 text-amber-400 mb-1">
                ${Array.from({ length: 5 }).map((_, i) => `
                  <i data-lucide="star" class="w-4 h-4 ${i < c.citizenRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}"></i>
                `).join('')}
                <span class="ml-2 text-xs font-bold text-slate-700">${c.citizenRating} / 5 Stars</span>
              </div>
              <p class="text-xs text-slate-600 italic">"${c.citizenFeedback || 'Citizen did not leave written remarks.'}"</p>
              <p class="text-[11px] text-slate-400 mt-2">— Submitted by ${c.citizenName}</p>
            </div>
          ` : `
            <form id="citizenFeedbackForm" class="space-y-3">
              <p class="text-xs text-emerald-800">Are you satisfied with the Nagar Nigam cleanup and sweeper's response time?</p>
              
              <div class="flex items-center gap-2" id="starRatingGroup">
                ${[1, 2, 3, 4, 5].map(num => `
                  <button type="button" data-rating="${num}" class="star-rating-btn p-1.5 rounded-lg hover:bg-white text-slate-300 hover:text-amber-400 transition-colors">
                    <i data-lucide="star" class="w-6 h-6"></i>
                  </button>
                `).join('')}
                <span id="starRatingLabel" class="text-xs font-bold text-slate-600 ml-2">Click to rate</span>
              </div>

              <textarea id="feedbackComment" rows="2" placeholder="Write any comments regarding the cleanliness or sweeper's service..."
                class="w-full text-xs p-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"></textarea>

              <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5">
                <i data-lucide="check" class="w-4 h-4"></i> Submit Citizen Rating
              </button>
            </form>
          `}
        </div>
      ` : ''}
    `;

    if (window.lucide) window.lucide.createIcons();

    // Re-bind star buttons
    document.querySelectorAll('.star-rating-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rating = parseInt(e.currentTarget.dataset.rating, 10);
        this.setStarRating(rating);
      });
    });

    const fForm = document.getElementById('citizenFeedbackForm');
    if (fForm) {
      fForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFeedbackSubmit();
      });
    }

    this.renderRecentTrackingList();
  },

  selectedRatingValue: 5,

  setStarRating(rating) {
    this.selectedRatingValue = rating;
    const btns = document.querySelectorAll('.star-rating-btn');
    btns.forEach((btn, idx) => {
      const icon = btn.querySelector('svg') || btn.querySelector('i');
      if (idx < rating) {
        btn.classList.add('text-amber-400');
        btn.classList.remove('text-slate-300');
        if (icon) icon.classList.add('fill-amber-400');
      } else {
        btn.classList.remove('text-amber-400');
        btn.classList.add('text-slate-300');
        if (icon) icon.classList.remove('fill-amber-400');
      }
    });

    const label = document.getElementById('starRatingLabel');
    if (label) {
      const texts = ['Poor', 'Fair', 'Average', 'Very Good', 'Excellent!'];
      label.textContent = `${rating} Stars (${texts[rating - 1]})`;
    }
  },

  handleFeedbackSubmit() {
    if (!this.currentComplaint) return;
    const comment = document.getElementById('feedbackComment')?.value.trim() || 'Prompt resolution. Very satisfied!';
    
    window.appStore.updateComplaint(this.currentComplaint.id, {
      citizenRating: this.selectedRatingValue,
      citizenFeedback: comment
    });

    Auth.showToast('Thank you! Your feedback has been recorded for the Nagar Nigam team.', 'success');
  }
};

window.Tracking = Tracking;
