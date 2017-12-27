# coding: utf-8

import os


# WEBSITE CONFIG #
HOST = 'localhost'
PORT = 8888
#curpath = os.path.dirname(__file__)
#curpath = curpath[0:int(curpath.index('\config'))]

# APPLICATION CONFIG #
SETTINGS = {
    #'template_path': curpath + '\\templates',
    #'static_path': curpath + '\\static',
    'template_path': '../templates',
    'static_path': '../static',
    'cookie_secret': '!@#$%^&*()_+',
    'xsrf_cookies': True,
    'debug': False,
    'access_log': True
}

# DATABASE CONFIG #
DATABASE_DRIVER = 'mongo'
DATABASE_HOST_PORT = 'cluster0-shard-00-00-pllyi.mongodb.net:27017,cluster0-shard-00-01-pllyi.mongodb.net:27017,cluster0-shard-00-02-pllyi.mongodb.net:27017'
DATABASE_USER = 'multi_sig'
DATABASE_PASS = 'multi_sig'
DATABASE_DB = 'app_db'
DATABASE_CONDITION = 'ssl=true&replicaSet=Cluster0-shard-0&authSource=admin'
