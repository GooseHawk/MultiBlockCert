# coding: utf-8
import json
from pyld import jsonld
from merkleproof.MerkleTree import MerkleTree
from merkleproof.MerkleTree import sha256

import logging


def do_hash_certificate(certificate):
      """
      Hash the JSON-LD normalized certificate
      :param certificate:
      :return:
      """
      options = {'algorithm': 'URDNA2015', 'format': 'application/nquads'}
      cert_utf8 = certificate.decode('utf-8')
      cert_json = json.loads(cert_utf8)
      normalized = jsonld.normalize(cert_json, options=options)
      hashed = sha256(normalized)
      #self.tree.add_leaf(hashed, False)
      return hashed
  
if __name__ == '__main__':
       print (do_hash_certificate({"name":"zhangsan"}))
