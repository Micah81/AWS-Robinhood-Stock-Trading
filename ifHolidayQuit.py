# -*- coding: utf-8 -*-
"""
Created on Sun Jan 14 14:52:05 2018

@author: micah
"""
import sys

file = open("/home/ec2-user/stack/isHoliday.csv", "r") 
#print file.read()
if file.read() == "true":
    sys.exit("Quitting because today is a holiday.")
else:
    print("Continuing because today is not a holiday.")
