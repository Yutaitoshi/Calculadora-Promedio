// ==========================================
// 1. CARGA INICIAL Y CONFIGURACIÓN
// ==========================================
let students = [];
try {
  students = JSON.parse(localStorage.getItem('unicor_students')) || [];
} catch (e) {
  students = [];
}

let config = { p1: 30, p2: 30, p3: 40 };
try {
  const savedConfig = JSON.parse(localStorage.getItem('unicor_config'));
  if (savedConfig && typeof savedConfig.p1 === 'number' && typeof savedConfig.p2 === 'number' && typeof savedConfig.p3 === 'number') {
    config = savedConfig;
  }
} catch (e) {
  config = { p1: 30, p2: 30, p3: 40 };
}

function initConfigInputs() {
  const pct1 = document.getElementById('pct1');
  const pct2 = document.getElementById('pct2');
  const pct3 = document.getElementById('pct3');
  if (pct1 && pct2 && pct3) {
    pct1.value = config.p1;
    pct2.value = config.p2;
    pct3.value = config.p3;
  }
}

document.getElementById('btn-save-pct').addEventListener('click', () => {
  const p1 = parseFloat(document.getElementById('pct1').value) || 0;
  const p2 = parseFloat(document.getElementById('pct2').value) || 0;
  const p3 = parseFloat(document.getElementById('pct3').value) || 0;

  if (p1 + p2 + p3 !== 100) {
    alert("⚠️ Los porcentajes deben sumar exactamente 100%");
    return;
  }

  config = { p1, p2, p3 };
  localStorage.setItem('unicor_config', JSON.stringify(config));
  alert("✅ Porcentajes actualizados correctamente.");
  renderTable();
});

// ==========================================
// 2. GUARDAR O EDITAR ESTUDIANTE
// ==========================================
document.getElementById('student-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const editIndex = parseInt(document.getElementById('edit-index').value);
  const name = document.getElementById('name').value.trim();
  const code = document.getElementById('code').value.trim();

  const duplicate = students.some((s, idx) => s.code === code && idx !== editIndex);
  if (duplicate) {
    alert(`❌ El código ${code} ya está registrado.`);
    return;
  }

  // Si la nota es menor a 0 o mayor a 5.0, avisa y la deja en blanco (null)
  const parseVal = (id, corteName) => {
    const rawVal = document.getElementById(id).value;
    if (rawVal === "" || rawVal === null || rawVal === undefined) return null;
    const normalized = String(rawVal).replace(',', '.').trim();
    const num = parseFloat(normalized);
    if (isNaN(num) || num < 0 || num > 5.0) {
      alert(`⚠️ Nota inválida en ${corteName} (${rawVal}). Debe estar entre 0.0 y 5.0. Se guardará en blanco.`);
      return null;
    }
    return parseFloat(num.toFixed(1));
  };

  const c1 = parseVal('corte1', 'Corte 1');
  const c2 = parseVal('corte2', 'Corte 2');
  const c3 = parseVal('corte3', 'Corte 3');

  const studentData = { code, name, c1, c2, c3 };

  if (editIndex >= 0) {
    students[editIndex] = studentData;
  } else {
    students.push(studentData);
  }

  saveAndRender();
  resetForm();
});

function saveAndRender() {
  localStorage.setItem('unicor_students', JSON.stringify(students));
  renderTable();
}

// ==========================================
// 3. CÁLCULOS Y ESTADOS
// ==========================================
function calculateStatus(s) {
  const p1 = config.p1 / 100;
  const p2 = config.p2 / 100;
  const p3 = config.p3 / 100;

  const has = (v) => v !== null && v !== undefined && v !== '' && !isNaN(v);
  const hasC1 = has(s.c1);
  const hasC2 = has(s.c2);
  const hasC3 = has(s.c3);

  if (hasC1 && hasC2 && hasC3) {
    const def = (s.c1 * p1) + (s.c2 * p2) + (s.c3 * p3);
    return {
      definitiva: def.toFixed(2),
      prediccion: def >= 3.0 ? "Aprobado" : "Reprobado",
      estado: def >= 3.0 ? "🟢 Aprobado" : "🔴 Reprobado",
      badgeClass: def >= 3.0 ? "badge-approved" : "badge-failed"
    };
  }

  if (hasC1 && hasC2 && !hasC3) {
    const acum = (s.c1 * p1) + (s.c2 * p2);
    const necAprobar = (3.0 - acum) / p3;
    const necCinco = (5.0 - acum) / p3;

    if (necAprobar > 5.0) {
      return {
        definitiva: acum.toFixed(2) + " (Parcial)",
        prediccion: `Necesita ${necAprobar.toFixed(1)} en C3`,
        estado: "⚪ Inalcanzable",
        badgeClass: "badge-unreachable"
      };
    }

    const minNota = necAprobar <= 0 ? "0.0" : necAprobar.toFixed(1);
    const maxPred = necCinco > 5.0
      ? `máx. def ${(acum + 5.0 * p3).toFixed(1)}`
      : `${necCinco.toFixed(1)} (p/ 5.0)`;

    return {
      definitiva: acum.toFixed(2) + " (Parcial)",
      prediccion: `C3 de ${minNota} (p/ 3.0) a ${maxPred}`,
      estado: "🟡 En Progreso",
      badgeClass: "badge-progress"
    };
  }

  return {
    definitiva: "Incompleto",
    prediccion: "Faltan cortes",
    estado: "🟡 En Progreso",
    badgeClass: "badge-progress"
  };
}

