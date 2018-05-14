import pandas as pd 
import csv
import json
import io
import numpy as np

df = pd.read_csv('Arrest_Data_from_2010_to_Present.csv', low_memory=False, error_bad_lines=False, chunksize = 200000)

result_sex_code = None
result_descent_code = None

for chunk in df:
    #rename columns with _
    chunk = chunk.rename(columns={'Arrest Date':'Arrest_Date'})
    chunk = chunk.rename(columns={'Sex Code':'Sex_Code'})
    chunk = chunk.rename(columns={'Descent Code':'Descent_Code'})
    #count the number of occurances
    tmp_sex_code = chunk['Sex_Code'].value_counts()
    tmp_descent_code = chunk['Descent_Code'].value_counts()
    
    if result_sex_code is None:  # first chunk
        result_sex_code = tmp_sex_code.copy()
        result_descent_code = tmp_descent_code.copy()
    else:  # all other chunks
        result_sex_code = result_sex_code.add(tmp_sex_code, fill_value=0).astype(int)
        result_descent_code = result_descent_code.add(tmp_descent_code, fill_value=0).astype(int)

'''CSV'''
result_sex_code.to_csv('sex_code_pie_chart.csv', sep=',')
result_descent_code.to_csv('descent_code_pie_chart.csv', sep=',')          
