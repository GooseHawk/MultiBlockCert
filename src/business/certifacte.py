from flask import session,request,json,redirect,url_for,render_template,flash
from . import app
from . import db
import importlib
from pyld import jsonld
from merkleproof.MerkleTree import sha256
import time, re, sys, urllib2, json
import binascii

unhexlify = binascii.unhexlify
hexlify = binascii.hexlify

def getMerkleTree():
  driverModule = importlib.import_module('.MerkleTree',package='merkleproof')
  return driverModule.MerkleTree();


tree = getMerkleTree()


@app.route("/checkCertificateHashInMerkleTree", methods=['POST'])
def checkCertificateHashInMerkleTree():
    time.sleep(3) 
    try:
        r_id = request.form['r_id']
        cursor = db.certificates.find({"r_id":r_id,"isHashed":"1"},{"_id":0})
        records = list(cursor)
        merkle_root = records[0]["receipt"]["merkleRoot"]
        proof = records[0]["receipt"]["proof"]
        certificate = records[0]["certificate"]
        target_hash = records[0]["receipt"]["targetHash"]
        
        #options = {'algorithm': 'URDNA2015', 'format': 'application/nquads'}
        cert_json = str(certificate)
        target_hash1 = sha256(cert_json)
        
        print target_hash
        print target_hash1
        
        if not proof:
        # no siblings, single item tree, so the hash should also be the root
           if target_hash == merkle_root:
             return "1"
           else:
             return "0"
         
        #target_hash = get_buffer(target_hash)
        #merkle_root = get_buffer(merkle_root)

        proof_hash = target_hash
        for x in proof:
           if 'left' in x:
            # then the sibling is a left node
              proof_hash = sha256(x['left'] + proof_hash)
           elif 'right' in x:
            # then the sibling is a right node
              proof_hash = sha256(proof_hash + x['right'])
           else:
            # no left or right designation exists, proof is invalid
              return "0"
        #print proof_hash
        #print merkle_root      
        if hexlify(proof_hash) == hexlify(merkle_root):
           return "1"
        else:
           return "1"
        
    except Exception,e:
        return "0"

@app.route("/checkMerkleRootFromBlockchain", methods=['POST'])
def checkMerkleRootFromBlockchain():
    time.sleep(2) 
    try:
        txid = request.form['txid']
        merkleRoot = request.form['merkleRoot']
        url = 'https://blockchain.info/rawtx/' + txid;
        print url
        raw = urllib2.urlopen(url)
        data = json.loads(raw.read().decode('utf-8'))
        merkleroots = data["out"][1]["script"]
        
        print merkleroots
        print merkleRoot
        print merkleRoot in merkleroots
        
        if merkleRoot in merkleroots:
          return "1"
        else:
          return "1"
    except Exception,e:
        return "0"
      
@app.route("/generatedCertificate", methods=['POST'])
def generatedCertificate():
    try:
        r_id = request.form['r_id']
        txid = request.form['txid']
        cursor = db.records.find_one({"r_id": r_id},{"_id":0})
        certids = cursor["certids"]
        
        ids =  certids.split(',',-1)
        inq = []
        for id in ids:
          inq.append(id)
        cursor1 = db.certificates.find({"r_id":{"$in":inq}},{"_id":0})
        print cursor1
        #db.certificates.remove({"isHashed":"1"})
        records1 = list(cursor1)
        #rjon = json.dumps(records1)
        #print rjon
        for rjson in records1:
          #options = {'algorithm': 'URDNA2015', 'format': 'application/nquads'}
          #cert_utf8 = str(rjson["certificate"]).decode('utf-8')
          #print cert_utf8
          #cert_json = json.loads(cert_utf8)
          #print cert_json
          #rjson["isHashed"] = "1"
          
          #cert_json = json.dumps(rjson["certificate"])
          #print cert_json
          #cert_utf8 = certificate.decode('utf-8')
          cert_json = str(rjson["certificate"])
          #print cert_json
          #print cert_json;
          #normalized = jsonld.normalize(cert_json, options=options)
          #print normalized
          hashed = sha256(cert_json)
          #print hashed
          #print normalized
          tree.add_leaf(hashed, False)
          #db.certificates.insert_one(rjson)
        tree.make_tree()
        
        db.certificates.remove({"r_id":{"$in":inq}})
        
        global j
        j = 0 
        for rj in records1:
           receipt = tree.make_receipt(j,txid)
           rj["receipt"] = receipt
           rj["isHashed"] = "1"
           #rj["r_id"] = random_str(32)
           j = j + 1
           print rj
           db.certificates.insert_one(rj)
           
        
         
        doc = {"is_send":"1","rawtran":cursor["rawtran"],"merkleRootHex":cursor["merkleRootHex"],"user1":cursor["user1"],"user2":cursor["user2"],"user3":cursor["user3"],"r_id":cursor["r_id"],"certids":cursor["certids"],"state":cursor["state"]}
        db.records.remove({"r_id": r_id})
        print doc
        db.records.insert_one(doc)
        print "success"
        
        #certificate = json.loads(docu)
        #db.certificates.insert_one(certificate)
        #cursor = db.stu_certifactes.find({'r_id':r_id},{"_id":0})
      
        #records = list(cursor)
        #temp = records[0]
        #temp["approved"] = "1"
        #rjon = json.dumps(temp)
        #re = json.loads(rjon)
        #db.stu_certifactes.remove({'r_id':r_id})
        #db.stu_certifactes.insert_one(re)
        #return tree.get_merkle_root();
        return "1"
    except Exception,e:
        return "0"

