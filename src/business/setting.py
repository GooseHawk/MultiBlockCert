from flask import session,request,json
from . import app
from . import db


@app.route("/getSchoolSetting")
def getSchoolSetting():
    cursor = db.sch_certifactes.find({},{'_id':0}).sort([('r_id',1)])
    records = list(cursor)
    rjon = json.dumps(records)
    return rjon