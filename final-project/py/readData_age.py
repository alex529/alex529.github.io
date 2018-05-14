import pandas as pd 
import csv

df = pd.read_csv('Arrest_Data_from_2010_to_Present.csv', low_memory=False, error_bad_lines=False, chunksize = 200000)

'''find out the number of rows in the file'''
#print(sum(1 for row in open('Arrest_Data_from_2010_to_Present.csv', 'r')))

'''read 6 lines only'''
#df = pd.read_csv('Arrest_Data_from_2010_to_Present.csv', nrows=6)
#print(df.head())

#store the results in these values
#genders 
result = None
result_children = None
result_teenager = None
result_adult = None
result_old = None

result_0_9 = None
result_10_19 = None
result_20_29 = None
result_30_39 = None
result_40_49 = None
result_50_59 = None
result_60_69 = None
result_70_plus = None

'''big dataset are analyzed by chuncks'''
for chunk in df:
    #rename columns with _
    chunk = chunk.rename(columns={'Arrest Date':'Arrest_Date'})
    
    #set index as date
    chunk  = chunk.set_index(chunk['Arrest_Date'])
    
    #age
    #0-9
    tmp_0_9 = chunk.loc[chunk['Age'] <= 9] 
    tmp_0_9 = tmp_0_9.filter(items=['Age']) 
    tmp_0_9.index = pd.to_datetime(tmp_0_9.index)   
    tmp_0_9 = tmp_0_9.resample('M').count()
    tmp_0_9 = tmp_0_9.rename(columns={'Age':'0 - 9'})
    
    #10-19
    tmp_10_19 = chunk.loc[(chunk['Age'] > 9) & (chunk['Age'] <= 19)] 
    tmp_10_19 = tmp_10_19.filter(items=['Age']) 
    tmp_10_19.index = pd.to_datetime(tmp_10_19.index)   
    tmp_10_19 = tmp_10_19.resample('M').count()
    tmp_10_19 = tmp_10_19.rename(columns={'Age':'10 - 19'}) 

    #20-29
    tmp_20_29 = chunk.loc[(chunk['Age'] > 19) & (chunk['Age'] <= 29)] 
    tmp_20_29 = tmp_20_29.filter(items=['Age']) 
    tmp_20_29.index = pd.to_datetime(tmp_20_29.index)   
    tmp_20_29 = tmp_20_29.resample('M').count()
    tmp_20_29 = tmp_20_29.rename(columns={'Age':'20 - 29'})
    
    #30-39
    tmp_30_39 = chunk.loc[(chunk['Age'] > 29) & (chunk['Age'] <= 39)] 
    tmp_30_39 = tmp_30_39.filter(items=['Age']) 
    tmp_30_39.index = pd.to_datetime(tmp_30_39.index)   
    tmp_30_39 = tmp_30_39.resample('M').count()
    tmp_30_39 = tmp_30_39.rename(columns={'Age':'30 - 39'}) 

    #40-49
    tmp_40_49 = chunk.loc[(chunk['Age'] > 39) & (chunk['Age'] <= 49)] 
    tmp_40_49 = tmp_40_49.filter(items=['Age']) 
    tmp_40_49.index = pd.to_datetime(tmp_40_49.index)   
    tmp_40_49 = tmp_40_49.resample('M').count()
    tmp_40_49 = tmp_40_49.rename(columns={'Age':'40 - 49'})
    
    #50-59
    tmp_50_59 = chunk.loc[(chunk['Age'] > 49) & (chunk['Age'] <= 59)] 
    tmp_50_59 = tmp_50_59.filter(items=['Age']) 
    tmp_50_59.index = pd.to_datetime(tmp_50_59.index)   
    tmp_50_59 = tmp_50_59.resample('M').count()
    tmp_50_59 = tmp_50_59.rename(columns={'Age':'50 - 59'}) 

    #60-69
    tmp_60_69 = chunk.loc[(chunk['Age'] > 59) & (chunk['Age'] <= 69)] 
    tmp_60_69 = tmp_60_69.filter(items=['Age']) 
    tmp_60_69.index = pd.to_datetime(tmp_60_69.index)   
    tmp_60_69 = tmp_60_69.resample('M').count()
    tmp_60_69 = tmp_60_69.rename(columns={'Age':'60 - 69'})
    
    #70-plus
    tmp_70_plus = chunk.loc[(chunk['Age'] > 69) & (chunk['Age'] <= 150)] 
    tmp_70_plus = tmp_70_plus.filter(items=['Age']) 
    tmp_70_plus.index = pd.to_datetime(tmp_70_plus.index)   
    tmp_70_plus = tmp_70_plus.resample('M').count()
    tmp_70_plus = tmp_70_plus.rename(columns={'Age':'70 +'})     

    
    if result is None:  # first chunk
        result_0_9 = tmp_0_9.copy()
        result_10_19 = tmp_10_19.copy()
        result_20_29 = tmp_20_29.copy()
        result_30_39 = tmp_30_39.copy()
        result_40_49 = tmp_40_49.copy()
        result_50_59 = tmp_50_59.copy()
        result_60_69 = tmp_60_69.copy()
        result_70_plus = tmp_70_plus.copy()
       
       #merge
        
        result = result_0_9.merge(result_10_19, left_index=True, right_index=True, how='outer').merge(result_20_29, left_index=True, right_index=True, how='outer').merge(result_30_39, 
                left_index=True, right_index=True, how='outer').merge(result_40_49, left_index=True, right_index=True, how='outer').merge(result_50_59, 
                left_index=True, right_index=True, how='outer').merge(result_60_69, left_index=True, right_index=True, how='outer').merge(result_70_plus, 
                left_index=True, right_index=True, how='outer')
        result = result.fillna(int(0))
        #result = pd.merge(result_children, result_teenager, left_index=True, right_index=True) 
        print('#1')
        print(result)
    else:  # all other chunks
        result_0_9 = result_0_9.add(tmp_0_9, fill_value=0).astype(int)
        result_10_19 = result_10_19.add(tmp_10_19, fill_value=0).astype(int)
        result_20_29 = result_20_29.add(tmp_20_29, fill_value=0).astype(int)
        result_30_39 = result_30_39.add(tmp_30_39, fill_value=0).astype(int)
        result_40_49 = result_40_49.add(tmp_40_49, fill_value=0).astype(int)
        result_50_59 = result_50_59.add(tmp_50_59, fill_value=0).astype(int)
        result_60_69 = result_60_69.add(tmp_60_69, fill_value=0).astype(int)
        result_70_plus = result_70_plus.add(tmp_70_plus, fill_value=0).astype(int)        
       
       #merge
        
        result = result_0_9.merge(result_10_19, left_index=True, right_index=True, how='outer').merge(result_20_29, left_index=True, right_index=True, how='outer').merge(result_30_39, 
                left_index=True, right_index=True, how='outer').merge(result_40_49, left_index=True, right_index=True, how='outer').merge(result_50_59, 
                left_index=True, right_index=True, how='outer').merge(result_60_69, left_index=True, right_index=True, how='outer').merge(result_70_plus, 
                left_index=True, right_index=True, how='outer')
        result = result.fillna(int(0))        
        #result = pd.merge(result_children, result_teenager, left_index=True, right_index=True)
        print('#2')
        print(result)
print("=============================")
print(result)
'''write result to CSV'''
result.to_csv('arrests_age.csv', sep=',')
