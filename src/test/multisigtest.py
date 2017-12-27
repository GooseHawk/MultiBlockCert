# demo of t of n multisig 
import sys
from bitcoin import *


# usage: python MakeMultiSig.py min max
# defaults to 2 of 3. maximum 16 of 16 

# THIS IS FOR EDUCATIONAL PURPOSES ONLY!!!!
# lacks security for the private keys 
# you'd want to use bip32 

privkeys, pubkeys, addrs = [], [], []
privkeys = [random_key() for x in range(0, 3)]
pubkeys = [privtopub(x) for x in privkeys]
addrs = [privtoaddr(x, magicbyte=0) for x in privkeys] # magicbyte = 0x6f for testnet
mykeys = zip(privkeys, pubkeys, addrs)

print mykeys
pubkeys = ['038b1df5a4e05a0ee0a36b5d3a1e44c22ebdb2a0ce57df45650b06b167a85d48d4','0379ed77927da05af3b854248c0a6b15e10b41437307c1f6e099f755fc0b973ae3','031cf51d3076172465633b6faca2499da938b1c99832922533bcbfc1cf9c408841']
rawscript = mk_multisig_script(pubkeys, 2)  # means make a 2 of 3 multisig redeemScript
descript = deserialize_script(rawscript) # shows the op_codes pushed to stack
print descript
print rawscript

# cheating here, but see comments following
scriptaddress = scriptaddr(rawscript)    # 37TtE1nfm51u6LNkNzzsjuBcuYmhTEmkq6

print scriptaddress