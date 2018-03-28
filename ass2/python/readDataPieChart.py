import pandas as pd 
import csv

df = pd.read_csv('NYPD_Complaint_Data_Historic.csv', low_memory=False, error_bad_lines=False, chunksize = 200000)

'''find out the number of rows in the file'''
#print(sum(1 for row in open('NYPD_Complaint_Data_Historic.csv', 'r')))

'''read 6 lines only'''
#df = pd.read_csv('NYPD_Complaint_Data_Historic.csv', nrows=6)
#print(df.head())

result = None

'''count all the accurances of BORO_NM and add them all together for Pie Plot'''
for chunk in df:
    tmp =chunk['BORO_NM'].value_counts()
    if result is None:  # first chunk
        result = tmp.copy()
        print(result)
    else:  # all other chunks
        result = result.add(tmp, fill_value=0).astype(int)
        print(result)
'''testing prints from the dataframe'''        
    #print(chunk['BORO_NM'].value_counts())
    #print(chunk['BORO_NM'].head())
    #print(chunk['BORO_NM'])
''' transform to an array'''
    #print(chunk['BORO_NM'].tolist())
    
'''write result to CSV'''
result.to_csv('pieChart.csv', sep=',')
