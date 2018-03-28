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
    #if(chunk.query('BORO_NM == "QUEENS"')):
    queens = chunk['BORO_NM'] == "QUEENS"
    #print(queens)
    #print('outside IF')
    
    #if(chunk['BORO_NM'][(chunk.BORO_NM == "QUEENS")].any()):
        #print(chunk['BORO_NM'][(chunk.BORO_NM == "QUEENS")])
        #print('inside IF')
        #print(chunk['PD_DESC'].value_counts())
        #print(chunk['BORO_NM'][(chunk.BORO_NM == "QUEENS")])
    '''crimes only in QUEENS'''
    #tmp = chunk['PD_DESC'][(chunk.BORO_NM == "QUEENS")|(chunk.BORO_NM == "BROOKLYN")&(chunk.CMPLNT_FR_DT > '2016-01-01') ].value_counts()
    tmp = chunk['PD_DESC'][(chunk.BORO_NM == "QUEENS") & (chunk.CMPLNT_FR_DT > '2016-01-01') ].value_counts()
    if result is None:  # first chunk
        result = tmp.copy()
        #print(result)
    else:  # all other chunks
        result = result.add(tmp, fill_value=0).astype(int)
        #print(result)
        print("loading")

print(result.sort_values( ascending=True))            
'''ONLY QUEENS'''
'''      
#print(chunk['BORO_NM'][(chunk.BORO_NM == "QUEENS")])
        tmp = chunk['BORO_NM'][(chunk.BORO_NM == "QUEENS")].value_counts()
        if result is None:  # first chunk
            result = tmp.copy()
            print(result)
        else:  # all other chunks
            result = result.add(tmp, fill_value=0).astype(int)
            print(result)
'''    

'''crime'''
#   print(chunk['PD_DESC'].value_counts())
'''write result to CSV'''
#result.to_csv('stackedAreaChart.csv', sep=',')