// ==========================================
// 4. RENDERIZAR TABLA Y ACCIONES
// ==========================================
function renderTable() {
  const tbody = document.getElementById('student-list');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">No hay estudiantes registrados.</td></tr>`;
    return;
  }

  students.forEach((s, index) => {
    const res = calculateStatus(s);
    const row = document.createElement('tr');
    const formatNote = (note) => (note !== null && note !== undefined && note !== '' && !isNaN(note)) ? Number(note).toFixed(1) : '-';

    row.innerHTML = `
      <td>${s.code}</td>
      <td><strong>${s.name}</strong></td>
      <td>${formatNote(s.c1)}</td>
      <td>${formatNote(s.c2)}</td>
      <td>${formatNote(s.c3)}</td>
      <td><strong>${res.definitiva}</strong></td>
      <td><small>${res.prediccion}</small></td>
      <td><span class="badge ${res.badgeClass}">${res.estado}</span></td>
      <td>
        <button class="btn-edit" onclick="editStudent(${index})">✏️</button>
        <button class="btn-delete" onclick="deleteStudent(${index})">🗑️</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editStudent(index) {
  const s = students[index];
  if (!s) return;
  document.getElementById('edit-index').value = index;
  document.getElementById('name').value = s.name || '';
  document.getElementById('code').value = s.code || '';
  document.getElementById('corte1').value = (s.c1 !== null && s.c1 !== undefined) ? s.c1 : '';
  document.getElementById('corte2').value = (s.c2 !== null && s.c2 !== undefined) ? s.c2 : '';
  document.getElementById('corte3').value = (s.c3 !== null && s.c3 !== undefined) ? s.c3 : '';

  document.getElementById('form-title').innerText = "✏️ Editar Estudiante";
  document.getElementById('btn-submit').innerText = "Actualizar Estudiante";
  document.getElementById('btn-cancel').style.display = "inline-block";
}

document.getElementById('btn-cancel').addEventListener('click', resetForm);

function resetForm() {
  document.getElementById('student-form').reset();
  document.getElementById('edit-index').value = "-1";
  document.getElementById('form-title').innerText = "➕ Registrar Estudiante (Ctrl + M)";
  document.getElementById('btn-submit').innerText = "Guardar Estudiante (Ctrl + S)";
  document.getElementById('btn-cancel').style.display = "none";
}

function deleteStudent(index) {
  if (confirm("¿Deseas eliminar este estudiante?")) {
    students.splice(index, 1);
    saveAndRender();
  }
}

// Asegurar disponibilidad global para atributos onclick
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;

// ==========================================
// 5. IMPORTAR / EXPORTAR CSV
// ==========================================
function exportCSV() {
  if (students.length === 0) return alert("No hay datos para exportar.");
  let csv = "Nombre;Codigo;Corte1;Corte2;Corte3\n";
  students.forEach(s => {
    const formatExport = (val) => (val !== null && val !== undefined && val !== '') ? Number(val).toFixed(1) : '';
    csv += `"${s.name}";${s.code};${formatExport(s.c1)};${formatExport(s.c2)};${formatExport(s.c3)}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'estudiantes_unicor.csv');
  a.click();
}

document.getElementById('btn-export').addEventListener('click', exportCSV);

document.getElementById('csv-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    let text = evt.target.result.replace(/^\uFEFF/, '');
    const lines = text.split(/\r\n|\n/);
    const separator = lines[0].includes(';') ? ';' : ',';

    let countAdded = 0;
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const cols = lines[i].split(separator);
      if (cols.length >= 2 && cols[0].trim() !== "") {
        const name = cols[0].replace(/"/g, '').trim();
        const code = cols[1].replace(/"/g, '').trim();
        
        // Si al importar el CSV una nota es menor a 0 o mayor a 5.0, se descarta y queda en blanco (null)
        const parseCSVVal = (val) => {
          if (!val || val.trim() === "") return null;
          const num = parseFloat(val.replace(',', '.'));
          if (isNaN(num) || num < 0 || num > 5.0) return null;
          return parseFloat(num.toFixed(1));
        };

        const c1 = parseCSVVal(cols[2]);
        const c2 = parseCSVVal(cols[3]);
        const c3 = parseCSVVal(cols[4]);

        if (!students.some(s => s.code === code)) {
          students.push({ code, name, c1, c2, c3 });
          countAdded++;
        }
      }
    }
    saveAndRender();
    alert(`📥 Se importaron ${countAdded} estudiantes con éxito (las notas fuera de rango 0.0 - 5.0 quedaron en blanco).`);
    document.getElementById('csv-file').value = "";
  };
  reader.readAsText(file);
});

// ==========================================
// 6. ATAJOS DE TECLADO
// ==========================================
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  if (e.ctrlKey && key === 'm') {
    e.preventDefault();
    e.stopPropagation();
    resetForm();
    document.getElementById('name').focus();
    return;
  }
  if (e.ctrlKey && key === 's') {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('student-form').requestSubmit();
    return;
  }
  if (e.ctrlKey && key === 'e') {
    e.preventDefault();
    e.stopPropagation();
    exportCSV();
    return;
  }
  if (e.key === 'Escape') {
    resetForm();
  }
});

// ==========================================
// 7. INICIALIZACIÓN SEGURA
// ==========================================
function init() {
  initConfigInputs();
  renderTable();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
