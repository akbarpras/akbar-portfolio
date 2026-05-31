/* ============================================================
   PORTFOLIO — SUPABASE INTEGRATION
   ============================================================ */

const STATE = {
  profile: {
    name: '', role: '', bio: '', about: '', what: '',
    loc: '', birth: '', edu: '', job: '',
    status: 'Tersedia untuk proyek baru',
    photo_url: '',
    line1: 'Desainer &', line2: 'Developer',
    line3: 'yang Bercerita', line4: 'lewat Data.',
    email: '', linkedin: '', github: '', figma: '', wa: '', web: '',
    card1: { icon: '🎨', title: 'UI/UX Design', desc: 'Figma · Prototyping · User Research' },
    card2: { icon: '💻', title: 'Web Development', desc: 'HTML · CSS · JavaScript · React' },
    card3: { icon: '📊', title: 'Data Analytics', desc: 'Python · SQL · Tableau · Power BI' }
  },
  projects: [], skills: [], experience: [], documents: [],
  pendingPhoto: null
};

let currentFilter = 'all';

// ============================================================
// AUTHENTICATION
// ============================================================
function isAdmin() {
  return sessionStorage.getItem('portfolio_admin') === 'true';
}

function setAdminMode(isOn) {
  if (isOn) {
    sessionStorage.setItem('portfolio_admin', 'true');
    document.body.classList.add('admin-mode');
  } else {
    sessionStorage.removeItem('portfolio_admin');
    document.body.classList.remove('admin-mode');
  }
  const viewBadge = document.getElementById('view-badge');
  const adminBadge = document.getElementById('admin-badge');
  if (viewBadge && adminBadge) {
    viewBadge.style.display = isOn ? 'none' : 'flex';
    adminBadge.style.display = isOn ? 'flex' : 'none';
  }
}

function openLoginModal() {
  const modalBody = document.querySelector('#modal-login .modal-body');
  if (!document.getElementById('login-email')) {
    modalBody.innerHTML = `
      <p style="font-size:0.88rem;color:var(--mist);margin-bottom:20px;line-height:1.7">
        Masukkan email & password admin untuk mengedit konten portfolio.
      </p>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="login-email" placeholder="email@gmail.com"/>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="login-pw" placeholder="Password" onkeypress="if(event.key==='Enter') tryLogin()"/>
      </div>
    `;
  } else {
    document.getElementById('login-email').value = '';
    document.getElementById('login-pw').value = '';
  }
  openModal('modal-login');
  setTimeout(() => document.getElementById('login-email').focus(), 100);
}

async function tryLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-pw').value;
  if (!email || !pw) { showToast('Email dan password wajib diisi.', 'error'); return; }

  showToast('⏳ Login...', '');
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pw });
    if (error) throw error;
    setAdminMode(true);
    closeModal('modal-login');
    showToast('✓ Login berhasil! Mode Admin aktif.', 'success');
    const activePage = document.querySelector('.page.active');
    if (activePage) showPage(activePage.id.replace('page-', ''));
  } catch (err) {
    showToast('❌ Login gagal: ' + (err.message || 'Email/password salah'), 'error');
  }
}

async function logoutAdmin() {
  if (window.confirm && !confirm('Keluar dari Mode Admin?')) return;
  try { await supabaseClient.auth.signOut(); } catch(e) {}
  setAdminMode(false);
  const activePage = document.querySelector('.page.active');
  if (activePage) {
    let pageId = activePage.id.replace('page-', '');
    if (pageId === 'edit') pageId = 'home';
    showPage(pageId);
  }
  showToast('✓ Logout berhasil', 'success');
}

function requireAdmin() {
  if (!isAdmin()) {
    showToast('Login admin terlebih dahulu.', 'error');
    openLoginModal();
    return false;
  }
  return true;
}

