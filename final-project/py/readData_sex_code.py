import pandas as pd 
import csv

df = pd.read_csv('Arrest_Data_from_2010_to_Present.csv', low_memory=False, error_bad_lines=False, chunksize = 200000)

'''find out the number of rows in the file'''
#print(sum(1 for row in open('Arrest_Data_from_2010_to_Present.csv', 'r')))

'''read 6 lines only'''
#df = pd.read_csv('Arrest_Data_from_2010_to_Present.csv', nrows=6)
#print(df.head())

#store the results in these values
result = None
result_male = None
result_female = None

'''big dataset are analyzed by chuncks'''
for chunk in df:

    chunk  = chunk.set_index(chunk['Arrest_Date']) 
    
    #females 
    #choose Sex_Code only females, then filter only by Sex_Code, convert index to datetime objects  
    #resample by month and  rename the column Sex_Code to "Females"
    tmp_female = chunk.loc[chunk['Sex_Code'] == 'F'] 
    tmp_female = tmp_female.filter(items=['Sex_Code']) 
    tmp_female.index = pd.to_datetime(tmp_female.index)
        
    tmp_female = tmp_female.resample('M').count()
    tmp_female = tmp_female.rename(columns={'Sex_Code':'Females'})
    
    #males
    #same technique as for females was used
    tmp_male = chunk.loc[chunk['Sex_Code'] == 'M'] 
    tmp_male = tmp_male.filter(items=['Sex_Code']) 
    tmp_male.index = pd.to_datetime(tmp_male.index)
    tmp_male = tmp_male.resample('M').count()
    tmp_male = tmp_male.rename(columns={'Sex_Code':'Males'})    
        
    #res = pd.merge(tmp, tmp_male, left_index=True, right_index=True)
    #print(res)
    if result is None:  # first chunk
        result_female = tmp_female.copy()
        result_male = tmp_male.copy()    
        result = pd.merge(result_male, result_female, left_index=True, right_index=True)
        print(result)
    else:  # all other chunks
        result_female = result_female.add(tmp_female, fill_value=0).astype(int)
        result_male = result_male.add(tmp_male, fill_value=0).astype(int)
        result = pd.merge(result_male, result_female, left_index=True, right_index=True) 
        print(result)

print("=============================")
print(result)
  
'''write result to CSV'''
result.to_csv('arrests_male_and_females.csv', sep=',')
