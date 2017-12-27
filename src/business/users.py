from flask import session,request,redirect,url_for,render_template,flash
from . import app
from . import db



@app.route('/login', methods=['GET', 'POST'])
def log():
    error = None
    if request.method == "POST":
        if request.form['username'] != '' or request.form['password'] != '':
            cursor = db.users.find({ 'uname' : request.form['username'],"upasswd": request.form['password']})
            print({ 'uname' : request.form['username'],'upasswd': request.form['password']})
            if(cursor.count()>0):
                session['logged_in'] = True
                session['uname'] = request.form['username']
                records = list(cursor)
                role = records[0]['role']
                if(role=='student'):
                    return redirect(url_for('studentHome'))
                elif(role=='approver'):
                    return redirect(url_for('approverHome'))
                else:
                    return redirect(url_for('schoolHome'))
        else:
            error = 'Invalid Username and/or password.'
            return redirect(url_for('login.html'))
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash("You have successfully logged")
    return redirect (url_for('index'))