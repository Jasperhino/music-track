# %%
import pandas as pd
# load csv file to dataframe
df = pd.read_csv('data/tracks.csv')

# filter all songs longer than 10 minutes
df = df[df['duration_ms'] < 10 * 60 * 1000]
df.head()
