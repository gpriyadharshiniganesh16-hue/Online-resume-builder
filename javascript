const $ = id => document.getElementById(id);

const listId = {
  education: 'educationList',
  skill: 'skillsList',
  project: 'projectsList',
  experience: 'experienceList'
};

const listFor = type => $(listId[type]);

let counters = {
  education: 0,
  skill: 0,
  project: 0,
  experience: 0
};

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function addRepeat(type, data = {}) {
  const list = listFor(type);

  if (!list) {
    console.error('Missing list container:', type);
    return;
  }

  const n = ++counters[type];
  const card = document.createElement('div');

  card.className = 'repeat-card';
  card.dataset.type = type;

  const labels = {
    education: 'Education',
    skill: 'Skill',
    project: 'Project',
    experience: 'Experience'
  };

  card.innerHTML = `
    <div class="repeat-head">
      <span>${labels[type]} #${list.children.length + 1}</span>
      <button type="button" class="btn danger remove">
        Remove
      </button>
    </div>
    ${fieldsFor(type, n, data)}
  `;

  list.appendChild(card);

  card.querySelector('.remove').addEventListener('click', () => {
    card.remove();
    renumber(type);
    updatePreview();
  });

  card.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', updatePreview);
  });

  updatePreview();
}

function fieldsFor(t, n, d) {
  const f = (
    label,
    key,
    placeholder = '',
    value = '',
    full = false,
    area = false
  ) => `
    <div class="field ${full ? 'full' : ''}">
      <label for="${t}${n}_${key}">${label}</label>
      ${
        area
          ? `<textarea id="${t}${n}_${key}"
               data-key="${key}"
               placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
          : `<input id="${t}${n}_${key}"
               data-key="${key}"
               placeholder="${esc(placeholder)}"
               value="${esc(value)}">`
      }
    </div>
  `;

  if (t === 'education') {
    return `
      <div class="grid">
        ${f('Institution', 'institution', 'College / university', d.institution)}
        ${f('Degree / course', 'degree', 'B.Sc. Computer Science', d.degree)}
        ${f('Year / duration', 'year', '2024-2027', d.year)}
        ${f('Grade (optional)', 'grade', 'CGPA / percentage', d.grade)}
        ${f('Details', 'details', 'Coursework or achievements', d.details, true, true)}
      </div>
    `;
  }

  if (t === 'skill') {
    return `
      <div class="grid">
        ${f('Skill', 'skill', 'Python, communication...', d.skill, true)}
      </div>
    `;
  }

  if (t === 'project') {
    return `
      <div class="grid">
        ${f('Project name', 'name', 'Online Resume Builder', d.name)}
        ${f('Technologies', 'tech', 'HTML, CSS, JavaScript', d.tech)}
        ${f('Description', 'description', 'Describe your project', d.description, true, true)}
      </div>
    `;
  }

  return `
    <div class="grid">
      ${f('Role / position', 'role', 'Intern / Volunteer', d.role)}
      ${f('Organization', 'organization', 'Company / organization', d.organization)}
      ${f('Duration', 'duration', 'Jun 2025 - Aug 2025', d.duration)}
      ${f('Responsibilities', 'responsibilities', 'Your contributions', d.responsibilities, true, true)}
    </div>
  `;
}

function renumber(type) {
  [...listFor(type).children].forEach((card, i) => {
    const labels = {
      education: 'Education',
      skill: 'Skill',
      project: 'Project',
      experience: 'Experience'
    };

    card.querySelector('.repeat-head span').textContent =
      labels[type] + ' #' + (i + 1);
  });
}

function readRepeat(type) {
  return [...listFor(type).children]
    .map(card => {
      const obj = {};

      card.querySelectorAll('[data-key]').forEach(el => {
        obj[el.dataset.key] = el.value.trim();
      });

      return obj;
    })
    .filter(obj => Object.values(obj).some(Boolean));
}

function val(id) {
  return $(id).value.trim();
}

function updatePreview() {
  const name = val('name') || 'Your Name';
  const role = val('role');

  const contact = [
    val('email'),
    val('phone'),
    val('location'),
    val('linkedin')
  ].filter(Boolean).map(esc).join(' · ');

  const summary = val('summary');
  const edu = readRepeat('education');
  const skills = readRepeat('skill');
  const projects = readRepeat('project');
  const jobs = readRepeat('experience');
  const preview = $('resumePreview');

  preview.className = 'resume ' + $('template').value;

  let html = `
    <h1>${esc(name)}</h1>
    ${role
      ? `<p style="font-size:16px;font-weight:700;margin-top:5px">
           ${esc(role)}
         </p>`
      : ''
    }
    <div class="contact">
      ${contact || '<span class="empty">Email · Phone · Location</span>'}
    </div>
  `;

  if (summary) {
    html += `
      <h2>Profile</h2>
      <p>${esc(summary).replace(/\n/g, '<br>')}</p>
    `;
  }

  if (edu.length) {
    html += '<h2>Education</h2>' + edu.map(e => `
      <div class="entry">
        <div class="entry-title">
          ${esc(e.degree || 'Course / degree')}
        </div>
        <div class="entry-sub">
          ${esc(e.institution)}
          ${e.year ? ' · ' + esc(e.year) : ''}
          ${e.grade ? ' · ' + esc(e.grade) : ''}
        </div>
        ${e.details ? `<p>${esc(e.details)}</p>` : ''}
      </div>
    `).join('');
  }

  if (skills.length) {
    html += '<h2>Skills</h2><p>' +
      skills.map(s => esc(s.skill)).filter(Boolean).join(' · ') +
      '</p>';
  }

  if (projects.length) {
    html += '<h2>Projects</h2>' + projects.map(p => `
      <div class="entry">
        <div class="entry-title">
          ${esc(p.name || 'Project')}
          ${p.tech ? ' — ' + esc(p.tech) : ''}
        </div>
        ${p.description ? `<p>${esc(p.description)}</p>` : ''}
      </div>
    `).join('');
  }

  if (jobs.length) {
    html += '<h2>Experience</h2>' + jobs.map(j => `
      <div class="entry">
        <div class="entry-title">
          ${esc(j.role || 'Role')}
          ${j.organization ? ' — ' + esc(j.organization) : ''}
        </div>
        <div class="entry-sub">${esc(j.duration)}</div>
        ${j.responsibilities
          ? `<p>${esc(j.responsibilities)}</p>`
          : ''
        }
      </div>
    `).join('');
  }

  if (!summary && !edu.length && !skills.length &&
      !projects.length && !jobs.length) {
    html += `
      <p class="empty">
        Your education, skills, projects, and summary will appear here
        as you fill in the form.
      </p>
    `;
  }

  preview.innerHTML = html;
}

function getData() {
  const personal = {};

  [
    'name',
    'role',
    'email',
    'phone',
    'location',
    'linkedin',
    'summary',
    'template'
  ].forEach(key => {
    personal[key] = val(key);
  });

  return {
    ...personal,
    education: readRepeat('education'),
    skills: readRepeat('skill'),
    projects: readRepeat('project'),
    experience: readRepeat('experience')
  };
}

function setData(data) {
  [
    'name',
    'role',
    'email',
    'phone',
    'location',
    'linkedin',
    'summary'
  ].forEach(key => {
    $(key).value = data[key] || '';
  });

  $('template').value = data.template || 'modern';

  ['education', 'skill', 'project', 'experience'].forEach(type => {
    listFor(type).innerHTML = '';
    counters[type] = 0;
  });

  (data.education || []).forEach(item => addRepeat('education', item));
  (data.skills || []).forEach(item => addRepeat('skill', item));
  (data.projects || []).forEach(item => addRepeat('project', item));
  (data.experience || []).forEach(item => addRepeat('experience', item));

  if (!data.education?.length) addRepeat('education');
  if (!data.skills?.length) addRepeat('skill');
  if (!data.projects?.length) addRepeat('project');

  updatePreview();
}

function showError(message) {
  const box = $('errorBox');

  box.textContent = message;
  box.style.display = message ? 'block' : 'none';

  if (message) {
    box.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}

/* Live preview */

$('resumeForm').addEventListener('input', updatePreview);
$('template').addEventListener('change', updatePreview);

/* Add buttons */

$('addEducation').onclick = () => addRepeat('education');
$('addSkill').onclick = () => addRepeat('skill');
$('addProject').onclick = () => addRepeat('project');
$('addExperience').onclick = () => addRepeat('experience');

/* Validate required fields */

$('resumeForm').addEventListener('submit', event => {
  event.preventDefault();

  if (!val('name')) {
    return showError('Please enter your full name.');
  }

  if (!val('email')) {
    return showError('Please enter your email address.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))) {
    return showError('Please enter a valid email address.');
  }

  showError('');
  updatePreview();

  alert('Required fields look good. Your preview is updated!');
});

/* Save data */

$('saveBtn').onclick = () => {
  try {
    localStorage.setItem(
      'onlineResumeBuilderData',
      JSON.stringify(getData())
    );

    showError('');
    alert('Resume data saved successfully in this browser.');
  } catch (error) {
    showError(
      'Could not save data. Try opening this project in Chrome or using a local server.'
    );
  }
};

/* Load saved data */

$('loadBtn').onclick = () => {
  try {
    const raw = localStorage.getItem('onlineResumeBuilderData');

    if (!raw) {
      return showError(
        'No saved resume was found. Enter your details and tap Save data first.'
      );
    }

    const data = JSON.parse(raw);

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid saved data');
    }

    setData(data);
    showError('');

    alert('Saved resume loaded successfully.');
  } catch (error) {
    showError(
      'Saved data could not be loaded. Try Chrome or a local server.'
    );
  }
};

/* Clear form */

$('clearBtn').onclick = () => {
  if (confirm('Clear all entered information? Saved data will remain.')) {
    setData({});
    showError('');
  }
};

/* Print or save as PDF */

$('downloadBtn').onclick = () => {
  updatePreview();
  window.print();
};

/* Initial form */

addRepeat('education');
addRepeat('skill');
addRepeat('project');

updatePreview();
