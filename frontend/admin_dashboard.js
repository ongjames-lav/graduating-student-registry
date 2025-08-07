// Admin Dashboard JS for CRUD operations
const API_BASE = 'http://localhost:8000';
let students = [];
let editingStudentId = null;

// Elements
const studentsTableBody = document.getElementById('studentsTableBody');
const studentModal = document.getElementById('studentModal');
const modalTitle = document.getElementById('modalTitle');
const studentForm = document.getElementById('studentForm');
const showAddFormBtn = document.getElementById('showAddForm');
const closeModalBtn = document.getElementById('closeModal');
const refreshBtn = document.getElementById('refreshBtn');

// Helper: Get token from localStorage (assume admin is logged in)
function getToken() {
    return localStorage.getItem('token');
}

// Fetch all students
async function fetchStudents() {
    const token = getToken();
    const res = await fetch(`${API_BASE}/admin/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
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

// Show modal for add/edit
function showModal(edit = false, student = null) {
    studentModal.classList.remove('hidden');
    modalTitle.textContent = edit ? 'Edit Student' : 'Add Student';
    studentForm.reset();
    editingStudentId = null;
    if (edit && student) {
        document.getElementById('studentId').value = student.id;
        document.getElementById('email').value = student.email;
        document.getElementById('lastName').value = student.lastName;
        document.getElementById('firstName').value = student.firstName;
        document.getElementById('middleInitial').value = student.middleInitial || '';
        document.getElementById('course').value = student.course;
        document.getElementById('year').value = student.year;
        document.getElementById('gender').value = student.gender;
        document.getElementById('graduating').checked = student.graduating;
        editingStudentId = student.id;
        document.getElementById('email').disabled = true;
        document.getElementById('password').disabled = true;
    } else {
        document.getElementById('email').disabled = false;
        document.getElementById('password').disabled = false;
    }
}

// Hide modal
function hideModal() {
    studentModal.classList.add('hidden');
}

// Add/Edit student submit
studentForm.onsubmit = async function (e) {
    e.preventDefault();
    const token = getToken();
    const id = document.getElementById('studentId').value;
    const data = {
        email: document.getElementById('email').value,
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        middleInitial: document.getElementById('middleInitial').value,
        course: document.getElementById('course').value,
        year: parseInt(document.getElementById('year').value),
        gender: document.getElementById('gender').value,
        graduating: document.getElementById('graduating').checked
    };
    if (editingStudentId) {
        // Edit
        const res = await fetch(`${API_BASE}/admin/students/${editingStudentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            await fetchStudents();
            hideModal();
        } else {
            alert('Failed to update student.');
        }
    } else {
        // Add (register)
        data.password = document.getElementById('password').value;
        if (!data.password || data.password.length < 8) {
            alert('Password must be at least 8 characters.');
            return;
        }
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            await fetchStudents();
            hideModal();
        } else {
            alert('Failed to add student.');
        }
    }
};

// Edit student
window.editStudent = function (id) {
    const student = students.find(s => s.id === id);
    showModal(true, student);
};

// Delete student
window.deleteStudent = async function (id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    const token = getToken();
    const res = await fetch(`${API_BASE}/admin/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        await fetchStudents();
    } else {
        alert('Failed to delete student.');
    }
};

// Show add form
showAddFormBtn.onclick = () => showModal(false);
closeModalBtn.onclick = hideModal;
refreshBtn.onclick = fetchStudents;

// Initial load
fetchStudents(); 