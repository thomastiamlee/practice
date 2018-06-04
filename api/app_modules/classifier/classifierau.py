x = raw_input();
y = raw_input();
z = raw_input();

import csv
import sys
import math
import numpy as np
import random
from hmmlearn import hmm
from sklearn.externals import joblib

arraystring1 = x
test1 = arraystring1.split(",")
test1 = np.array(test1)
test1 = test1.astype(np.int)
test1 = test1.reshape(-1,1)

arraystring2 = y
test2 = arraystring2.split(",")
test2 = np.array(test2)
test2 = test2.astype(np.int)
test2 = test2.reshape(-1,1)

arraystring3 = z
test3 = arraystring3.split(",")
test3 = np.array(test3)
test3 = test3.astype(np.int)
test3 = test3.reshape(-1,1)

emodelbf = joblib.load("api/app_modules/classifier/c1modelbf.pkl")
cmodelbf = joblib.load("api/app_modules/classifier/c2modelbf.pkl")
emodelew = joblib.load("api/app_modules/classifier/c1modelew.pkl")
cmodelew = joblib.load("api/app_modules/classifier/c2modelew.pkl")
emodelmo = joblib.load("api/app_modules/classifier/c1modelmo.pkl")
cmodelmo = joblib.load("api/app_modules/classifier/c2modelmo.pkl")

escorebf = emodelbf.score(test1)
cscorebf = cmodelbf.score(test1)
escoreew = emodelew.score(test2)
cscoreew = cmodelew.score(test2)
escoremo = emodelmo.score(test3)
cscoremo = cmodelmo.score(test3)

confbf = abs(escorebf - cscorebf)
confew = abs(escoreew - cscoreew)
confmo = abs(escoremo - cscoremo)

if cscorebf > escorebf and confbf >= 1.0:
    print "yes"
elif cscoreew > escoreew and confew >= 1.0:
    print "yes"
elif cscoremo > escoremo and confmo >= 1.0:
    print "yes"
else:
    print "no"
