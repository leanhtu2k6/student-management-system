let currentStudents = []; 
let isEditing = false; 

// 1. Nạp dữ liệu từ Server và hiển thị lên Dashboard
async function loadDashboard() {
    const res = await fetch('/api/get_stacks');
    const data = await res.json();
    currentStudents = data.mainStack; 
    
    const body = document.getElementById('table-body');
    body.innerHTML = '';
    
    let totalGpa = 0;
    currentStudents.forEach(s => {
        totalGpa += s.gpa;
        body.innerHTML += `
            <tr>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td style="color: #0066ff;">${s.gpa}</td>
                <td>
                    <button class="btn btn-edit" onclick="editStu('${s.id}')">Sửa</button>
                    <button class="btn btn-del" onclick="deleteStu('${s.id}')">Xóa</button>
                </td>
            </tr>`;
    });

    // Cập nhật các con số thống kê
    document.getElementById('count-val').innerText = currentStudents.length;
    const avg = currentStudents.length > 0 ? (totalGpa / currentStudents.length).toFixed(2) : 0;
    document.getElementById('gpa-val').innerText = avg;
}

// 2. Chế độ Modal: Mở form để THÊM MỚI
function showModal() { 
    isEditing = false;
    document.getElementById('modal-title').innerText = "Thêm sinh viên mới";
    document.getElementById('mId').value = '';
    document.getElementById('mId').disabled = false; 
    document.getElementById('mName').value = '';
    document.getElementById('mGpa').value = '';
    document.getElementById('addModal').style.display = 'flex'; 
}

// 3. Chế độ Modal: Mở form để CHỈNH SỬA
function editStu(id) {
    isEditing = true;
    const stu = currentStudents.find(s => s.id === id);
    if(stu) {
        document.getElementById('modal-title').innerText = "Sửa thông tin sinh viên";
        document.getElementById('mId').value = stu.id;
        document.getElementById('mId').disabled = true; // Khóa ID không cho sửa
        document.getElementById('mName').value = stu.name;
        document.getElementById('mGpa').value = stu.gpa;
        document.getElementById('addModal').style.display = 'flex';
    }
}

// Đóng form
function hideModal() { 
    document.getElementById('addModal').style.display = 'none'; 
}

// 4. Gửi dữ liệu về Server (Xử lý chung cho cả Thêm và Sửa)
async function submitStudent() {
    const id = document.getElementById('mId').value;
    const name = document.getElementById('mName').value;
    const gpa = document.getElementById('mGpa').value;
    
    if(!id || !name || !gpa) {
        alert("Vui lòng nhập đủ thông tin!");
        return;
    }

    // Nếu isEditing = true thì gọi API update, ngược lại gọi API add
    const apiEndpoint = isEditing ? '/api/update' : '/api/add';

    await fetch(apiEndpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id, name, gpa})
    });
    
    hideModal();
    loadDashboard();
}

// 5. Xóa sinh viên
async function deleteStu(id) {
    if(confirm('Bạn có chắc chắn muốn xóa bản ghi của sinh viên ID ' + id + '?')) {
        await fetch('/api/delete', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id})
        });
        loadDashboard();
    }
}

// 6. Sắp xếp danh sách
async function sortData() {
    await fetch('/api/sort', {method: 'POST'});
    loadDashboard();
}

// 7. Đăng xuất
async function doLogout() {
    await fetch('/api/logout', {method: 'POST'});
    window.location.href = '/';
}

// 8. TÍNH NĂNG TÌM KIẾM REALTIME THEO ID
function searchStudent() {
    const input = document.getElementById('searchInput').value.toUpperCase();
    const table = document.getElementById('table-body');
    const tr = table.getElementsByTagName('tr');

    for (let i = 0; i < tr.length; i++) {
        // Cột ID là cột đầu tiên (index 0)
        const tdId = tr[i].getElementsByTagName('td')[0]; 
        if (tdId) {
            const txtValue = tdId.textContent || tdId.innerText;
            if (txtValue.toUpperCase().indexOf(input) > -1) {
                tr[i].style.display = ""; // Khớp thì hiện
            } else {
                tr[i].style.display = "none"; // Không khớp thì giấu đi
            }
        }
    }
}

// Khởi chạy khi tải xong trang web
window.onload = loadDashboard;