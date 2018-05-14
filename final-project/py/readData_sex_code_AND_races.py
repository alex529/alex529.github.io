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
result_male = None
result_female = None
#races
result_races = None
result_A = None
result_B = None
result_C = None
result_D = None
result_F = None
result_G = None
result_H = None
result_I = None
result_J = None
result_L = None
result_O = None
result_P = None
result_S = None
result_U = None
result_V = None
result_W = None
result_X = None
result_Z = None
#resampling for some groups
result_asians = None
result_other = None

'''big dataset are analyzed by chuncks'''
for chunk in df:
    #rename columns with _
    chunk = chunk.rename(columns={'Arrest Date':'Arrest_Date'})
    chunk = chunk.rename(columns={'Sex Code':'Sex_Code'})
    chunk = chunk.rename(columns={'Descent Code':'Descent_Code'})
    #set index as date
    chunk  = chunk.set_index(chunk['Arrest_Date'])
    
    #sex code
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
  
    #races
    def change_race(index_race, name_race): 
        tmp = chunk.loc[chunk['Descent_Code'] == index_race] 
        tmp = tmp.filter(items=['Descent_Code']) 
        tmp.index = pd.to_datetime(tmp.index)
        tmp = tmp.resample('M').count()
        tmp = tmp.rename(columns={'Descent_Code': name_race})            
        return tmp

    tmp_A = change_race('A', 'Other_Asian')
    tmp_B = change_race('B', 'Blacks')
    tmp_C = change_race('C', 'Chinese')
    tmp_D = change_race('D', 'Cambodian')
    tmp_F = change_race('F', 'Filipino')  
    tmp_G = change_race('G', 'Guamanian')
    tmp_H = change_race('H', 'Hispanic')
    tmp_I = change_race('I', 'American_Indian')
    tmp_J = change_race('J', 'Japanese')
    tmp_K = change_race('K', 'Korean')
    tmp_L = change_race('L', 'Laotian')
    tmp_O = change_race('O', 'Other')
    tmp_P = change_race('P', 'Pacific_Islander')
    tmp_S = change_race('S', 'Samoan')
    tmp_U = change_race('U', 'Hawaiian')
    tmp_V = change_race('V', 'Vietnamese')
    tmp_W = change_race('W', 'White')
    tmp_X = change_race('X', 'Unknown')
    tmp_Z = change_race('Z', 'Asian_Indian')
    #resampling
    #tmp_other = tmp_O['O'] + tmp_I['I'] + tmp_L['L']
    #tmp_other.add(tmp_O).add(tmp_I).add(tmp_L).add(tmp_P) #+ tmp_S + tmp_U + tmp_X + tmp_Z
    print(tmp_other)
    print(tmp_O)
    tmp_asians = tmp_A #+ tmp_C + tmp_D + tmp_F + tmp_G + tmp_J + tmp_K + tmp_V
    
    if result is None:  # first chunk
        result_female = tmp_female.copy()
        result_male = tmp_male.copy()    
        result = pd.merge(result_male, result_female, left_index=True, right_index=True)
        #races
        result_A = tmp_A.copy()
        result_B = tmp_B.copy()
        result_C = tmp_C.copy()
        result_D = tmp_D.copy()
        result_F = tmp_F.copy()
        result_G = tmp_G.copy()
        result_H = tmp_H.copy()
        result_I = tmp_I.copy()
        result_J = tmp_J.copy()
        result_K = tmp_K.copy()
        result_L = tmp_L.copy()
        result_O = tmp_O.copy()
        result_P = tmp_P.copy()
        result_S = tmp_S.copy()
        result_U = tmp_U.copy()
        result_V = tmp_V.copy()
        result_W = tmp_W.copy()
        result_X = tmp_X.copy()
        result_Z = tmp_Z.copy()

        result_asians =  tmp_asians.copy()
        result_other = tmp_other.copy()
        
        #resampled races merge
        result_races = result_A.merge(result_H, left_index=True, right_index=True, how='outer').merge(result_B, left_index=True, right_index=True, how='outer').merge(result_W,
                        left_index=True, right_index=True, how='outer').merge(result_asians, left_index=True, right_index=True, how='outer').merge(result_other,
                        left_index=True, right_index=True, how='outer')     

        #all races
        '''
        result_races = result_A.merge(result_B, left_index=True, right_index=True, how='outer').merge(result_C, left_index=True, right_index=True, how='outer').merge(result_D,
                        left_index=True, right_index=True, how='outer').merge(result_F, left_index=True, right_index=True, how='outer').merge(result_G,
                        left_index=True, right_index=True, how='outer').merge(result_H, left_index=True, right_index=True, how='outer').merge(result_I, 
                        left_index=True, right_index=True, how='outer').merge(result_J, left_index=True, right_index=True, how='outer').merge(result_K, left_index=True, right_index=True, how='outer').merge(result_L, 
                        left_index=True, right_index=True, how='outer').merge(result_O, left_index=True, right_index=True, how='outer').merge(result_P, 
                        left_index=True, right_index=True, how='outer').merge(result_S, left_index=True, right_index=True, how='outer').merge(result_U, 
                        left_index=True, right_index=True, how='outer').merge(result_V, left_index=True, right_index=True, how='outer').merge(result_W, 
                        left_index=True, right_index=True, how='outer').merge(result_X, left_index=True, right_index=True, how='outer').merge(result_Z, 
                        left_index=True, right_index=True, how='outer')
        '''
        result_races = result_races.fillna(int(0))
        result_total = pd.merge(result, result_races, left_index=True, right_index=True)
        #print(result_total)
        print(result_other)

    else:  # all other chunks
        result_female = result_female.add(tmp_female, fill_value=0).astype(int)
        result_male = result_male.add(tmp_male, fill_value=0).astype(int)
        result = pd.merge(result_male, result_female, left_index=True, right_index=True)
        #races
        result_A = result_A.add(tmp_A, fill_value=0).astype(int)
        result_B = result_B.add(tmp_B, fill_value=0).astype(int)
        result_C = result_C.add(tmp_C, fill_value=0).astype(int)
        result_D = result_D.add(tmp_D, fill_value=0).astype(int)
        result_F = result_F.add(tmp_F, fill_value=0).astype(int)
        result_G = result_G.add(tmp_G, fill_value=0).astype(int)
        result_H = result_H.add(tmp_H, fill_value=0).astype(int)
        result_I = result_I.add(tmp_I, fill_value=0).astype(int)
        result_J = result_J.add(tmp_J, fill_value=0).astype(int)
        result_K = result_K.add(tmp_K, fill_value=0).astype(int)
        result_L = result_L.add(tmp_L, fill_value=0).astype(int)
        result_O = result_O.add(tmp_O, fill_value=0).astype(int)
        result_P = result_P.add(tmp_P, fill_value=0).astype(int)
        result_S = result_S.add(tmp_S, fill_value=0).astype(int)
        result_U = result_U.add(tmp_U, fill_value=0).astype(int)
        result_V = result_V.add(tmp_V, fill_value=0).astype(int)
        result_W = result_W.add(tmp_W, fill_value=0).astype(int)
        result_X = result_X.add(tmp_X, fill_value=0).astype(int)
        result_Z = result_Z.add(tmp_Z, fill_value=0).astype(int)        

        #resampled races
        result_asians =  result_asians.add(tmp_asians, fill_value=0).astype(int)
        result_other = result_other.add(tmp_other, fill_value=0).astype(int)

        #resampled races merge
        result_races = result_A.merge(result_H, left_index=True, right_index=True, how='outer').merge(result_B, left_index=True, right_index=True, how='outer').merge(result_W,
                        left_index=True, right_index=True, how='outer').merge(result_asians, left_index=True, right_index=True, how='outer').merge(result_other,
                        left_index=True, right_index=True, how='outer')         
                        
        #all races
        '''
        result_races = result_A.merge(result_B, left_index=True, right_index=True, how='outer').merge(result_C, left_index=True, right_index=True, how='outer').merge(result_D,
                        left_index=True, right_index=True, how='outer').merge(result_F, left_index=True, right_index=True, how='outer').merge(result_G,
                        left_index=True, right_index=True, how='outer').merge(result_H, left_index=True, right_index=True, how='outer').merge(result_I, 
                        left_index=True, right_index=True, how='outer').merge(result_J, left_index=True, right_index=True, how='outer').merge(result_K, left_index=True, right_index=True, how='outer').merge(result_L, 
                        left_index=True, right_index=True, how='outer').merge(result_O, left_index=True, right_index=True, how='outer').merge(result_P, 
                        left_index=True, right_index=True, how='outer').merge(result_S, left_index=True, right_index=True, how='outer').merge(result_U, 
                        left_index=True, right_index=True, how='outer').merge(result_V, left_index=True, right_index=True, how='outer').merge(result_W, 
                        left_index=True, right_index=True, how='outer').merge(result_X, left_index=True, right_index=True, how='outer').merge(result_Z, 
                        left_index=True, right_index=True, how='outer')
        '''                
        result_races = result_races.fillna(int(0))
        result_total = pd.merge(result, result_races, left_index=True, right_index=True)
        print(result_other)
        #print(result_total)
             

#rename resampled columns
result_total = result_total.rename(columns={'Other_Asian_x': 'Others'})
result_total = result_total.rename(columns={'Other_Asian_y': 'Asians'})  
print("=============================")
print(result_total)
'''write result to CSV'''
result_total.to_csv('arrests_races_and_sex_resampled.csv', sep=',')