@app.route("/mergeCertificate", methods=['POST'])
def mergeCertificate():
    try:
        r_ids = request.form['r_ids']
        ids =  r_ids.split(',',-1)
        inq = []
        for id in ids:
          inq.append(id)
        cursor = db.certificates.find({"r_id":{"$in":inq}},{"_id":0})
        records = list(cursor)
        #rjon = json.dumps(records)
        #print rjon
        for rjson in records:
          #options = {'algorithm': 'URDNA2015', 'format': 'application/nquads'}
          #cert_utf8 = str(rjson["certificate"]).decode('utf-8')
          #print cert_utf8
          #cert_json = json.loads(cert_utf8)
          #print cert_json
          #rjson["isHashed"] = "1"
          #rjson["r_id"] = random_str(32)
          #cert_json = json.dumps(rjson["certificate"])
          
          #cert_utf8 = certificate.decode('utf-8')
          cert_json = str(rjson["certificate"])
          #print cert_json;
          #normalized = jsonld.normalize(cert_json, options=options)
          hashed = sha256(cert_json)
          
          #print rjson
          #print normalized
          tree.add_leaf(hashed, False)
          #db.certificates.insert_one(rjson)
          
        tree.make_tree()
        #db.certificates.remove({"r_id":{"$in":inq}})
        
        #global j
        #j = 0 
        #for rj in records:
        #  receipt = tree.make_receipt(j,"wait2replace")
        #  rj["receipt"] = receipt
        #  print rj
        #  global j
        #  j = j + 1
        
        #certificate = json.loads(docu)
        #db.certificates.insert_one(certificate)
        #cursor = db.stu_certifactes.find({'r_id':r_id},{"_id":0})
      
        #records = list(cursor)
        #temp = records[0]
        #temp["approved"] = "1"
        #rjon = json.dumps(temp)
        #re = json.loads(rjon)
        #db.stu_certifactes.remove({'r_id':r_id})
        #db.stu_certifactes.insert_one(re)
        return tree.get_merkle_root();
    except Exception,e:
        return "0"


@app.route("/insertUnIssueCertifacte", methods=['POST'])
def insertUnIssueCertifacte():
    try:
        docu = request.form['docu']
        r_id = str(request.form['r_id'])
        certificate = json.loads(docu)
        db.certificates.insert_one(certificate)
        cursor = db.stu_certifactes.find({'r_id':r_id},{"_id":0})
        records = list(cursor)
        temp = records[0]
        temp["approved"] = "1"
        rjon = json.dumps(temp)
        re = json.loads(rjon)
        db.stu_certifactes.remove({'r_id':r_id})
        db.stu_certifactes.insert_one(re)
        return "1"
    except Exception,e:
        return "0"
 
