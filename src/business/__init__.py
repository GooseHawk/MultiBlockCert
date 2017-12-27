from flask import *
from functools import wraps
from mongo import connect
import logging
from logging.handlers import RotatingFileHandler
from functools import wraps
from mongo import connect

#from config import conf


app = Flask(__name__)
app.secret_key = 'token'
app.config['ASK_VERIFY_REQUESTS'] = False
db = connect();

handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=1)
handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s '
    '[in %(pathname)s:%(lineno)d]'
))
handler.setLevel(logging.WARNING)
app.logger.addHandler(handler)



from .index import *
from .users import *
from .records import *
from .certifacte import *
from .setting import *

