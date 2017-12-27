# coding: utf-8
import importlib

from config import conf


def connect():
    driverModule = importlib.import_module('.' + conf.DATABASE_DRIVER, package='mongo')
    dbConfig = {
        'host_port': conf.DATABASE_HOST_PORT,
        'user': conf.DATABASE_USER,
        'pwd': conf.DATABASE_PASS,
        'database': conf.DATABASE_DB,
        'condition':conf.DATABASE_CONDITION
    }
    driver = driverModule.DB(**dbConfig)
    return driver.get()