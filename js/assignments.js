/* ============================================
   مُعلّمي | assignments.js
   الواجبات + التسليمات + المتابعة
   ============================================ */

const Assignments = {
  render() {
    const assignments = Storage.list(Storage.KEYS.assignments);
    const today = new Date().toISOString().slice(0, 10);
    const active = assignments.filter(a => a.dueDate >= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const past = assignments.filter(a => a.dueDate < today).sort((a, b) => b.dueDate.localeCompare(a.dueDate));

    return `
      <div class="page-header">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h1 class="page-title">الواجبات</h1>
            <p class="page-subtitle">${assignments.length} واجب</p>
          </div>
          <button class="btn btn-primary" onclick="Assignments.openAddForm()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            واجب
          </button>
        </div>
      </div>

      <div class="tabs" id="assignments-tabs">
        <button class="tab active" data-tab="active">نشط (${active.length})</button>
        <button class="tab" data-tab="past">منتهي (${past.length})</button>
      </div>

      <div id="assignments-tab-content">
        ${this.renderList(active, 'لا توجد واجبات نشطة', 'أضف واجبًا للمجموعات.')}
      </div>
    `;
  },

  bind() {
    const tabs = document.querySelectorAll('#assignments-tabs .tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.toggle('active', t === tab));
        const t = tab.dataset.tab;
        const today = new Date().toISOString().slice(0, 10);
        const assignments = Storage.list(Storage.KEYS.assignments);
        let list = [];
        if (t === 'active') list = assignments.filter(a => a.dueDate >= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        else list = assignments.filter(a => a.dueDate < today).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
        document.getElementById('assignments-tab-content').innerHTML = this.renderList(list, 'لا توجد واجبات', '');
        this.bindListEvents();
      });
    });
    this.bindListEvents();
  },

  bindListEvents() {
    document.querySelectorAll('[data-assignment]').forEach(el => {
      el.addEventListener('click', () => this.openDetail(el.dataset.assignment));
    });
  },

  renderList(assignments, emptyTitle, emptyText) {
    if (!assignments.length) return UI.emptyState('📋', emptyTitle, emptyText || '');
    return `<div class="list stagger">${assignments.map(a => this.renderCard(a)).join('')}</div>`;
  },

  renderCard(a) {
    const group = Storage.find(Storage.KEYS.groups, a.groupId);
    const subs = Storage.list(Storage.KEYS.submissions, s => s.assignmentId === a.id);
    const submitted = subs.filter(s => s.status === 'submitted' || s.status === 'reviewed').length;
    const notSubmitted = subs.filter(s => s.status === 'not_submitted' || s.status === 'late').length;
    const today = new Date().toISOString().slice(0, 10);
    const isOverdue = a.dueDate < today;
    return `
      <div class="list-item clickable" data-assignment="${a.id}">
        <div class="quick-action-icon ${isOverdue ? 'danger' : 'info'}">📋</div>
        <div class="list-item-body">
          <div class="list-item-title">${a.name}</div>
          <div class="list-item-subtitle">${group ? group.name : ''} • تسليم: ${UI.formatDate(a.dueDate)}</div>
          <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
            <span class="badge badge-success">${submitted} سلم</span>
            <span class="badge badge-danger">${notSubmitted} لم يسلم</span>
          </div>
        </div>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-tertiary); transform: scaleX(-1);"><path d="m9 18 6-6-6-6"/></svg>
      </div>
    `;
  },

  openAddForm() {
    const groups = Storage.list(Storage.KEYS.groups);
    if (groups.length === 0) {
      UI.toast('أنشئ مجموعة أولًا', 'warning');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    UI.modal({
      title: 'إضافة واجب',
      body: `
        <form id="add-assignment-form">
          <div class="field">
            <label>اسم الواجب <span class="required">*</span></label>
            <input type="text" name="name" required placeholder="مثال: حل تمارين صفحة 25">
          </div>
          <div class="field">
            <label>المجموعة <span class="required">*</span></label>
            <select name="groupId" required>
              ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>الوصف</label>
            <textarea name="description" placeholder="تفاصيل الواجب..."></textarea>
          </div>
          <div class="field">
            <label>الدرس / الوحدة</label>
            <input type="text" name="topic" placeholder="مثال: الفصل الأول">
          </div>
          <div class="field-row">
            <div class="field">
              <label>تاريخ التكليف</label>
              <input type="date" name="assignedDate" value="${today}">
            </div>
            <div class="field">
              <label>موعد التسليم <span class="required">*</span></label>
              <input type="date" name="dueDate" required value="${nextWeek}">
            </div>
          </div>
          <div class="field">
            <label>الدرجة</label>
            <input type="number" name="maxGrade" min="1" value="10">
          </div>
          <div class="action-row">
            <button type="button" class="btn btn-secondary" onclick="UI.closeModal()" style="flex:1">إلغاء</button>
            <button type="submit" class="btn btn-primary" style="flex:1">حفظ</button>
          </div>
        </form>
      `
    });

    document.getElementById('add-assignment-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      data.maxGrade = parseFloat(data.maxGrade) || 10;
      const newAssignment = Storage.insert(Storage.KEYS.assignments, data);

      // Create submissions for all active students in the group
      const students = Storage.list(Storage.KEYS.students, s => s.groupId === data.groupId && s.status === 'نشط');
      students.forEach(s => {
        Storage.insert(Storage.KEYS.submissions, {
          assignmentId: newAssignment.id,
          studentId: s.id,
          groupId: data.groupId,
          status: 'not_submitted',
          score: null,
          submittedAt: null,
          notes: ''
        });
      });

      UI.toast(`تم إنشاء الواجب لـ ${students.length} طالب`, 'success');
      UI.closeModal();
      if (App.currentPage === 'assignments') App.navigate('assignments');
    });
  },

  openDetail(assignmentId) {
    const a = Storage.find(Storage.KEYS.assignments, assignmentId);
    if (!a) return;
    const group = Storage.find(Storage.KEYS.groups, a.groupId);
    const subs = Storage.list(Storage.KEYS.submissions, s => s.assignmentId === assignmentId);
    const submitted = subs.filter(s => s.status === 'submitted' || s.status === 'reviewed').length;
    const rate = subs.length ? Math.round(submitted / subs.length * 100) : 0;

    const statusMap = {
      'submitted': ['success', 'تم التسليم', '✓'],
      'not_submitted': ['danger', 'لم يسلم', '✕'],
      'late': ['warning', 'متأخر', '⏰'],
      'reviewed': ['info', 'تمت المراجعة', '✓✓']
    };

    UI.modal({
      title: 'تفاصيل الواجب',
      body: `
        <div class="card" style="margin-bottom: var(--space-3);">
          <h3 style="font-weight:700;margin-bottom:8px;">${a.name}</h3>
          ${a.description ? `<p style="color: var(--text-secondary); font-size: var(--font-size-sm); margin-bottom: 8px;">${a.description}</p>` : ''}
          <div style="display:grid; gap:6px; font-size: var(--font-size-sm);">
            <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-tertiary);">المجموعة</span><span>${group ? group.name : '—'}</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-tertiary);">التكليف</span><span>${UI.formatDate(a.assignedDate)}</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-tertiary);">التسليم</span><span style="font-weight:700;">${UI.formatDate(a.dueDate)}</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-tertiary);">الدرجة</span><span>${a.maxGrade}</span></div>
          </div>
        </div>

        <div class="stats-grid" style="margin-bottom: var(--space-4);">
          <div class="stat-card success">
            <div class="stat-value">${submitted}</div>
            <div class="stat-label">سلم</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-value">${subs.length - submitted}</div>
            <div class="stat-label">لم يسلم</div>
          </div>
          <div class="stat-card info">
            <div class="stat-value">${rate}%</div>
            <div class="stat-label">نسبة التسليم</div>
          </div>
        </div>

        <div class="section-header" style="margin-bottom: var(--space-3);">
          <h3 class="section-title">تسليمات الطلاب</h3>
        </div>

        <div class="list">
          ${subs.map(sub => {
            const s = Storage.find(Storage.KEYS.students, sub.studentId);
            const [cls, label, icon] = statusMap[sub.status] || ['info', sub.status, '?'];
            return `
              <div class="list-item clickable" data-submission="${sub.id}">
                <div class="avatar avatar-sm">${UI.initials(s ? s.name : '؟')}</div>
                <div class="list-item-body">
                  <div class="list-item-title">${s ? s.name : '—'}</div>
                  <div class="list-item-subtitle">${sub.score != null ? sub.score + '/' + a.maxGrade : label}</div>
                </div>
                <span class="badge badge-${cls}">${icon} ${label}</span>
              </div>
            `;
          }).join('')}
        </div>
      `
    });

    document.querySelectorAll('[data-submission]').forEach(el => {
      el.addEventListener('click', () => this.openSubmissionEditor(el.dataset.submission, assignmentId));
    });
  },

  openSubmissionEditor(submissionId, assignmentId) {
    const sub = Storage.find(Storage.KEYS.submissions, submissionId);
    if (!sub) return;
    const a = Storage.find(Storage.KEYS.assignments, assignmentId);
    const s = Storage.find(Storage.KEYS.students, sub.studentId);

    UI.modal({
      title: `تسليم: ${s ? s.name : ''}`,
      body: `
        <div class="field">
          <label>الحالة</label>
          <select id="sub-status">
            <option value="not_submitted" ${sub.status === 'not_submitted' ? 'selected' : ''}>لم يسلم</option>
            <option value="submitted" ${sub.status === 'submitted' ? 'selected' : ''}>تم التسليم</option>
            <option value="late" ${sub.status === 'late' ? 'selected' : ''}>متأخر</option>
            <option value="reviewed" ${sub.status === 'reviewed' ? 'selected' : ''}>تمت المراجعة</option>
          </select>
        </div>
        <div class="field">
          <label>الدرجة (من ${a.maxGrade})</label>
          <input type="number" id="sub-score" min="0" max="${a.maxGrade}" step="0.5" value="${sub.score || ''}">
        </div>
        <div class="field">
          <label>ملاحظات</label>
          <textarea id="sub-notes">${sub.notes || ''}</textarea>
        </div>
        <div class="action-row">
          <button type="button" class="btn btn-secondary" onclick="UI.closeModal()" style="flex:1">إلغاء</button>
          <button type="button" class="btn btn-primary" id="save-sub" style="flex:1">حفظ</button>
        </div>
      `
    });

    document.getElementById('save-sub').addEventListener('click', () => {
      const status = document.getElementById('sub-status').value;
      const scoreStr = document.getElementById('sub-score').value;
      const notes = document.getElementById('sub-notes').value;
      const updates = {
        status,
        notes,
        submittedAt: (status === 'submitted' || status === 'reviewed') ? (sub.submittedAt || new Date().toISOString()) : null
      };
      if (scoreStr !== '') updates.score = parseFloat(scoreStr);
      else updates.score = null;
      Storage.update(Storage.KEYS.submissions, submissionId, updates);
      UI.toast('تم تحديث التسليم', 'success');
      UI.closeModal();
      this.openDetail(assignmentId);
    });
  }
};

window.Assignments = Assignments;
