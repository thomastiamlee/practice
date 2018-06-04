x = raw_input();

import csv
import sys
import math
import numpy as np
import random
from hmmlearn import hmm
from sklearn.externals import joblib

arraystring = x
test = arraystring.split(",")

test = np.array(test)
test = test.astype(np.int)
test = test.reshape(-1,1)

emodel = joblib.load("api/app_modules/classifier/c1model.pkl")
cmodel = joblib.load("api/app_modules/classifier/c2model.pkl")

escore = emodel.score(test)
cscore = cmodel.score(test)

conf = abs(escore - cscore)

if cscore > escore and conf >= 1.0:
    print "yes"
else:
    print "no"