// ============================================================
// LOAD DATA FROM SUPABASE
// ============================================================
async function loadAllData() {
  try {
    const { data: profileData } = await supabaseClient.from('profile').select('*').eq('id', 1).single();
    if (profileData) {
      Object.assign(STATE.profile, {
        name: profileData.name || '', role: profileData.role || '',
        bio: profileData.bio || '', about: profileData.about || '',
        what: profileData.what || '', loc: profileData.loc || '',
        birth: profileData.birth || '', edu: profileData.edu || '',
        job: profileData.job || '', status: profileData.status || 'Tersedia untuk proyek baru',
        photo_url: profileData.photo_url || '',
        line1: profileData.line1 || 'Desainer &', line2: profileData.line2 || 'Developer',
        line3: profileData.line3 || 'yang Bercerita', line4: profileData.line4 || 'lewat Data.',
        email: profileData.email || '', linkedin: profileData.linkedin || '',
        github: profileData.github || '', figma: profileData.figma || '',
        wa: profileData.wa || '', web: profileData.web || '',
        card1: profileData.card1 || STATE.profile.card1,
        card2: profileData.card2 || STATE.profile.card2,
        card3: profileData.card3 || STATE.profile.card3
      });
    }

    const { data: projData } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
    STATE.projects = (projData || []).map(p => ({
      id: p.id, title: p.title, cat: p.cat, status: p.status,
      desc: p.description, tools: p.tools || [],
      demo: p.demo_url, repo: p.repo_url, impact: p.impact
    }));

    const { data: skillData } = await supabaseClient.from('skills').select('*').order('created_at', { ascending: true });
    STATE.skills = (skillData || []).map(s => ({ id: s.id, name: s.name, cat: s.category, level: s.level }));

    const { data: expData } = await supabaseClient.from('experience').select('*').order('created_at', { ascending: false });
    STATE.experience = (expData || []).map(e => ({
      id: e.id, type: e.type, title: e.title, company: e.company,
      start: e.start_date, end: e.end_date, desc: e.description
    }));

    const { data: docData } = await supabaseClient.from('documents').select('*').order('uploaded_at', { ascending: false });
    STATE.documents = (docData || []).map(d => ({
      id: d.id, name: d.name, url: d.file_url, type: d.file_type, size: d.size_bytes
    }));
  } catch (err) {
    console.error('Load error:', err);
    showToast('⚠️ Gagal memuat data dari server.', 'error');
  }
}

