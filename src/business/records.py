from flask import session,request,json
from . import app
from . import db



@app.route("/insertRecords", methods=['POST'])
def insertRecords():
  try:
    rawtran = request.form['rawtran']
    r_id = request.form['r_id']
    merkleRootHex = request.form['merkleRootHex']
    certids = request.form['certids']
    document = {"user1":"0","user2":"0","user3":"0","r_id":r_id,"is_send":"0","state":"0","rawtran":rawtran,"merkleRootHex":merkleRootHex,"certids":certids}
    print document
    db.records.insert_one(document)
    return "1"
  except Exception,e:
    return "0"
  
  
@app.route("/getRecordsAndCerts", methods=['POST'])
def getRecordsAndCerts():
  try:
    
    r_id = request.form['r_id']
    
    cursor = db.records.find_one({"r_id": r_id},{"_id":0})
    certids = cursor["certids"]
    
    ids =  certids.split(',',-1)
    inq = []
    for id in ids:
      inq.append(id)
    cursor1 = db.certificates.find({"r_id":{"$in":inq}},{"_id":0})
    certificates = list(cursor1)
    
    doc = {"certificates":certificates,"rawtran":cursor["rawtran"],"merkleRootHex":cursor["merkleRootHex"]}
    
    rjon = json.dumps(doc)
    #print  rjon       
    return rjon
  except Exception,e:
    return "0"
  
@app.route("/recordsDelete", methods=['POST'])
def recordsDelete():
    try:
        r_id = str(request.form['r_id'])
        db.records.remove({'r_id':r_id})
        return "1"
    except Exception,e:
      print e
      return "0"
  
@app.route("/recordslist")
def recordslist():
    cursor = db.records.find({"is_send":"1"},{'_id':0}).sort([('r_id',1)])
    records = list(cursor)
    rjon = json.dumps(records)
    return rjon
  
@app.route("/unRecordslist")
def unRecordslist():
    cursor = db.records.find({"is_send":"0"},{'_id':0}).sort([('r_id',1)])
    records = list(cursor)
    rjon = json.dumps(records)
    return rjon


@app.route("/recordsupdate", methods=['POST'])
def recordsupdate():
    try:
        uname = session['uname']
        rawtran = request.form['rawtran']
        r_id = request.form['r_id']
        cursor = db.records.find({'r_id':r_id},{'_id':0})
        records = list(cursor)
        state = int(records[0]['state'])
        if(state == 0):
            db.records.replace_one({'r_id':r_id},{'merkleRootHex':records[0]['merkleRootHex'],'certids':records[0]['certids'],'r_id':r_id,'user1':uname,'user2':records[0]['user2'],'user3':records[0]['user3'],'is_send':records[0]['is_send'],'rawtran':rawtran,'state':'1'},upsert=True)
        elif(state == 1 ):
            db.records.replace_one({'r_id':r_id},{'merkleRootHex':records[0]['merkleRootHex'],'certids':records[0]['certids'],'r_id':r_id,'user1':records[0]['user1'],'user2':uname,'user3':records[0]['user3'],'is_send':records[0]['is_send'],'rawtran':rawtran,'state':'2'},upsert=True)
        elif(state == 2 ):
            db.records.replace_one({'r_id':r_id},{'merkleRootHex':records[0]['merkleRootHex'],'certids':records[0]['certids'],'r_id':r_id,'user1':records[0]['user1'],'user2':records[0]['user2'],'user3':uname,'is_send':records[0]['is_send'],'rawtran':rawtran,'state':'3'},upsert=True)
        else:
            scond = {}
    except Exception,e:
        print str(e)
        return '0'
    return '1'