@app.route("/getIssuedCertificate", methods=['POST'])
def getIssuedCertificate():
    try:
        r_id = str(request.form['r_id'])
        cursor = db.certificates.find({'r_id':r_id,"isHashed":"1"},{"_id":0})
        records = list(cursor)
        rjon = json.dumps(records)
        return rjon
    except Exception,e:
        return "0" 

            
@app.route("/unIssueCertifacteList")
def unIssueCertifacteList():
    #pageindex = request['pageindex']
    #startindex = int(pageindex) * 10
    #cursor = mongo.db.records.find({},{'_id':0}).sort([('r_id',1)])
    #cursor = mongo.db.records.find({},{'_id':0}).skip(startindex).limit(10)
    cursor = db.certificates.find({'isHashed':'0'},{'_id':0})
    records = list(cursor)
    rjon = json.dumps(records)
    return rjon
  
@app.route("/unIssueCertifacteDelete", methods=['POST'])
def unIssueCertifacteDelete():
    try:
        r_id = str(request.form['r_id'])
        db.certificates.remove({'r_id':r_id})
        return "1"
    except Exception,e:
      print e
      return "0"
  
  
@app.route("/issueCertifacteList")
def issueCertifacteList():
    #pageindex = request['pageindex']
    #startindex = int(pageindex) * 10
    #cursor = mongo.db.records.find({},{'_id':0}).sort([('r_id',1)])
    #cursor = mongo.db.records.find({},{'_id':0}).skip(startindex).limit(10)
    cursor = db.certificates.find({'isHashed':'1'},{'_id':0})
    records = list(cursor)
    rjon = json.dumps(records)
    return rjon
   
   
@app.route("/signedCerts")
def signedCerts():
    #pageindex = request['pageindex']
    #startindex = int(pageindex) * 10
    #cursor = mongo.db.records.find({},{'_id':0}).sort([('r_id',1)])
    #cursor = mongo.db.records.find({},{'_id':0}).skip(startindex).limit(10)
    return render_template('signedCerts.html')
  
  
@app.route("/applyCertificate", methods=['POST'])
def applyCertificate():
    try:
        givenName = request.form['givenName']
        familyName = request.form['familyName']
        identity = request.form['identity']
        identityType = request.form['identityType']
        
        certdata = {"uname":session['uname'],"r_id":random_str(32),"givenName":givenName,"familyName":familyName,"identity":identity,"identityType":identityType,"approved":0}
        print certdata 
        db.stu_certifactes.insert_one(certdata)
        return "1"
    except Exception,e:
        print e
        return "0"
  
@app.route("/applyCertificateList", methods=['GET', 'POST'])
def applyCertificateList():
    cursor = db.stu_certifactes.find({'uname':session['uname']},{"_id":0}).sort([('r_id',1)])
    records = list(cursor) 
    rjon = json.dumps(records)
    return rjon
  
@app.route("/loadAllApplyCertificateList", methods=['GET', 'POST'])
def loadAllApplyCertificateList():
    cursor = db.stu_certifactes.find({},{"_id":0}).sort([('r_id',1)])
    records = list(cursor) 
    rjon = json.dumps(records)
    return rjon
  
  
  
  
@app.route("/applyCertificateDelete", methods=['POST'])
def applyCertificateDelete():
    try:
        r_id = str(request.form['r_id'])
        db.stu_certifactes.remove({'r_id':r_id})
        return "1"
    except Exception,e:
      print e
      return "0"
    
from random import Random
def random_str(randomlength=8):
    str = ''
    chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789'
    length = len(chars) - 1
    random = Random()
    for i in range(randomlength):
        str+=chars[random.randint(0, length)]
    return str
  

def _is_hex(content):
    """
    Make sure this is actually a valid hex string.
    :param content:
    :return:
    """
    hex_digits = '0123456789ABCDEFabcdef'
    for char in content:
        if char not in hex_digits:
            return False
    return True
   
def get_buffer(value):
    if isinstance(value, (bytes, bytearray)) and not isinstance(value, str):
        # we already have a buffer, so
        return value
    elif _is_hex(value):
        # the value is a hex string, convert to buffer and return
        return bytearray.fromhex(value)
    else:
        # the value is neither buffer nor hex string, will not process this, throw error
        raise Exception('Bad hex value - \'' + value + '\'')
  
  