// ============================================================
// NAVIGATION
// ============================================================
function showPage(pageId) {
  if (pageId === 'edit' && !isAdmin()) { openLoginModal(); return; }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const link = document.querySelector(`.nav-links a[data-page="${pageId}"]`);
  if (link) link.classList.add('active');
  document.querySelector('.nav-links').classList.remove('open');

  if (pageId === 'home') renderHome();
  if (pageId === 'about') renderAbout();
  if (pageId === 'projects') renderProjects();
  if (pageId === 'skills') renderSkills();
  if (pageId === 'experience') renderExperience();
  if (pageId === 'documents') renderDocuments();
  if (pageId === 'contact') renderContact();
  if (pageId === 'edit') populateEditForm();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

// ============================================================
// RENDER HOME
// ============================================================
function renderHome() {
  const p = STATE.profile;
  document.getElementById('page-title').textContent = p.name ? `${p.name} — Portofolio` : 'Portofolio';
  if (p.name) document.getElementById('nav-name-text').textContent = p.name.split(' ')[0];

  setText('h-status', p.status);
  setText('h-line1', p.line1); setText('h-line2', p.line2);
  setText('h-line3', p.line3); setText('h-line4', p.line4);
  setText('h-desc', p.bio || 'Saya menggabungkan UI/UX design, web development, dan data analytics untuk menciptakan pengalaman digital yang bermakna dan berbasis insight.');

  renderHeroCards();

  setText('st-proj', STATE.projects.length);
  setText('st-skills', STATE.skills.length);
  setText('st-exp', STATE.experience.filter(e => e.type === 'work').length);
  setText('st-docs', STATE.documents.length);
}

function renderHeroCards() {
  const container = document.getElementById('hero-skill-cards');
  if (!container) return;
  const p = STATE.profile;
  const cards = [p.card1, p.card2, p.card3].filter(c => c && c.title);
  const classes = ['ui', 'web', 'da'];
  container.innerHTML = cards.map((c, i) => `
    <div class="hero-card">
      <div class="card-icon ${classes[i] || 'ui'}">${c.icon || '✨'}</div>
      <div class="card-info">
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.desc || '')}</p>
      </div>
    </div>
  `).join('');
}

// ============================================================
// RENDER ABOUT
// ============================================================
function renderAbout() {
  const p = STATE.profile;
  const img = document.getElementById('a-photo');
  const placeholder = document.getElementById('a-placeholder');
  if (p.photo_url) {
    img.src = p.photo_url;
    img.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover';
    placeholder.style.display = 'none';
  } else {
    img.style.display = 'none';
    placeholder.style.display = 'flex';
  }
  setText('a-name', p.name || '—');
  setText('a-loc', p.loc || '—');
  setText('a-birth', p.birth || '—');
  setText('a-edu', p.edu || '—');
  setText('a-job', p.job || '—');
  setText('a-bio', p.about || 'Bio Anda akan muncul di sini setelah mengisi profil.');
  setText('a-what', p.what || 'Deskripsi bidang pekerjaan dan kegiatan Anda.');
}

// ============================================================
// PROJECTS
// ============================================================
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  const empty = document.getElementById('proj-empty');
  const filterRow = document.getElementById('proj-filters');

  const cats = ['all', ...new Set(STATE.projects.map(p => p.cat))];
  filterRow.innerHTML = cats.map(c => `
    <button class="filter-btn ${currentFilter === c ? 'active' : ''}" onclick="filterProjects('${c}', this)">
      ${c === 'all' ? 'Semua' : c}
    </button>
  `).join('');

  grid.querySelectorAll('.proj-card').forEach(el => el.remove());
  const filtered = currentFilter === 'all' ? STATE.projects : STATE.projects.filter(p => p.cat === currentFilter);

  if (filtered.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  filtered.forEach(proj => {
    const realIndex = STATE.projects.indexOf(proj);
    grid.appendChild(createProjectCard(proj, realIndex));
  });
}

function createProjectCard(proj, index) {
  const thumbEmojis = { 'UI/UX': '🎨', 'Web': '💻', 'Data': '📊', 'Mobile': '📱', 'Lainnya': '📁' };
  const thumbClass = {
    'UI/UX': 'proj-thumb-uiux', 'Web': 'proj-thumb-web', 'Data': 'proj-thumb-data',
    'Mobile': 'proj-thumb-mobile', 'Lainnya': 'proj-thumb-lainnya'
  };
  const emoji = thumbEmojis[proj.cat] || '📁';
  const cls = thumbClass[proj.cat] || 'proj-thumb-lainnya';

  const card = document.createElement('div');
  card.className = 'proj-card';
  card.onclick = () => openProjectDetail(index);
  card.innerHTML = `
    <div class="proj-thumb ${cls}">
      ${emoji}
      <span class="proj-badge">${escapeHtml(proj.cat)}</span>
      <span class="proj-status-badge ${proj.status === 'Selesai' ? 'status-done' : 'status-ongoing'}">${escapeHtml(proj.status)}</span>
    </div>
    <div class="proj-body">
      <h3>${escapeHtml(proj.title)}</h3>
      <p>${escapeHtml(proj.desc || '')}</p>
      <div class="proj-tools-row">
        ${(proj.tools || []).map(t => `<span class="proj-tool-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="proj-footer">
        <span class="proj-impact">${proj.impact ? '✓ ' + escapeHtml(proj.impact) : ''}</span>
        <div class="proj-links" onclick="event.stopPropagation()">
          ${proj.demo ? `<a href="${escapeHtml(proj.demo)}" target="_blank" class="proj-link-btn">Demo ↗</a>` : ''}
          ${proj.repo ? `<a href="${escapeHtml(proj.repo)}" target="_blank" class="proj-link-btn">Repo ↗</a>` : ''}
          <button class="proj-delete-btn" onclick="event.stopPropagation();deleteProject(${proj.id})">🗑</button>
        </div>
      </div>
    </div>
  `;
  return card;
}

function filterProjects(cat, btn) { currentFilter = cat; renderProjects(); }

function openAddProject() {
  if (!requireAdmin()) return;
  ['proj-title','proj-desc','proj-tools','proj-demo','proj-repo','proj-impact'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('proj-cat').value = 'UI/UX';
  document.getElementById('proj-status').value = 'Selesai';
  openModal('modal-project');
}

async function saveProject() {
  const title = document.getElementById('proj-title').value.trim();
  const desc = document.getElementById('proj-desc').value.trim();
  if (!title || !desc) { showToast('Nama proyek dan deskripsi wajib diisi.', 'error'); return; }

  const toolsRaw = document.getElementById('proj-tools').value;
  const tools = toolsRaw ? toolsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  showToast('⏳ Menyimpan...', '');
  try {
    const { error } = await supabaseClient.from('projects').insert({
      title, cat: document.getElementById('proj-cat').value,
      status: document.getElementById('proj-status').value,
      description: desc, tools,
      demo_url: document.getElementById('proj-demo').value.trim(),
      repo_url: document.getElementById('proj-repo').value.trim(),
      impact: document.getElementById('proj-impact').value.trim()
    });
    if (error) throw error;
    await loadAllData();
    closeModal('modal-project');
    renderProjects(); renderHome();
    showToast('✓ Proyek berhasil disimpan', 'success');
  } catch (err) { showToast('❌ Gagal: ' + err.message, 'error'); }
}

async function deleteProject(id) {
  if (!confirm('Hapus proyek ini?')) return;
  try {
    const { error } = await supabaseClient.from('projects').delete().eq('id', id);
    if (error) throw error;
    await loadAllData();
    renderProjects(); renderHome();
    showToast('✓ Proyek dihapus', 'success');
  } catch (err) { showToast('❌ Gagal: ' + err.message, 'error'); }
}

function openProjectDetail(index) {
  const p = STATE.projects[index];
  if (!p) return;
  document.getElementById('detail-title').textContent = p.title;
  document.getElementById('detail-body').innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
      <span style="background:var(--sand);padding:5px 14px;border-radius:100px;font-size:0.78rem;font-weight:600">${escapeHtml(p.cat)}</span>
      <span style="padding:5px 14px;border-radius:100px;font-size:0.78rem;font-weight:600;${p.status === 'Selesai' ? 'background:rgba(61,90,71,0.15);color:var(--forest)' : 'background:rgba(192,113,79,0.15);color:var(--terracotta)'}">${escapeHtml(p.status)}</span>
    </div>
    <p style="font-size:0.95rem;line-height:1.85;color:var(--mist);margin-bottom:22px">${escapeHtml(p.desc || '')}</p>
    ${p.impact ? `<div style="background:rgba(61,90,71,0.08);border:1px solid rgba(61,90,71,0.2);border-radius:12px;padding:16px;margin-bottom:22px;font-size:0.9rem;color:var(--forest);font-weight:600">✓ ${escapeHtml(p.impact)}</div>` : ''}
    ${p.tools?.length ? `<div style="margin-bottom:24px"><div style="font-size:0.75rem;font-weight:600;color:var(--mist);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px">Tools</div><div style="display:flex;flex-wrap:wrap;gap:8px">${p.tools.map(t=>`<span style="padding:6px 14px;background:var(--cream);border-radius:100px;font-size:0.82rem;font-weight:500">${escapeHtml(t)}</span>`).join('')}</div></div>` : ''}
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${p.demo ? `<a href="${escapeHtml(p.demo)}" target="_blank" class="btn-primary" style="font-size:0.85rem">🔗 Live Demo ↗</a>` : ''}
      ${p.repo ? `<a href="${escapeHtml(p.repo)}" target="_blank" class="btn-outline" style="font-size:0.85rem">📂 Repository ↗</a>` : ''}
    </div>
  `;
  openModal('modal-detail');
}

// ============================================================
// SKILLS
// ============================================================
function renderSkills() {
  const container = document.getElementById('skills-container');
  const empty = document.getElementById('skills-empty');
  container.querySelectorAll('.skill-category-block').forEach(el => el.remove());

  if (STATE.skills.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  const grouped = {};
  STATE.skills.forEach(s => { if (!grouped[s.cat]) grouped[s.cat] = []; grouped[s.cat].push(s); });

  Object.entries(grouped).forEach(([cat, items]) => {
    const block = document.createElement('div');
    block.className = 'skill-category-block';
    block.innerHTML = `
      <div class="skill-cat-title">${escapeHtml(cat)}</div>
      <div class="skill-items">
        ${items.map(s => `
          <div class="skill-item">
            <div class="skill-item-top">
              <span class="skill-item-name">${escapeHtml(s.name)}</span>
              <div style="display:flex;align-items:center">
                <span class="skill-item-level">${s.level}%</span>
                <button class="skill-del-btn" onclick="deleteSkill(${s.id})">🗑</button>
              </div>
            </div>
            <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${s.level}%"></div></div>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(block);
  });
}

function openAddSkill() {
  if (!requireAdmin()) return;
  document.getElementById('skill-name').value = '';
  document.getElementById('skill-level').value = '';
  openModal('modal-skill');
}

async function saveSkill() {
  const name = document.getElementById('skill-name').value.trim();
  const level = parseInt(document.getElementById('skill-level').value);
  const cat = document.getElementById('skill-cat').value;
  if (!name) { showToast('Nama keahlian wajib diisi.', 'error'); return; }
  if (!level || level < 1 || level > 100) { showToast('Level 1-100.', 'error'); return; }

  showToast('⏳ Menyimpan...', '');
  try {
    const { error } = await supabaseClient.from('skills').insert({ name, category: cat, level });
    if (error) throw error;
    await loadAllData();
    closeModal('modal-skill');
    renderSkills(); renderHome();
    showToast('✓ Keahlian ditambahkan', 'success');
  } catch (err) { showToast('❌ Gagal: ' + err.message, 'error'); }
}

async function deleteSkill(id) {
  if (!confirm('Hapus keahlian ini?')) return;
  try {
    const { error } = await supabaseClient.from('skills').delete().eq('id', id);
    if (error) throw error;
    await loadAllData();
    renderSkills(); renderHome();
    showToast('✓ Keahlian dihapus', 'success');
  } catch (err) { showToast('❌ Gagal: ' + err.message, 'error'); }
}

// ============================================================
// EXPERIENCE
// ============================================================
function renderExperience() {
  const container = document.getElementById('exp-container');
  const empty = document.getElementById('exp-empty');
  container.querySelectorAll('.exp-item').forEach(el => el.remove());

  if (STATE.experience.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  const typeLabels = { work: '💼 Pekerjaan', edu: '🎓 Pendidikan', cert: '🏆 Sertifikasi', org: '👥 Organisasi' };

  STATE.experience.forEach(exp => {
    const item = document.createElement('div');
    item.className = 'exp-item ' + (exp.type || 'work');
    item.innerHTML = `
      <div class="exp-card">
        <div class="exp-card-type">${typeLabels[exp.type] || '💼 Pekerjaan'}</div>
        <div class="exp-card-header">
          <div class="exp-card-title">${escapeHtml(exp.title)}</div>
          <div class="exp-card-period">${escapeHtml(exp.start || '')}${exp.end ? ' – ' + escapeHtml(exp.end) : ''}</div>
        </div>
        <div class="exp-card-company">${escapeHtml(exp.company)}</div>
        ${exp.desc ? `<div class="exp-card-desc">${escapeHtml(exp.desc)}</div>` : ''}
        <div class="exp-card-actions">
          <button class="exp-del-btn" onclick="deleteExp(${exp.id})">🗑 Hapus</button>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

function openAddExp() {
  if (!requireAdmin()) return;
  ['exp-title','exp-company','exp-start','exp-end','exp-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('exp-type').value = 'work';
  openModal('modal-exp');
}

async function saveExp() {
  const title = document.getElementById('exp-title').value.trim();
  const company = document.getElementById('exp-company').value.trim();
  if (!title || !company) { showToast('Judul dan instansi wajib.', 'error'); return; }

  showToast('⏳ Menyimpan...', '');
  try {
    const { error } = await supabaseClient.from('experience').insert({
      type: document.getElementById('exp-type').value,
      title, company,
      start_date: document.getElementById('exp-start').value.trim(),
      end_date: document.getElementById('exp-end').value.trim(),
      description: document.getElementById('exp-desc').value.trim()
    });
    if (error) throw error;
    await loadAllData();
    closeModal('modal-exp');
    renderExperience(); renderHome();
    showToast('✓ Pengalaman ditambahkan', 'success');
  } catch (err) { showToast('❌ Gagal: ' + err.message, 'error'); }
}

async function deleteExp(id) {
  if (!confirm('Hapus pengalaman ini?')) return;
  try {
    const { error } = await supabaseClient.from('experience').delete().eq('id', id);
    if (error) throw error;
    await loadAllData();
    renderExperience(); renderHome();
    showToast('✓ Dihapus', 'success');
  } catch (err) { showToast('❌ Gagal: ' + err.message, 'error'); }
}

// ============================================================
// DOCUMENTS
// ============================================================
function handleFileUpload(e) { processFiles(Array.from(e.target.files)); e.target.value = ''; }
function dragOver(e) { e.preventDefault(); document.getElementById('upload-zone').classList.add('dragover'); }
function dragLeave(e) { document.getElementById('upload-zone').classList.remove('dragover'); }
function dropFile(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('dragover');
  if (!isAdmin()) { showToast('Login admin untuk upload.', 'error'); return; }
  processFiles(Array.from(e.dataTransfer.files));
}

async function processFiles(files) {
  if (!requireAdmin()) return;
  const maxSize = 50 * 1024 * 1024;
  let added = 0, failed = 0;

  for (const file of files) {
    if (file.size > maxSize) { showToast(`${file.name} terlalu besar (max 50MB)`, 'error'); continue; }
    showToast(`⏳ Upload ${file.name}...`, '');

    try {
      const ext = file.name.split('.').pop();
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
      const fileName = `${Date.now()}_${baseName}.${ext}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('portfolio-files').upload(fileName, file, { upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseClient.storage
        .from('portfolio-files').getPublicUrl(fileName);

      const { error: dbError } = await supabaseClient.from('documents').insert({
        name: file.name, file_url: publicUrl,
        file_type: getDocType(file.name), size_bytes: file.size
      });
      if (dbError) throw dbError;
      added++;
    } catch (err) { console.error(err); failed++; }
  }

  await loadAllData();
  renderDocuments(); renderHome();
  if (added > 0) showToast(`✓ ${added} file diupload`, 'success');
  if (failed > 0) showToast(`❌ ${failed} file gagal`, 'error');
}

function getDocType(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc','docx'].includes(ext)) return 'doc';
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'img';
  return 'file';
}

function getDocIcon(type) {
  return { pdf: '📄', doc: '📝', img: '🖼️', file: '📁' }[type] || '📁';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(1) + ' MB';
}

function renderDocuments() {
  const grid = document.getElementById('docs-grid');
  const empty = document.getElementById('docs-empty');
  grid.querySelectorAll('.doc-card').forEach(el => el.remove());

  if (STATE.documents.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  STATE.documents.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'doc-card';
    card.innerHTML = `
      <div class="doc-icon">${getDocIcon(doc.type)}</div>
      <div class="doc-name">${escapeHtml(doc.name)}</div>
      <div class="doc-meta">${formatSize(doc.size || 0)}</div>
      <div class="doc-actions">
        <a href="${escapeHtml(doc.url)}" target="_blank" download="${escapeHtml(doc.name)}" class="doc-btn">⬇ Download</a>
        <button class="doc-btn danger" onclick="deleteDoc(${doc.id}, '${escapeHtml(doc.url)}')">🗑</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function deleteDoc(id, url) {
  if (!confirm('Hapus dokumen ini?')) return;
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    await supabaseClient.storage.from('portfolio-files').remove([fileName]);
    const { error } = await supabaseClient.from('documents').delete().eq('id', id);
    if (error) throw error;
    await loadAllData();
    renderDocuments(); renderHome();
    showToast('✓ Dokumen dihapus', 'success');
  } catch (err) { showToast('❌ Gagal: ' + err.message, 'error'); }
}

// ============================================================
// CONTACT
// ============================================================
function renderContact() {
  const p = STATE.profile;
  const c = document.getElementById('contact-link-list');
  const links = [];
  if (p.email) links.push({ href: `mailto:${p.email}`, icon: '✉️', label: 'Email', sub: p.email });
  if (p.linkedin) links.push({ href: p.linkedin, icon: '💼', label: 'LinkedIn', sub: 'Profil profesional' });
  if (p.github) links.push({ href: p.github, icon: '🐙', label: 'GitHub', sub: 'Source code' });
  if (p.figma) links.push({ href: p.figma, icon: '🎨', label: 'Figma', sub: 'Karya desain' });
  if (p.wa) links.push({ href: `https://wa.me/${p.wa}`, icon: '📱', label: 'WhatsApp', sub: 'Chat langsung' });
  if (p.web) links.push({ href: p.web, icon: '🌐', label: 'Website', sub: p.web });

  if (links.length === 0) {
    c.innerHTML = '<p style="color:var(--mist);font-size:0.9rem;font-style:italic">Belum ada tautan.</p>';
    return;
  }
  c.innerHTML = links.map(l => `
    <a href="${escapeHtml(l.href)}" target="_blank" rel="noopener" class="contact-link-item">
      <span class="cli-icon">${l.icon}</span>
      <div style="flex:1"><div>${l.label}</div><div class="cli-sub">${escapeHtml(l.sub)}</div></div>
      <span style="color:var(--clay)">→</span>
    </a>
  `).join('');
}

function submitForm(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const p = STATE.profile;
  if (!p.email) { showToast('Email pemilik belum diisi.', 'error'); return; }
  const subject = encodeURIComponent(`[Portofolio] ${data.subject} dari ${data.name}`);
  const body = encodeURIComponent(`Nama: ${data.name}\nEmail: ${data.email}\n\nPesan:\n${data.message}`);
  window.open(`mailto:${p.email}?subject=${subject}&body=${body}`);
  showToast('✓ Email client dibuka', 'success');
  event.target.reset();
}

// ============================================================
// EDIT PROFILE
// ============================================================
function populateEditForm() {
  const p = STATE.profile;
  setVal('e-name', p.name); setVal('e-role', p.role); setVal('e-loc', p.loc);
  setVal('e-birth', p.birth); setVal('e-edu', p.edu); setVal('e-job', p.job);
  setVal('e-status', p.status);
  setVal('e-line1', p.line1); setVal('e-line2', p.line2);
  setVal('e-line3', p.line3); setVal('e-line4', p.line4);
  setVal('e-bio', p.bio); setVal('e-about', p.about); setVal('e-what', p.what);
  setVal('e-email', p.email); setVal('e-linkedin', p.linkedin);
  setVal('e-github', p.github); setVal('e-figma', p.figma);
  setVal('e-wa', p.wa); setVal('e-web', p.web);
  setVal('e-card1-icon', p.card1?.icon); setVal('e-card1-title', p.card1?.title); setVal('e-card1-desc', p.card1?.desc);
  setVal('e-card2-icon', p.card2?.icon); setVal('e-card2-title', p.card2?.title); setVal('e-card2-desc', p.card2?.desc);
  setVal('e-card3-icon', p.card3?.icon); setVal('e-card3-title', p.card3?.title); setVal('e-card3-desc', p.card3?.desc);

  STATE.pendingPhoto = null;
  if (p.photo_url) {
    const preview = document.getElementById('edit-photo-preview');
    const placeholder = document.getElementById('edit-photo-placeholder');
    preview.src = p.photo_url;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  }
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Foto maks. 5MB', 'error'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('edit-photo-preview');
    const placeholder = document.getElementById('edit-photo-placeholder');
    preview.src = e.target.result;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
  STATE.pendingPhoto = file;
  showToast('📷 Foto akan diupload saat Simpan', '');
}

async function saveProfile() {
  if (!requireAdmin()) return;
  showToast('⏳ Menyimpan profil...', '');

  let photoUrl = STATE.profile.photo_url;

  if (STATE.pendingPhoto) {
    try {
      const file = STATE.pendingPhoto;
      const ext = file.name.split('.').pop();
      const fileName = `profile_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabaseClient.storage
        .from('portfolio-files').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabaseClient.storage
        .from('portfolio-files').getPublicUrl(fileName);
      photoUrl = publicUrl;
      STATE.pendingPhoto = null;
    } catch (err) { showToast('❌ Upload foto gagal: ' + err.message, 'error'); return; }
  }

  const profileData = {
    id: 1,
    name: getVal('e-name'), role: getVal('e-role'), loc: getVal('e-loc'),
    birth: getVal('e-birth'), edu: getVal('e-edu'), job: getVal('e-job'),
    status: getVal('e-status'),
    line1: getVal('e-line1') || 'Desainer &',
    line2: getVal('e-line2') || 'Developer',
    line3: getVal('e-line3') || 'yang Bercerita',
    line4: getVal('e-line4') || 'lewat Data.',
    bio: getVal('e-bio'), about: getVal('e-about'), what: getVal('e-what'),
    email: getVal('e-email'), linkedin: getVal('e-linkedin'),
    github: getVal('e-github'), figma: getVal('e-figma'),
    wa: getVal('e-wa'), web: getVal('e-web'),
    photo_url: photoUrl,
    card1: { icon: getVal('e-card1-icon') || '🎨', title: getVal('e-card1-title') || 'UI/UX Design', desc: getVal('e-card1-desc') },
    card2: { icon: getVal('e-card2-icon') || '💻', title: getVal('e-card2-title') || 'Web Development', desc: getVal('e-card2-desc') },
    card3: { icon: getVal('e-card3-icon') || '📊', title: getVal('e-card3-title') || 'Data Analytics', desc: getVal('e-card3-desc') },
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabaseClient.from('profile').upsert(profileData, { onConflict: 'id' });
    if (error) throw error;
    await loadAllData();
    showToast('✓ Profil tersimpan', 'success');
    setTimeout(() => showPage('home'), 700);
  } catch (err) { showToast('❌ Gagal: ' + err.message, 'error'); }
}

// ============================================================
// MODALS & HELPERS
// ============================================================
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', function(e) {
    if (e.target === this) closeModal(this.id);
  });
});

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }
function getVal(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function escapeHtml(s) { if (!s) return ''; return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL || SUPABASE_URL.includes('YOUR_')) {
    alert('⚠️ Supabase belum dikonfigurasi!\n\nBuka file supabase-config.js dan isi URL & API Key Anda.');
    return;
  }

  showToast('⏳ Memuat data...', '');

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) setAdminMode(true);

  await loadAllData();
  renderHome();
  showToast('✓ Data dimuat', 'success');

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') setAdminMode(true);
    if (event === 'SIGNED_OUT') setAdminMode(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  });
});
