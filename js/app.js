/**
 * CivicFix - Application Orchestrator & View Controller
 * Implements Single-Page Application navigation, form submission, search/filtering,
 * inline admin status updates, CSV/JSON exports, and event delegation.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  currentView: 'landing',
  activePhotoData: null,
  dashboardFilters: {
    search: '',
    category: 'all',
    status: 'all',
    priority: 'all',
    sort: 'newest',
    viewMode: 'table' // 'table' or 'grid'
  },
  adminFilters: {
    search: '',
    category: 'all',
    status: 'all'
  },

  /**
   * App Initializer
   */
  init() {
    this.setupNavigation();
    this.setupMobileMenu();
    this.setupReportForm();
    this.setupTrackingView();
    this.setupCitizenDashboard();
    this.setupAdminDashboard();
    this.setupModals();
    this.setupSamplePhotoSelectors();
    
    // Handle initial route
    this.handleRoute();
    window.addEventListener('hashchange', () => this.handleRoute());

    // Refresh all live views from LocalStorage
    this.refreshAllData();
  },

  /**
   * SPA View Switching / Router
   */
  navigateTo(viewId, params = {}) {
    window.location.hash = viewId + (params.id ? `?id=${params.id}` : '');
  },

  handleRoute() {
    const rawHash = window.location.hash.replace('#', '') || 'landing';
    const [viewName, queryString] = rawHash.split('?');
    const params = new URLSearchParams(queryString || '');

    const validViews = ['landing', 'report', 'track', 'dashboard', 'admin', 'about'];
    const targetView = validViews.includes(viewName) ? viewName : 'landing';

    this.showView(targetView);

    // If tracking view with query param ?id=CF-xxxx
    if (targetView === 'track' && params.has('id')) {
      const searchInput = document.getElementById('track-search-input');
      if (searchInput) {
        searchInput.value = params.get('id');
        this.trackComplaint(params.get('id'));
      }
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showView(viewId) {
    this.currentView = viewId;

    // Toggle active section
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('is-visible');
    });

    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) {
      targetSection.classList.add('is-visible');
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('data-view') === viewId);
    });

    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-nav-drawer');
    if (mobileMenu) {
      mobileMenu.classList.remove('is-open');
    }

    // View-specific refreshes
    if (viewId === 'landing') {
      this.renderLandingStats();
      this.renderRecentIssues();
    } else if (viewId === 'dashboard') {
      this.renderCitizenDashboard();
    } else if (viewId === 'admin') {
      this.renderAdminDashboard();
    } else if (viewId === 'track') {
      this.renderQuickTrackPills();
    }
  },

  setupNavigation() {
    document.querySelectorAll('[data-view-target]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-view-target');
        this.navigateTo(target);
      });
    });
  },

  setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-nav-drawer');
    const closeBtn = document.getElementById('mobile-nav-close');
    const backdrop = document.getElementById('mobile-nav-backdrop');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.add('is-open');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('is-open');
      });
    }

    if (backdrop && drawer) {
      backdrop.addEventListener('click', () => {
        drawer.classList.remove('is-open');
      });
    }

    // Close on any drawer link click
    drawer?.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('is-open');
      });
    });
  },

  /**
   * Refreshes all stats and listings across the portal
   */
  refreshAllData() {
    this.renderLandingStats();
    this.renderRecentIssues();
    this.renderCitizenDashboard();
    this.renderAdminDashboard();
    this.renderQuickTrackPills();
  },

  // ==========================================
  // LANDING PAGE CONTROLLER
  // ==========================================
  renderLandingStats() {
    const stats = StorageService.getStatistics();

    const totalEl = document.getElementById('stat-total-complaints');
    const resolvedEl = document.getElementById('stat-resolved-complaints');
    const inProgressEl = document.getElementById('stat-progress-complaints');
    const pendingEl = document.getElementById('stat-pending-complaints');
    const rateEl = document.getElementById('stat-resolution-rate');

    if (totalEl) UIService.animateCounter(totalEl, stats.total);
    if (resolvedEl) UIService.animateCounter(resolvedEl, stats.resolved);
    if (inProgressEl) UIService.animateCounter(inProgressEl, stats.inProgress);
    if (pendingEl) UIService.animateCounter(pendingEl, stats.pending);
    if (rateEl) rateEl.textContent = `${stats.resolutionRate}%`;
  },

  renderRecentIssues() {
    const container = document.getElementById('landing-recent-cards');
    if (!container) return;

    const complaints = StorageService.getComplaints().slice(0, 4);

    if (complaints.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card col-span-full">
          <p>No community complaints recorded yet. Be the first to report!</p>
        </div>
      `;
      return;
    }

    const cardsHtml = complaints.map(c => `
      <div class="card issue-card-mini" data-id="${c.id}">
        <div class="issue-card-header">
          <div class="issue-cat-tag">
            <span class="cat-icon">${UIService.icons.categoryIcons[c.category] || UIService.icons.categoryIcons['Other']}</span>
            <span>${c.category}</span>
          </div>
          ${UIService.renderPriorityBadge(c.priority)}
        </div>
        <div class="issue-card-body">
          <h4 class="issue-title" title="${c.title}">${c.title}</h4>
          <p class="issue-location">
            ${UIService.icons.mapPin}
            <span>${c.location}</span>
          </p>
          <div class="issue-footer">
            <div class="status-wrap">${UIService.renderStatusBadge(c.status)}</div>
            <span class="issue-time">${UIService.formatRelativeTime(c.createdAt)}</span>
          </div>
        </div>
        <div class="issue-card-actions">
          <button class="btn btn-sm btn-outline-primary view-details-trigger" data-id="${c.id}">View Details</button>
          <button class="btn btn-sm btn-ghost track-issue-trigger" data-id="${c.id}">Track</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = cardsHtml;

    // Attach listeners
    container.querySelectorAll('.view-details-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openComplaintDetailModal(btn.getAttribute('data-id'));
      });
    });

    container.querySelectorAll('.track-issue-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigateTo('track', { id: btn.getAttribute('data-id') });
      });
    });
  },

  // ==========================================
  // REPORT AN ISSUE CONTROLLER
  // ==========================================
  setupReportForm() {
    const form = document.getElementById('report-complaint-form');
    if (!form) return;

    // Character counter
    const descTextarea = document.getElementById('report-desc');
    const charCounter = document.getElementById('desc-char-counter');
    ValidationService.initCharCounter(descTextarea, charCounter, 20, 800);

    // Interactive Priority Radios
    const priorityGroup = document.querySelectorAll('input[name="priority"]');
    priorityGroup.forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.priority-select-card').forEach(card => {
          card.classList.toggle('is-selected', card.querySelector('input').checked);
        });
      });
    });

    // Real-time inline field validation on blur
    ['name', 'email', 'phone', 'category', 'title', 'location'].forEach(fieldId => {
      const input = document.getElementById(`report-${fieldId}`);
      if (!input) return;

      input.addEventListener('blur', () => {
        const valRes = ValidationService.validateField(fieldId, input.value);
        if (!valRes.isValid) {
          ValidationService.showFieldError(input, valRes.message);
        } else {
          ValidationService.clearFieldError(input);
        }
      });

      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          const valRes = ValidationService.validateField(fieldId, input.value);
          if (valRes.isValid) {
            ValidationService.clearFieldError(input);
          }
        }
      });
    });

    // File Upload handling
    const fileInput = document.getElementById('report-image-input');
    const dropzone = document.getElementById('image-dropzone');
    const previewWrap = document.getElementById('image-preview-wrap');
    const previewImg = document.getElementById('image-preview');
    const removeImgBtn = document.getElementById('remove-image-btn');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.add('is-dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.remove('is-dragover');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.processImageFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.processImageFile(e.target.files[0]);
        }
      });

      if (removeImgBtn) {
        removeImgBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activePhotoData = null;
          fileInput.value = '';
          previewWrap.style.display = 'none';
          dropzone.style.display = 'flex';
        });
      }
    }

    // Form Submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleComplaintSubmission(form);
    });
  },

  setupSamplePhotoSelectors() {
    const sampleButtons = document.querySelectorAll('.sample-photo-btn');
    const previewWrap = document.getElementById('image-preview-wrap');
    const previewImg = document.getElementById('image-preview');
    const dropzone = document.getElementById('image-dropzone');

    sampleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-sample');
        if (window.SAMPLE_PHOTOS && window.SAMPLE_PHOTOS[type]) {
          this.activePhotoData = window.SAMPLE_PHOTOS[type];
          if (previewImg && previewWrap && dropzone) {
            previewImg.src = this.activePhotoData;
            previewWrap.style.display = 'block';
            dropzone.style.display = 'none';
          }
          UIService.toast(`Attached sample photo for ${type}`, 'info');
        }
      });
    });
  },

  processImageFile(file) {
    if (!file.type.match('image.*')) {
      UIService.toast('Please select an image file (PNG, JPG, or WEBP).', 'error');
      return;
    }

    // Check size <= 3MB
    if (file.size > 3 * 1024 * 1024) {
      UIService.toast('Image size should be under 3MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.activePhotoData = e.target.result;
      const previewWrap = document.getElementById('image-preview-wrap');
      const previewImg = document.getElementById('image-preview');
      const dropzone = document.getElementById('image-dropzone');

      if (previewImg && previewWrap && dropzone) {
        previewImg.src = this.activePhotoData;
        previewWrap.style.display = 'block';
        dropzone.style.display = 'none';
      }
      UIService.toast('Photo attached successfully.', 'success');
    };
    reader.readAsDataURL(file);
  },

  handleComplaintSubmission(form) {
    const nameInput = document.getElementById('report-name');
    const emailInput = document.getElementById('report-email');
    const phoneInput = document.getElementById('report-phone');
    const categoryInput = document.getElementById('report-category');
    const titleInput = document.getElementById('report-title');
    const descInput = document.getElementById('report-desc');
    const locationInput = document.getElementById('report-location');
    const landmarkInput = document.getElementById('report-landmark');
    const priorityChecked = document.querySelector('input[name="priority"]:checked');

    // Run complete validation
    const fieldsToValidate = [
      { name: 'name', input: nameInput },
      { name: 'email', input: emailInput },
      { name: 'phone', input: phoneInput },
      { name: 'category', input: categoryInput },
      { name: 'title', input: titleInput },
      { name: 'description', input: descInput },
      { name: 'location', input: locationInput }
    ];

    let hasErrors = false;
    let firstInvalid = null;

    fieldsToValidate.forEach(item => {
      const res = ValidationService.validateField(item.name, item.input.value);
      if (!res.isValid) {
        ValidationService.showFieldError(item.input, res.message);
        hasErrors = true;
        if (!firstInvalid) firstInvalid = item.input;
      } else {
        ValidationService.clearFieldError(item.input);
      }
    });

    if (!priorityChecked) {
      UIService.toast('Please select a priority level.', 'error');
      hasErrors = true;
    }

    if (hasErrors) {
      UIService.toast('Please review the highlighted fields before submitting.', 'error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Submit animation
    const submitBtn = document.getElementById('report-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Submitting to Ward Desk...
    `;

    setTimeout(() => {
      const complaintData = {
        name: nameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        category: categoryInput.value,
        title: titleInput.value,
        description: descInput.value,
        location: locationInput.value,
        landmark: landmarkInput ? landmarkInput.value : '',
        priority: priorityChecked ? priorityChecked.value : 'Medium',
        imageUrl: this.activePhotoData
      };

      const newComplaint = StorageService.addComplaint(complaintData);

      // Reset form
      form.reset();
      ValidationService.resetFormValidation(form);
      this.activePhotoData = null;
      document.getElementById('image-preview-wrap').style.display = 'none';
      document.getElementById('image-dropzone').style.display = 'flex';
      document.getElementById('desc-char-counter').textContent = '0 / 800 characters';
      document.querySelectorAll('.priority-select-card').forEach(c => c.classList.remove('is-selected'));
      document.querySelector('input[name="priority"][value="Medium"]').checked = true;
      document.querySelector('.priority-select-card:has(input[value="Medium"])')?.classList.add('is-selected');

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      // Update data across views
      this.refreshAllData();

      // Show success modal
      this.showSubmissionSuccessModal(newComplaint);

      UIService.toast(`Complaint ${newComplaint.id} lodged successfully!`, 'success');
    }, 600);
  },

  showSubmissionSuccessModal(complaint) {
    const modalIdEl = document.getElementById('modal-success-id');
    const modalTitleEl = document.getElementById('modal-success-title');
    const modalCatEl = document.getElementById('modal-success-cat');
    const modalDateEl = document.getElementById('modal-success-date');
    const trackBtn = document.getElementById('modal-success-track-btn');
    const copyBtn = document.getElementById('modal-success-copy-btn');

    if (modalIdEl) modalIdEl.textContent = complaint.id;
    if (modalTitleEl) modalTitleEl.textContent = complaint.title;
    if (modalCatEl) modalCatEl.textContent = complaint.category;
    if (modalDateEl) modalDateEl.textContent = UIService.formatDateTime(complaint.createdAt);

    if (trackBtn) {
      trackBtn.onclick = () => {
        UIService.closeModal('modal-submission-success');
        this.navigateTo('track', { id: complaint.id });
      };
    }

    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(complaint.id).then(() => {
          UIService.toast(`Copied ${complaint.id} to clipboard!`, 'info');
        }).catch(() => {
          UIService.toast(`ID: ${complaint.id}`, 'info');
        });
      };
    }

    UIService.openModal('modal-submission-success');
  },

  // ==========================================
  // TRACK COMPLAINT CONTROLLER
  // ==========================================
  setupTrackingView() {
    const form = document.getElementById('track-search-form');
    const input = document.getElementById('track-search-input');

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = input.value.trim();
        if (!id) {
          UIService.toast('Please enter a complaint ID to search.', 'warning');
          return;
        }
        this.trackComplaint(id);
      });
    }
  },

  renderQuickTrackPills() {
    const container = document.getElementById('quick-track-samples');
    if (!container) return;

    const complaints = StorageService.getComplaints().slice(0, 5);
    const pillsHtml = complaints.map(c => `
      <button type="button" class="btn btn-xs btn-sample-id" data-id="${c.id}">
        <strong>${c.id}</strong> <small>(${c.status})</small>
      </button>
    `).join('');

    container.innerHTML = pillsHtml;

    container.querySelectorAll('.btn-sample-id').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const input = document.getElementById('track-search-input');
        if (input) input.value = id;
        this.trackComplaint(id);
      });
    });
  },

  trackComplaint(id) {
    const container = document.getElementById('track-result-container');
    const emptyState = document.getElementById('track-empty-state');
    if (!container) return;

    const complaint = StorageService.getComplaintById(id);

    if (!complaint) {
      if (emptyState) emptyState.style.display = 'none';
      container.style.display = 'block';
      container.innerHTML = `
        <div class="card card-not-found">
          <div class="not-found-icon">${UIService.icons.alertTriangle}</div>
          <h3>Complaint Not Found</h3>
          <p>No record found matching ID: <strong>${id.toUpperCase()}</strong>.</p>
          <div class="not-found-tips">
            <p class="text-sm text-muted">Please check the ID format (e.g. <code>CF-2026-48291</code>) or pick one of the active demo complaints below.</p>
            <div class="mt-3">
              <button class="btn btn-sm btn-outline-primary" id="btn-retry-quick-track">Try a Demo Complaint</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-retry-quick-track')?.addEventListener('click', () => {
        const first = StorageService.getComplaints()[0];
        if (first) {
          const input = document.getElementById('track-search-input');
          if (input) input.value = first.id;
          this.trackComplaint(first.id);
        }
      });

      UIService.toast(`Complaint ${id} was not found.`, 'warning');
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.style.display = 'block';

    const photoHtml = complaint.imageUrl ? `
      <div class="track-photo-block">
        <label class="detail-label">Attached Incident Evidence:</label>
        <div class="track-photo-thumbnail">
          <img src="${complaint.imageUrl}" alt="Complaint Photo" class="clickable-image" data-src="${complaint.imageUrl}"/>
          <span class="photo-expand-badge">Click to enlarge</span>
        </div>
      </div>
    ` : '';

    container.innerHTML = `
      <div class="card tracking-result-card animate-fade-in">
        <div class="tracking-card-header">
          <div class="tracking-id-banner">
            <span class="tracking-tag">CITIZEN GRIEVANCE RECORD</span>
            <h2 class="tracking-complaint-id">${complaint.id}</h2>
            <p class="tracking-issue-title">${complaint.title}</p>
          </div>
          <div class="tracking-status-badges">
            ${UIService.renderStatusBadge(complaint.status)}
            ${UIService.renderPriorityBadge(complaint.priority)}
          </div>
        </div>

        <div class="tracking-section-title">
          <h4>Grievance Lifecycle Progress</h4>
          <span class="text-xs text-muted">Live audit timeline</span>
        </div>

        ${UIService.renderWorkflowTimeline(complaint.status, complaint.timeline)}

        <div class="tracking-meta-grid">
          <div class="meta-item">
            <span class="meta-label">Category</span>
            <strong class="meta-val">
              <span class="inline-cat-icon">${UIService.icons.categoryIcons[complaint.category] || ''}</span>
              ${complaint.category}
            </strong>
          </div>
          <div class="meta-item">
            <span class="meta-label">Location / Ward</span>
            <strong class="meta-val">${complaint.location}</strong>
          </div>
          <div class="meta-item">
            <span class="meta-label">Assigned Department</span>
            <strong class="meta-val">${complaint.department || 'General Administration'}</strong>
          </div>
          <div class="meta-item">
            <span class="meta-label">Field Officer</span>
            <strong class="meta-val">${complaint.assignedOfficer || 'Under Allocation'}</strong>
          </div>
          <div class="meta-item">
            <span class="meta-label">Logged On</span>
            <strong class="meta-val">${UIService.formatDateTime(complaint.createdAt)}</strong>
          </div>
          <div class="meta-item">
            <span class="meta-label">Last Updated</span>
            <strong class="meta-val">${UIService.formatDateTime(complaint.updatedAt)}</strong>
          </div>
        </div>

        <div class="tracking-desc-block">
          <span class="meta-label">Description of Problem:</span>
          <p class="tracking-desc-text">${complaint.description}</p>
          ${complaint.landmark ? `<p class="tracking-landmark"><strong>Landmark:</strong> ${complaint.landmark}</p>` : ''}
        </div>

        ${photoHtml}

        <div class="tracking-activity-block">
          <div class="tracking-section-title">
            <h4>Official Activity Log & Updates</h4>
          </div>
          ${UIService.renderActivityLog(complaint.timeline)}
        </div>

        <div class="tracking-card-footer">
          <button class="btn btn-outline-secondary btn-sm" id="btn-print-tracking">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print Status Receipt
          </button>
          <button class="btn btn-outline-primary btn-sm" id="btn-copy-tracking-link">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            Copy Tracking Link
          </button>
          <button class="btn btn-primary btn-sm" id="btn-view-in-dashboard">
            View in Citizen Portal
          </button>
        </div>
      </div>
    `;

    // Attach listeners
    container.querySelector('#btn-print-tracking')?.addEventListener('click', () => {
      window.print();
    });

    container.querySelector('#btn-copy-tracking-link')?.addEventListener('click', () => {
      const url = `${window.location.origin}${window.location.pathname}#track?id=${complaint.id}`;
      navigator.clipboard.writeText(url).then(() => {
        UIService.toast('Tracking link copied to clipboard!', 'success');
      }).catch(() => {
        UIService.toast(`Link: ${url}`, 'info');
      });
    });

    container.querySelector('#btn-view-in-dashboard')?.addEventListener('click', () => {
      this.navigateTo('dashboard');
    });

    container.querySelectorAll('.clickable-image').forEach(img => {
      img.addEventListener('click', () => {
        this.openImageLightbox(img.getAttribute('data-src'), `Evidence Photo for ${complaint.id}`);
      });
    });
  },

  // ==========================================
  // CITIZEN DASHBOARD CONTROLLER
  // ==========================================
  setupCitizenDashboard() {
    // Dynamic greeting based on current local hour
    const hour = new Date().getHours();
    let greeting = 'Good morning, Citizen 👋';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon, Citizen 👋';
    else if (hour >= 17) greeting = 'Good evening, Citizen 👋';

    const greetingEl = document.getElementById('citizen-greeting');
    if (greetingEl) greetingEl.textContent = greeting;

    // Filters and search listeners
    const searchInput = document.getElementById('dash-search-input');
    const catFilter = document.getElementById('dash-filter-category');
    const statusFilter = document.getElementById('dash-filter-status');
    const prioFilter = document.getElementById('dash-filter-priority');
    const sortSelect = document.getElementById('dash-sort-select');
    const viewGridBtn = document.getElementById('dash-view-grid');
    const viewTableBtn = document.getElementById('dash-view-table');

    searchInput?.addEventListener('input', (e) => {
      this.dashboardFilters.search = e.target.value.toLowerCase().trim();
      this.renderCitizenComplaintsList();
    });

    catFilter?.addEventListener('change', (e) => {
      this.dashboardFilters.category = e.target.value;
      this.renderCitizenComplaintsList();
    });

    statusFilter?.addEventListener('change', (e) => {
      this.dashboardFilters.status = e.target.value;
      this.renderCitizenComplaintsList();
    });

    prioFilter?.addEventListener('change', (e) => {
      this.dashboardFilters.priority = e.target.value;
      this.renderCitizenComplaintsList();
    });

    sortSelect?.addEventListener('change', (e) => {
      this.dashboardFilters.sort = e.target.value;
      this.renderCitizenComplaintsList();
    });

    viewGridBtn?.addEventListener('click', () => {
      this.dashboardFilters.viewMode = 'grid';
      viewGridBtn.classList.add('is-active');
      viewTableBtn?.classList.remove('is-active');
      this.renderCitizenComplaintsList();
    });

    viewTableBtn?.addEventListener('click', () => {
      this.dashboardFilters.viewMode = 'table';
      viewTableBtn.classList.add('is-active');
      viewGridBtn?.classList.remove('is-active');
      this.renderCitizenComplaintsList();
    });

    // Reset filters button
    document.getElementById('dash-clear-filters-btn')?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (catFilter) catFilter.value = 'all';
      if (statusFilter) statusFilter.value = 'all';
      if (prioFilter) prioFilter.value = 'all';
      if (sortSelect) sortSelect.value = 'newest';

      this.dashboardFilters.search = '';
      this.dashboardFilters.category = 'all';
      this.dashboardFilters.status = 'all';
      this.dashboardFilters.priority = 'all';
      this.dashboardFilters.sort = 'newest';

      this.renderCitizenComplaintsList();
      UIService.toast('Filters cleared', 'info');
    });
  },

  renderCitizenDashboard() {
    const stats = StorageService.getStatistics();

    // Summary cards
    const dashTotal = document.getElementById('dash-stat-total');
    const dashPending = document.getElementById('dash-stat-pending');
    const dashProgress = document.getElementById('dash-stat-progress');
    const dashResolved = document.getElementById('dash-stat-resolved');

    if (dashTotal) UIService.animateCounter(dashTotal, stats.total);
    if (dashPending) UIService.animateCounter(dashPending, stats.pending);
    if (dashProgress) UIService.animateCounter(dashProgress, stats.inProgress + stats.underReview);
    if (dashResolved) UIService.animateCounter(dashResolved, stats.resolved);

    this.renderCitizenComplaintsList();
  },

  getFilteredComplaints(complaints, filters) {
    let result = [...complaints];

    // Search filter
    if (filters.search) {
      const q = filters.search;
      result = result.filter(c => 
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.name && c.name.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter(c => c.category === filters.category);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter(c => c.status === filters.status);
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter(c => c.priority === filters.priority);
    }

    // Sorting
    const priorityWeights = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };

    if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filters.sort === 'priority-high') {
      result.sort((a, b) => (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0));
    } else if (filters.sort === 'priority-low') {
      result.sort((a, b) => (priorityWeights[a.priority] || 0) - (priorityWeights[b.priority] || 0));
    }

    return result;
  },

  renderCitizenComplaintsList() {
    const tableContainer = document.getElementById('dash-table-container');
    const gridContainer = document.getElementById('dash-grid-container');
    const emptyState = document.getElementById('dash-empty-state');
    const resultsCountEl = document.getElementById('dash-results-count');

    const allComplaints = StorageService.getComplaints();
    const filtered = this.getFilteredComplaints(allComplaints, this.dashboardFilters);

    if (resultsCountEl) {
      resultsCountEl.textContent = `Showing ${filtered.length} of ${allComplaints.length} complaints`;
    }

    if (filtered.length === 0) {
      if (tableContainer) tableContainer.style.display = 'none';
      if (gridContainer) gridContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (this.dashboardFilters.viewMode === 'grid') {
      if (tableContainer) tableContainer.style.display = 'none';
      if (gridContainer) {
        gridContainer.style.display = 'grid';
        gridContainer.innerHTML = filtered.map(c => `
          <div class="card citizen-issue-card">
            <div class="citizen-card-head">
              <span class="cat-pill">
                ${UIService.icons.categoryIcons[c.category] || ''} ${c.category}
              </span>
              ${UIService.renderPriorityBadge(c.priority)}
            </div>
            <h4 class="citizen-card-title">${c.title}</h4>
            <p class="citizen-card-loc">${UIService.icons.mapPin} ${c.location}</p>
            <div class="citizen-card-mid">
              <span class="code-id">${c.id}</span>
              ${UIService.renderStatusBadge(c.status)}
            </div>
            <div class="citizen-card-date">
              <small class="text-muted">Submitted ${UIService.formatRelativeTime(c.createdAt)}</small>
            </div>
            <div class="citizen-card-actions">
              <button class="btn btn-xs btn-outline-primary view-details-trigger" data-id="${c.id}">View Details</button>
              <button class="btn btn-xs btn-outline-secondary track-issue-trigger" data-id="${c.id}">Track</button>
              <button class="btn btn-xs btn-outline-danger delete-issue-trigger" data-id="${c.id}" title="Delete complaint">Delete</button>
            </div>
          </div>
        `).join('');
      }
    } else {
      if (gridContainer) gridContainer.style.display = 'none';
      if (tableContainer) {
        tableContainer.style.display = 'block';
        const tbody = document.getElementById('citizen-table-tbody');
        if (tbody) {
          tbody.innerHTML = filtered.map(c => `
            <tr>
              <td>
                <span class="badge-id">${c.id}</span>
              </td>
              <td>
                <div class="table-issue-wrap">
                  <strong class="table-issue-title" title="${c.title}">${c.title}</strong>
                  <span class="table-issue-loc">${c.location}</span>
                </div>
              </td>
              <td>
                <span class="table-cat-badge">
                  <span class="inline-icon">${UIService.icons.categoryIcons[c.category] || ''}</span>
                  ${c.category}
                </span>
              </td>
              <td>${UIService.renderPriorityBadge(c.priority)}</td>
              <td>${UIService.renderStatusBadge(c.status)}</td>
              <td class="text-nowrap text-muted text-sm">${UIService.formatRelativeTime(c.createdAt)}</td>
              <td>
                <div class="table-action-btns">
                  <button class="btn btn-xs btn-outline-primary view-details-trigger" data-id="${c.id}" title="View Details">
                    View
                  </button>
                  <button class="btn btn-xs btn-outline-secondary track-issue-trigger" data-id="${c.id}" title="Track Status">
                    Track
                  </button>
                  <button class="btn btn-xs btn-ghost-danger delete-issue-trigger" data-id="${c.id}" title="Delete Record">
                    &times;
                  </button>
                </div>
              </td>
            </tr>
          `).join('');
        }
      }
    }

    // Attach event delegation for action buttons
    document.querySelectorAll('.view-details-trigger').forEach(btn => {
      btn.onclick = () => this.openComplaintDetailModal(btn.getAttribute('data-id'));
    });

    document.querySelectorAll('.track-issue-trigger').forEach(btn => {
      btn.onclick = () => this.navigateTo('track', { id: btn.getAttribute('data-id') });
    });

    document.querySelectorAll('.delete-issue-trigger').forEach(btn => {
      btn.onclick = () => this.openDeleteConfirmModal(btn.getAttribute('data-id'));
    });
  },

  // ==========================================
  // ADMIN DASHBOARD & ANALYTICS CONTROLLER
  // ==========================================
  setupAdminDashboard() {
    const searchInput = document.getElementById('admin-search-input');
    const catFilter = document.getElementById('admin-filter-category');
    const statusFilter = document.getElementById('admin-filter-status');

    searchInput?.addEventListener('input', (e) => {
      this.adminFilters.search = e.target.value.toLowerCase().trim();
      this.renderAdminComplaintsTable();
    });

    catFilter?.addEventListener('change', (e) => {
      this.adminFilters.category = e.target.value;
      this.renderAdminComplaintsTable();
    });

    statusFilter?.addEventListener('change', (e) => {
      this.adminFilters.status = e.target.value;
      this.renderAdminComplaintsTable();
    });

    // Export CSV
    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      const csv = StorageService.exportCSV();
      this.downloadFile(csv, `civicfix_complaints_${Date.now()}.csv`, 'text/csv');
      UIService.toast('Complaints exported as CSV', 'success');
    });

    // Export JSON
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const json = StorageService.exportJSON();
      this.downloadFile(json, `civicfix_complaints_${Date.now()}.json`, 'application/json');
      UIService.toast('Complaints exported as JSON', 'success');
    });

    // Reset Demo Data
    document.getElementById('btn-reset-demo-data')?.addEventListener('click', () => {
      this.openResetDemoModal();
    });
  },

  renderAdminDashboard() {
    const stats = StorageService.getStatistics();

    // Summary KPI counters
    const kpiTotal = document.getElementById('admin-kpi-total');
    const kpiPending = document.getElementById('admin-kpi-pending');
    const kpiReview = document.getElementById('admin-kpi-review');
    const kpiProgress = document.getElementById('admin-kpi-progress');
    const kpiResolved = document.getElementById('admin-kpi-resolved');
    const kpiRate = document.getElementById('admin-kpi-rate');

    if (kpiTotal) UIService.animateCounter(kpiTotal, stats.total);
    if (kpiPending) UIService.animateCounter(kpiPending, stats.submitted);
    if (kpiReview) UIService.animateCounter(kpiReview, stats.underReview + stats.assigned);
    if (kpiProgress) UIService.animateCounter(kpiProgress, stats.inProgress);
    if (kpiResolved) UIService.animateCounter(kpiResolved, stats.resolved);
    if (kpiRate) kpiRate.textContent = `${stats.resolutionRate}%`;

    // Visualizations
    const catChartContainer = document.getElementById('admin-chart-category');
    if (catChartContainer) {
      catChartContainer.innerHTML = UIService.renderCategoryChart(stats.byCategory, stats.total);
    }

    const statusChartContainer = document.getElementById('admin-chart-status');
    if (statusChartContainer) {
      statusChartContainer.innerHTML = UIService.renderStatusDonutChart(stats.byStatus, stats.total);
    }

    const prioChartContainer = document.getElementById('admin-chart-priority');
    if (prioChartContainer) {
      prioChartContainer.innerHTML = UIService.renderPriorityBar(stats.byPriority, stats.total);
    }

    const trendChartContainer = document.getElementById('admin-chart-trend');
    if (trendChartContainer) {
      trendChartContainer.innerHTML = UIService.renderWeeklyTrendChart();
    }

    this.renderAdminComplaintsTable();
  },

  renderAdminComplaintsTable() {
    const tbody = document.getElementById('admin-table-tbody');
    const emptyState = document.getElementById('admin-table-empty');
    if (!tbody) return;

    const allComplaints = StorageService.getComplaints();
    let filtered = [...allComplaints];

    if (this.adminFilters.search) {
      const q = this.adminFilters.search;
      filtered = filtered.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.name && c.name.toLowerCase().includes(q))
      );
    }

    if (this.adminFilters.category !== 'all') {
      filtered = filtered.filter(c => c.category === this.adminFilters.category);
    }

    if (this.adminFilters.status !== 'all') {
      filtered = filtered.filter(c => c.status === this.adminFilters.status);
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const statuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

    tbody.innerHTML = filtered.map(c => `
      <tr>
        <td>
          <span class="badge-id">${c.id}</span>
        </td>
        <td>
          <div class="admin-user-cell">
            <strong>${c.name}</strong>
            <small class="text-muted">${c.phone}</small>
          </div>
        </td>
        <td>
          <div class="admin-issue-cell">
            <strong class="issue-title" title="${c.title}">${c.title}</strong>
            <span class="text-xs text-muted">${c.location}</span>
          </div>
        </td>
        <td>
          <span class="table-cat-badge">
            <span class="inline-icon">${UIService.icons.categoryIcons[c.category] || ''}</span>
            ${c.category}
          </span>
        </td>
        <td>${UIService.renderPriorityBadge(c.priority)}</td>
        <td>
          <select class="form-select form-select-xs admin-status-changer" data-id="${c.id}" aria-label="Change status for ${c.id}">
            ${statuses.map(st => `
              <option value="${st}" ${c.status === st ? 'selected' : ''}>${st}</option>
            `).join('')}
          </select>
        </td>
        <td class="text-nowrap text-xs text-muted">${UIService.formatDateTime(c.createdAt)}</td>
        <td>
          <div class="table-action-btns">
            <button class="btn btn-xs btn-outline-primary view-details-trigger" data-id="${c.id}" title="View Details">
              View
            </button>
            <button class="btn btn-xs btn-outline-danger delete-issue-trigger" data-id="${c.id}" title="Delete Record">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach inline status change listeners
    tbody.querySelectorAll('.admin-status-changer').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-id');
        const newStatus = e.target.value;
        this.openStatusChangeModal(id, newStatus, select);
      });
    });

    // Attach view and delete listeners
    tbody.querySelectorAll('.view-details-trigger').forEach(btn => {
      btn.onclick = () => this.openComplaintDetailModal(btn.getAttribute('data-id'));
    });

    tbody.querySelectorAll('.delete-issue-trigger').forEach(btn => {
      btn.onclick = () => this.openDeleteConfirmModal(btn.getAttribute('data-id'));
    });
  },

  // ==========================================
  // MODALS CONTROLLER
  // ==========================================
  setupModals() {
    // Backdrop clicks close active modals
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          UIService.closeModal(overlay.id);
        }
      });
    });

    // Close buttons
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) UIService.closeModal(modal.id);
      });
    });
  },

  openComplaintDetailModal(id) {
    const complaint = StorageService.getComplaintById(id);
    if (!complaint) {
      UIService.toast('Complaint details could not be retrieved.', 'error');
      return;
    }

    const body = document.getElementById('modal-detail-body');
    if (!body) return;

    const photoHtml = complaint.imageUrl ? `
      <div class="modal-detail-photo mb-3">
        <label class="detail-label">Attached Photographic Evidence:</label>
        <div class="detail-photo-wrap">
          <img src="${complaint.imageUrl}" alt="Photo evidence" class="clickable-image" data-src="${complaint.imageUrl}"/>
        </div>
      </div>
    ` : '';

    body.innerHTML = `
      <div class="modal-detail-header-card">
        <div class="flex-between align-center mb-2">
          <span class="badge-id-large">${complaint.id}</span>
          <div class="flex-gap-2">
            ${UIService.renderStatusBadge(complaint.status)}
            ${UIService.renderPriorityBadge(complaint.priority)}
          </div>
        </div>
        <h3 class="detail-modal-title">${complaint.title}</h3>
        <p class="detail-modal-loc">${UIService.icons.mapPin} ${complaint.location}</p>
      </div>

      <div class="modal-detail-grid">
        <div class="detail-grid-item">
          <span class="label">Citizen Name</span>
          <strong>${complaint.name}</strong>
        </div>
        <div class="detail-grid-item">
          <span class="label">Contact Phone</span>
          <strong>${complaint.phone}</strong>
        </div>
        <div class="detail-grid-item">
          <span class="label">Category</span>
          <strong>${complaint.category}</strong>
        </div>
        <div class="detail-grid-item">
          <span class="label">Department</span>
          <strong>${complaint.department || 'Municipal Works'}</strong>
        </div>
        <div class="detail-grid-item">
          <span class="label">Assigned Officer</span>
          <strong>${complaint.assignedOfficer || 'Under Allocation'}</strong>
        </div>
        <div class="detail-grid-item">
          <span class="label">Lodged Date</span>
          <strong>${UIService.formatDateTime(complaint.createdAt)}</strong>
        </div>
      </div>

      <div class="modal-detail-desc mb-3">
        <label class="detail-label">Problem Description:</label>
        <p class="desc-content">${complaint.description}</p>
        ${complaint.landmark ? `<p class="landmark-content mt-1"><strong>Landmark:</strong> ${complaint.landmark}</p>` : ''}
      </div>

      ${photoHtml}

      <div class="modal-detail-timeline-block">
        <label class="detail-label">Resolution Progress Timeline:</label>
        ${UIService.renderWorkflowTimeline(complaint.status, complaint.timeline)}
      </div>

      <div class="modal-detail-activity-block mt-3">
        <label class="detail-label">Recorded Audit Logs:</label>
        ${UIService.renderActivityLog(complaint.timeline)}
      </div>
    `;

    body.querySelectorAll('.clickable-image').forEach(img => {
      img.addEventListener('click', () => {
        this.openImageLightbox(img.getAttribute('data-src'), `Evidence for ${complaint.id}`);
      });
    });

    const trackBtn = document.getElementById('modal-detail-track-btn');
    if (trackBtn) {
      trackBtn.onclick = () => {
        UIService.closeModal('modal-complaint-detail');
        this.navigateTo('track', { id: complaint.id });
      };
    }

    UIService.openModal('modal-complaint-detail');
  },

  openStatusChangeModal(id, newStatus, selectElement) {
    const complaint = StorageService.getComplaintById(id);
    if (!complaint) return;

    const modal = document.getElementById('modal-status-update');
    const idEl = document.getElementById('status-modal-id');
    const oldStatusEl = document.getElementById('status-modal-current');
    const newStatusEl = document.getElementById('status-modal-new');
    const noteInput = document.getElementById('status-modal-note');
    const confirmBtn = document.getElementById('status-modal-confirm-btn');
    const cancelBtn = document.getElementById('status-modal-cancel-btn');

    if (idEl) idEl.textContent = complaint.id;
    if (oldStatusEl) oldStatusEl.innerHTML = UIService.renderStatusBadge(complaint.status);
    if (newStatusEl) newStatusEl.innerHTML = UIService.renderStatusBadge(newStatus);
    if (noteInput) noteInput.value = '';

    const handleConfirm = () => {
      const note = noteInput ? noteInput.value.trim() : '';
      StorageService.updateComplaintStatus(id, newStatus, note);
      UIService.closeModal('modal-status-update');
      this.refreshAllData();
      UIService.toast(`Updated complaint ${id} to ${newStatus}`, 'success');
      cleanup();
    };

    const handleCancel = () => {
      if (selectElement) selectElement.value = complaint.status;
      UIService.closeModal('modal-status-update');
      cleanup();
    };

    const cleanup = () => {
      if (confirmBtn) confirmBtn.onclick = null;
      if (cancelBtn) cancelBtn.onclick = null;
    };

    if (confirmBtn) confirmBtn.onclick = handleConfirm;
    if (cancelBtn) cancelBtn.onclick = handleCancel;

    UIService.openModal('modal-status-update');
  },

  openDeleteConfirmModal(id) {
    const complaint = StorageService.getComplaintById(id);
    if (!complaint) return;

    const idEl = document.getElementById('delete-modal-id');
    const titleEl = document.getElementById('delete-modal-title');
    const confirmBtn = document.getElementById('delete-modal-confirm-btn');

    if (idEl) idEl.textContent = complaint.id;
    if (titleEl) titleEl.textContent = complaint.title;

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        const success = StorageService.deleteComplaint(id);
        UIService.closeModal('modal-delete-confirm');
        if (success) {
          this.refreshAllData();
          UIService.toast(`Complaint ${id} removed permanently.`, 'info');
        } else {
          UIService.toast('Could not delete record.', 'error');
        }
      };
    }

    UIService.openModal('modal-delete-confirm');
  },

  openResetDemoModal() {
    const confirmBtn = document.getElementById('reset-demo-confirm-btn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        StorageService.resetToDemo();
        UIService.closeModal('modal-reset-demo');
        this.refreshAllData();
        UIService.toast('Sample complaints restored successfully!', 'success');
      };
    }
    UIService.openModal('modal-reset-demo');
  },

  openImageLightbox(src, caption = '') {
    const imgEl = document.getElementById('lightbox-image');
    const capEl = document.getElementById('lightbox-caption');
    if (imgEl) imgEl.src = src;
    if (capEl) capEl.textContent = caption;
    UIService.openModal('modal-lightbox');
  },

  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

window.App = App;

