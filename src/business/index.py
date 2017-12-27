
from flask import session,request,json,redirect,url_for,render_template,flash
from . import app
from . import db


from functools import wraps


##alternate db config settings
#app.config['MONGO_DBNAME'] = 'app_db'
#app.config['MONGO_HOST'] = 'cluster0-shard-00-00-pllyi.mongodb.net'
#app.config['MONGO_PORT'] = 27017
#app.config['MONGO_USERNAME'] = 'multi-sig'
#app.config['MONGO_PASSWORD'] = 'multi-sig'
#mongo = PyMongo(app, config_prefix='MONGO')


#test to see if login is in session
def login_required(test):
	@wraps(test)
	def wrap(*args, **kwargs):
		if 'logged_in' in session:
			return test(*args, **kwargs)
		else:
			flash('Please login to your account.')
			return redirect(url_for('log'))
	return wrap	

@app.route('/')
def index():
	return render_template('/home.html')

@app.route('/about')
def about():
	return render_template('about.html')

@app.route('/contact')
def contact():
	return render_template('contact.html')

@app.route('/issuedCertificates')
@login_required
def issuedCertificates():
	return render_template('issuedCertificates.html')

@app.route('/unIssuedCertificates')
@login_required
def unIssuedCertificates():
	return render_template('unIssuedCertificates.html')

@app.route('/school-home')
@login_required
def schoolHome():
	return render_template('school-home.html')

@app.route('/student-home')
@login_required
def studentHome():
	return render_template('student-home.html')


@app.route('/approver-home')
@login_required
def approverHome():
	return render_template('approver-home.html')

@app.route('/unBroadcastTran')
@login_required
def unBroadcastTran():
	return render_template('unBroadcastTran.html')

@app.route('/broadcastTran')
@login_required
def broadcastTran():
	return render_template('broadcastTran.html')


#if __name__== '__main__':
	#app.run(debug=True) #remove debuger=True for production
