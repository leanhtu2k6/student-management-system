from flask import Flask, request, jsonify, render_template, session, redirect, url_for
import os

app = Flask(__name__)
app.secret_key = 'vnu_is_secret_key_2026' 
FILE_NAME = 'students.csv'

main_stack = []
temp_stack = []

def load_data():
    global main_stack
    main_stack.clear()
    if not os.path.exists(FILE_NAME): return
    with open(FILE_NAME, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line: continue
            parts = line.split(',')
            if len(parts) == 3:
                main_stack.append({'id': parts[0].strip(), 'name': parts[1].strip(), 'gpa': float(parts[2].strip())})

def save_data():
    global main_stack, temp_stack
    temp_stack.clear()
    while len(main_stack) > 0: temp_stack.append(main_stack.pop())
    with open(FILE_NAME, 'w', encoding='utf-8') as f:
        while len(temp_stack) > 0:
            s = temp_stack.pop()
            f.write(f"{s['id']},{s['name']},{s['gpa']}\n")
            main_stack.append(s)

@app.route('/')
def login_page():
    if session.get('logged_in'):
        return redirect(url_for('dashboard_page'))
    return render_template('login.html')

@app.route('/dashboard')
def dashboard_page():
    if not session.get('logged_in'):
        return redirect(url_for('login_page'))
    return render_template('dashboard.html')

@app.route('/simulation')
def simulation_page():
    # Trang mô phỏng không cần đăng nhập vẫn xem được (để trình chiếu)
    return render_template('simulation.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data.get('username') == 'admin' and data.get('password') == 'vnu123':
        session['logged_in'] = True
        return jsonify({'status': 'success', 'message': 'Đăng nhập thành công!'})
    return jsonify({'status': 'error', 'message': 'Sai tên đăng nhập hoặc mật khẩu!'})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('logged_in', None)
    return jsonify({'status': 'success'})

@app.route('/api/get_stacks', methods=['GET'])
def get_stacks():
    return jsonify({'mainStack': list(main_stack), 'tempStack': list(temp_stack)})

@app.route('/api/add', methods=['POST'])
def add_student():
    data = request.json
    new_id = data.get('id')
    global main_stack, temp_stack
    found = False
    temp_stack.clear()
    while len(main_stack) > 0:
        s = main_stack.pop()
        temp_stack.append(s)
        if s['id'] == new_id:
            found = True
            break
    while len(temp_stack) > 0: main_stack.append(temp_stack.pop())
    if found: return jsonify({'status': 'error', 'message': 'Lỗi: ID đã tồn tại!'})
    main_stack.append({'id': new_id, 'name': data.get('name'), 'gpa': float(data.get('gpa'))})
    save_data()
    return jsonify({'status': 'success', 'message': 'Đã lưu sinh viên mới.'})

@app.route('/api/update', methods=['POST'])
def update_student():
    data = request.json
    target_id = data.get('id')
    new_name = data.get('name')
    new_gpa = float(data.get('gpa'))

    global main_stack, temp_stack
    found = False
    temp_stack.clear()
    
    while len(main_stack) > 0:
        s = main_stack.pop()
        if s['id'] == target_id:
            s['name'] = new_name
            s['gpa'] = new_gpa
            found = True
            temp_stack.append(s)
            break
        temp_stack.append(s)

    while len(temp_stack) > 0: 
        main_stack.append(temp_stack.pop())

    if found:
        save_data()
        return jsonify({'status': 'success', 'message': 'Cập nhật thành công!'})
    return jsonify({'status': 'error', 'message': 'Không tìm thấy ID!'})

@app.route('/api/delete', methods=['POST'])
def delete_student():
    target_id = request.json.get('id')
    global main_stack, temp_stack
    found = False
    temp_stack.clear()
    while len(main_stack) > 0:
        s = main_stack.pop()
        if s['id'] == target_id:
            found = True
            break
        temp_stack.append(s)
    while len(temp_stack) > 0: main_stack.append(temp_stack.pop())
    if found:
        save_data()
        return jsonify({'status': 'success', 'message': 'Đã xóa bản ghi thành công.'})
    return jsonify({'status': 'error', 'message': 'Lỗi: Không tìm thấy ID!'})

@app.route('/api/sort', methods=['POST'])
def sort_students():
    global main_stack, temp_stack
    temp_stack.clear()
    while len(main_stack) > 0:
        current = main_stack.pop()
        while len(temp_stack) > 0 and temp_stack[-1]['gpa'] < current['gpa']:
            main_stack.append(temp_stack.pop())
        temp_stack.append(current)
    while len(temp_stack) > 0: main_stack.append(temp_stack.pop())
    save_data()
    return jsonify({'status': 'success', 'message': 'Đã hoàn tất sắp xếp.'})

if __name__ == '__main__':
    load_data()
    app.run(debug=True)