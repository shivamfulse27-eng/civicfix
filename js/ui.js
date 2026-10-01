/**
 * CivicFix - UI System & Component Renderers
 * Handles Modals, Toasts, Charts (pure SVG/CSS), Status Timelines, Badges, and Formatters.
 */

const UIService = {
  // SVG Icon definitions for easy inline embedding
  icons: {
    checkCircle: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    info: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    alertTriangle: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    xCircle: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    clock: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    mapPin: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    categoryIcons: {
      'Water Supply': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
      'Sanitation': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/></svg>`,
      'Garbage Collection': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
      'Road Damage': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19L9 5h6l5 14H4z"/><line x1="12" y1="9" x2="12" y2="11"/><line x1="12" y1="14" x2="12" y2="16"/></svg>`,
      'Streetlight': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2h6l2 7H7l2-7z"/><path d="M12 9v13"/><path d="M9 22h6"/><path d="M5 9h14"/></svg>`,
      'Electricity': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      'Drainage': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="10" y1="4" x2="10" y2="20"/></svg>`,
      'Public Safety': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      'Other': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    }
  },

  /**
   * Toast Notification Controller
   */
  toast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const iconHtml = {
      success: this.icons.checkCircle,
      info: this.icons.info,
      warning: this.icons.alertTriangle,
      error: this.icons.xCircle
    }[type] || this.icons.info;

    const defaultTitles = {
      success: 'Success',
      info: 'Information',
      warning: 'Attention',
      error: 'Error'
    };

    toast.innerHTML = `
      <div class="toast-icon-wrap">${iconHtml}</div>
      <div class="toast-body">
        <strong class="toast-title">${title || defaultTitles[type]}</strong>
        <p class="toast-text">${message}</p>
      </div>
      <button type="button" class="toast-close-btn" aria-label="Close notification">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    const dismiss = () => {
      toast.classList.add('toast-leaving');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);

    // Auto-dismiss after 4.5s
    const timer = setTimeout(dismiss, 4500);

    // Pause dismiss on hover
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => setTimeout(dismiss, 2000));

    container.appendChild(toast);
  },

  /**
   * Modal Management
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('is-active');
    document.body.classList.add('modal-open');

    // Accessibility focus trap & Escape key
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        UIService.closeModal(modalId);
        document.removeEventListener('keydown', onKeyDown);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    modal._escListener = onKeyDown;
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('is-active');
    document.body.classList.remove('modal-open');
    if (modal._escListener) {
      document.removeEventListener('keydown', modal._escListener);
      delete modal._escListener;
    }
  },

  closeAllModals() {
    const activeModals = document.querySelectorAll('.modal-overlay.is-active');
    activeModals.forEach(m => m.classList.remove('is-active'));
    document.body.classList.remove('modal-open');
  },

  /**
   * Status Badge renderer with color coding
   */
  renderStatusBadge(status) {
    const statusMap = {
      'Submitted': { class: 'status-submitted', label: 'Submitted' },
      'Under Review': { class: 'status-review', label: 'Under Review' },
      'Assigned': { class: 'status-assigned', label: 'Assigned' },
      'In Progress': { class: 'status-progress', label: 'In Progress' },
      'Resolved': { class: 'status-resolved', label: 'Resolved' },
      'Rejected': { class: 'status-rejected', label: 'Rejected' }
    };

    const conf = statusMap[status] || { class: 'status-submitted', label: status };
    return `<span class="status-pill ${conf.class}"><span class="status-dot"></span>${conf.label}</span>`;
  },

  /**
   * Priority Badge renderer
   */
  renderPriorityBadge(priority) {
    const p = (priority || 'Medium').toLowerCase();
    return `<span class="priority-badge priority-${p}">${priority}</span>`;
  },

  /**
   * Relative or formatted time helper
   */
  formatDateTime(isoDate) {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatRelativeTime(isoDate) {
    if (!isoDate) return '';
    const now = Date.now();
    const then = new Date(isoDate).getTime();
    const diffHours = Math.floor((now - then) / 3600000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return new Date(isoDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  },

  /**
   * Visual Tracking Workflow Timeline
   * Status steps: Submitted -> Under Review -> Assigned -> In Progress -> Resolved
   */
  renderWorkflowTimeline(currentStatus, timelineEvents = []) {
    const workflowStages = [
      { key: 'Submitted', label: 'Submitted', desc: 'Complaint registered by citizen' },
      { key: 'Under Review', label: 'Under Review', desc: 'Verified by ward desk' },
      { key: 'Assigned', label: 'Assigned', desc: 'Work order allocated to crew' },
      { key: 'In Progress', label: 'In Progress', desc: 'Ground repair active' },
      { key: 'Resolved', label: 'Resolved', desc: 'Work completed & inspected' }
    ];

    const isRejected = currentStatus === 'Rejected';

    if (isRejected) {
      return `
        <div class="timeline-rejected-notice">
          <div class="notice-icon">${this.icons.xCircle}</div>
          <div>
            <h4>Complaint File Closed / Rejected</h4>
            <p>This complaint could not be processed further by the municipal authority. Review the activity notes below for reasoning.</p>
          </div>
        </div>
      `;
    }

    const currentIndex = workflowStages.findIndex(s => s.key === currentStatus);
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    let stepsHtml = workflowStages.map((stage, idx) => {
      let state = 'upcoming';
      if (idx < activeIndex) {
        state = 'completed';
      } else if (idx === activeIndex) {
        state = 'current';
      }

      // Find matching timeline event date if available
      const matchingEvent = (timelineEvents || []).find(e => e.status === stage.key);
      const eventTime = matchingEvent ? this.formatDateTime(matchingEvent.timestamp) : '';

      return `
        <div class="timeline-step step-${state}">
          <div class="step-indicator">
            <span class="step-circle">
              ${state === 'completed' ? this.icons.checkCircle : (idx + 1)}
            </span>
            ${idx < workflowStages.length - 1 ? '<span class="step-line"></span>' : ''}
          </div>
          <div class="step-content">
            <div class="step-label">${stage.label}</div>
            <div class="step-desc">${stage.desc}</div>
            ${eventTime ? `<div class="step-time">${this.icons.clock} ${eventTime}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="workflow-timeline-wrapper">
        <div class="workflow-timeline-steps">
          ${stepsHtml}
        </div>
      </div>
    `;
  },

  /**
   * Detailed Activity Log Renderer
   */
  renderActivityLog(timelineEvents = []) {
    if (!timelineEvents || timelineEvents.length === 0) {
      return `<p class="text-muted text-sm">No activity records logged yet.</p>`;
    }

    // Sort newest first
    const sorted = [...timelineEvents].reverse();

    const items = sorted.map((item, index) => {
      const isLatest = index === 0;
      return `
        <div class="activity-log-item ${isLatest ? 'is-latest' : ''}">
          <div class="log-bullet"></div>
          <div class="log-card">
            <div class="log-header">
              <span class="log-title">${item.title || item.status}</span>
              <span class="log-time">${this.formatDateTime(item.timestamp)}</span>
            </div>
            <p class="log-note">${item.note || ''}</p>
            <div class="log-meta">
              <span class="log-actor">By: <strong>${item.actor || 'Authority'}</strong></span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `<div class="activity-log-timeline">${items}</div>`;
  },

  /**
   * SVG Chart Renderers (Pure Vanilla CSS + SVG, reactive & resilient)
   */
  renderCategoryChart(byCategory, total) {
    const entries = Object.entries(byCategory);
    if (entries.length === 0 || total === 0) {
      return `<div class="chart-empty-state">No category distribution data available.</div>`;
    }

    // Sort by count descending
    entries.sort((a, b) => b[1] - a[1]);

    const barsHtml = entries.map(([category, count]) => {
      const pct = Math.round((count / total) * 100);
      const icon = this.icons.categoryIcons[category] || this.icons.categoryIcons['Other'];
      return `
        <div class="chart-bar-row">
          <div class="chart-bar-label">
            <span class="cat-icon-mini">${icon}</span>
            <span class="cat-name">${category}</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${Math.max(pct, 4)}%;"></div>
          </div>
          <div class="chart-bar-metric">
            <strong>${count}</strong>
            <span class="metric-pct">(${pct}%)</span>
          </div>
        </div>
      `;
    }).join('');

    return `<div class="chart-category-container">${barsHtml}</div>`;
  },

  /**
   * SVG Status Donut Chart with Legend
   */
  renderStatusDonutChart(byStatus, total) {
    if (total === 0) {
      return `<div class="chart-empty-state">No status distribution data available.</div>`;
    }

    const statusConfig = [
      { key: 'Resolved', color: '#10b981', label: 'Resolved' },
      { key: 'In Progress', color: '#f59e0b', label: 'In Progress' },
      { key: 'Assigned', color: '#06b6d4', label: 'Assigned' },
      { key: 'Under Review', color: '#8b5cf6', label: 'Under Review' },
      { key: 'Submitted', color: '#3b82f6', label: 'Submitted' },
      { key: 'Rejected', color: '#ef4444', label: 'Rejected' }
    ];

    let cumulativePct = 0;
    const slices = [];

    statusConfig.forEach(item => {
      const count = byStatus[item.key] || 0;
      if (count > 0) {
        const pct = (count / total) * 100;
        slices.push({
          ...item,
          count,
          pct,
          startAngle: cumulativePct * 3.6,
          angle: pct * 3.6
        });
        cumulativePct += pct;
      }
    });

    // Generate SVG conic path or segments
    const radius = 64;
    const center = 80;
    const circumference = 2 * Math.PI * radius; // approx 402.12
    let strokeOffset = 0;

    const circlesHtml = slices.map(s => {
      const strokeLength = (s.pct / 100) * circumference;
      const html = `
        <circle 
          cx="${center}" 
          cy="${center}" 
          r="${radius}" 
          fill="none" 
          stroke="${s.color}" 
          stroke-width="26" 
          stroke-dasharray="${strokeLength} ${circumference}" 
          stroke-dashoffset="${-strokeOffset}"
          transform="rotate(-90 ${center} ${center})"
        >
          <title>${s.label}: ${s.count} (${Math.round(s.pct)}%)</title>
        </circle>
      `;
      strokeOffset += strokeLength;
      return html;
    }).join('');

    const legendHtml = slices.map(s => `
      <div class="donut-legend-item">
        <span class="legend-color-box" style="background-color: ${s.color};"></span>
        <span class="legend-label">${s.label}</span>
        <strong class="legend-count">${s.count} <small>(${Math.round(s.pct)}%)</small></strong>
      </div>
    `).join('');

    return `
      <div class="donut-chart-container">
        <div class="donut-svg-wrap">
          <svg viewBox="0 0 160 160" width="160" height="160" class="donut-svg">
            ${circlesHtml}
            <circle cx="${center}" cy="${center}" r="48" fill="#ffffff"/>
            <text x="${center}" y="${center - 4}" text-anchor="middle" font-size="20" font-weight="700" fill="#0f172a">${total}</text>
            <text x="${center}" y="${center + 14}" text-anchor="middle" font-size="10" font-weight="500" fill="#64748b">TOTAL</text>
          </svg>
        </div>
        <div class="donut-legend">
          ${legendHtml}
        </div>
      </div>
    `;
  },

  /**
   * Priority Distribution Bar
   */
  renderPriorityBar(byPriority, total) {
    if (total === 0) return '';
    const priorities = [
      { key: 'Critical', color: '#ef4444', label: 'Critical' },
      { key: 'High', color: '#f97316', label: 'High' },
      { key: 'Medium', color: '#3b82f6', label: 'Medium' },
      { key: 'Low', color: '#64748b', label: 'Low' }
    ];

    const segments = priorities.map(p => {
      const count = byPriority[p.key] || 0;
      const pct = Math.round((count / total) * 100);
      return { ...p, count, pct };
    });

    const barSegments = segments.filter(s => s.count > 0).map(s => `
      <div class="prio-segment" style="width: ${s.pct}%; background-color: ${s.color};" title="${s.label}: ${s.count} (${s.pct}%)"></div>
    `).join('');

    const legendItems = segments.map(s => `
      <div class="prio-legend-item">
        <span class="prio-dot" style="background-color: ${s.color};"></span>
        <span>${s.label}: <strong>${s.count}</strong></span>
      </div>
    `).join('');

    return `
      <div class="priority-chart-wrapper">
        <div class="priority-multi-bar">${barSegments}</div>
        <div class="priority-bar-legend">${legendItems}</div>
      </div>
    `;
  },

  /**
   * Weekly Trend SVG Bar Chart
   */
  renderWeeklyTrendChart() {
    // Generate 7-day realistic comparison
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const incomingData = [4, 6, 8, 5, 9, 3, 5];
    const resolvedData = [3, 5, 7, 4, 8, 2, 4];
    const maxVal = 10;

    const chartBars = days.map((day, i) => {
      const incH = (incomingData[i] / maxVal) * 90;
      const resH = (resolvedData[i] / maxVal) * 90;
      return `
        <div class="trend-col">
          <div class="trend-bars-pair">
            <div class="trend-bar trend-inflow" style="height: ${incH}px;" title="${incomingData[i]} Logged"></div>
            <div class="trend-bar trend-resolved" style="height: ${resH}px;" title="${resolvedData[i]} Resolved"></div>
          </div>
          <span class="trend-day-label">${day}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="trend-chart-container">
        <div class="trend-chart-header">
          <div class="trend-legend">
            <span class="trend-badge-legend incoming-indicator"></span> <span>Reported Complaints</span>
            <span class="trend-badge-legend resolved-indicator"></span> <span>Resolved Complaints</span>
          </div>
        </div>
        <div class="trend-bars-wrap">
          ${chartBars}
        </div>
      </div>
    `;
  },

  /**
   * Smooth number counter animation
   */
  animateCounter(element, target, duration = 800) {
    if (!element) return;
    const start = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
    const diff = target - start;
    if (diff === 0) {
      element.textContent = target;
      return;
    }

    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      const eased = progress * (2 - progress);
      const current = Math.round(start + diff * eased);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    };
    requestAnimationFrame(update);
  }
};

window.UIService = UIService;

