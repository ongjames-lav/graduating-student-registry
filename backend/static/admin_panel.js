// Admin Panel JS for viewing, editing, and exporting students
const API_BASE = 'http://localhost:8000';
let students = [];
let editingStudentId = null;

// Elements
const studentsTableBody = document.getElementById('studentsTableBody');
const studentModal = document.getElementById('studentModal');
const modalTitle = document.getElementById('modalTitle');
const studentForm = document.getElementById('studentForm');
const closeModalBtn = document.getElementById('closeModal');
const refreshBtn = document.getElementById('refreshBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const exportWordBtn = document.getElementById('exportWordBtn');

function getToken() {
    return localStorage.getItem('token');
}

// Fetch all students
async function fetchStudents() {
    const res = await fetch(`${API_BASE}/admin/students`);
    students = await res.json();
    renderStudents();
}

// Render students in table
function renderStudents() {
    studentsTableBody.innerHTML = '';
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-2 px-4 border-b">${student.id}</td>
            <td class="py-2 px-4 border-b">${student.email}</td>
            <td class="py-2 px-4 border-b">${student.lastName}</td>
            <td class="py-2 px-4 border-b">${student.firstName}</td>
            <td class="py-2 px-4 border-b">${student.middleInitial || ''}</td>
            <td class="py-2 px-4 border-b">${student.course}</td>
            <td class="py-2 px-4 border-b">${student.year}</td>
            <td class="py-2 px-4 border-b">${student.gender}</td>
            <td class="py-2 px-4 border-b">${student.graduating ? 'Yes' : 'No'}</td>
            <td class="py-2 px-4 border-b">
                <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded mr-2" onclick="editStudent(${student.id})">Edit</button>
                <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        `;
        studentsTableBody.appendChild(tr);
    });
}

// Show modal for edit
window.editStudent = function (id) {
    const student = students.find(s => s.id === id);
    studentModal.classList.remove('hidden');
    modalTitle.textContent = 'Edit Student';
    studentForm.reset();
    editingStudentId = student.id;
    document.getElementById('studentId').value = student.id;
    document.getElementById('email').value = student.email;
    document.getElementById('lastName').value = student.lastName;
    document.getElementById('firstName').value = student.firstName;
    document.getElementById('middleInitial').value = student.middleInitial || '';
    document.getElementById('course').value = student.course;
    document.getElementById('year').value = student.year;
    document.getElementById('gender').value = student.gender;
    document.getElementById('graduating').checked = student.graduating;
};

// Hide modal
closeModalBtn.onclick = () => studentModal.classList.add('hidden');

// Edit student submit
studentForm.onsubmit = async function (e) {
    e.preventDefault();
    const id = document.getElementById('studentId').value;
    const data = {
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        middleInitial: document.getElementById('middleInitial').value,
        course: document.getElementById('course').value,
        year: parseInt(document.getElementById('year').value),
        gender: document.getElementById('gender').value,
        graduating: document.getElementById('graduating').checked
    };
    const res = await fetch(`${API_BASE}/admin/students/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        await fetchStudents();
        studentModal.classList.add('hidden');
    } else {
        alert('Failed to update student.');
    }
};

refreshBtn.onclick = fetchStudents;

// Delete student
window.deleteStudent = async function (id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    const res = await fetch(`${API_BASE}/admin/students/${id}`, {
        method: 'DELETE'
    });
    if (res.ok) {
        await fetchStudents();
    } else {
        alert('Failed to delete student.');
    }
};

// Export to Excel using SheetJS
exportExcelBtn.onclick = function () {
    if (students.length === 0) return alert('No data to export!');
    const ws_data = [
        ['ID', 'Email', 'Last Name', 'First Name', 'Middle Initial', 'Course', 'Year', 'Gender', 'Graduating'],
        ...students.map(s => [s.id, s.email, s.lastName, s.firstName, s.middleInitial, s.course, s.year, s.gender, s.graduating ? 'Yes' : 'No'])
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students.xlsx');
};

// Export to Word using docx
exportWordBtn.onclick = function () {
    if (students.length === 0) return alert('No data to export!');
    const doc = new window.docx.Document({
        sections: [
            {
                properties: {},
                children: [
                    new window.docx.Paragraph({
                        text: 'Student Registry',
                        heading: window.docx.HeadingLevel.HEADING_1
                    }),
                    new window.docx.Table({
                        rows: [
                            new window.docx.TableRow({
                                children: [
                                    'ID', 'Email', 'Last Name', 'First Name', 'Middle Initial', 'Course', 'Year', 'Gender', 'Graduating'
                                ].map(h => new window.docx.TableCell({ children: [new window.docx.Paragraph(h)] }))
                            }),
                            ...students.map(s => new window.docx.TableRow({
                                children: [
                                    s.id, s.email, s.lastName, s.firstName, s.middleInitial, s.course, s.year, s.gender, s.graduating ? 'Yes' : 'No'
                                ].map(val => new window.docx.TableCell({ children: [new window.docx.Paragraph(String(val))] }))
                            }))
                        ]
                    })
                ]
            }
        ]
    });
    window.docx.Packer.toBlob(doc).then(blob => {
        saveAs(blob, 'students.docx');
    });
};

// Load libraries for export
function loadScript(src, cb) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    document.head.appendChild(s);
}

// Load SheetJS and docx libraries
loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', () => {
    loadScript('https://cdn.jsdelivr.net/npm/docx@8.3.0/build/index.umd.js', () => {
        loadScript('https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js', fetchStudents);
    });
}); 