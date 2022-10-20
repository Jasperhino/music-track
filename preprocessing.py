# %%
import pandas as pd
# load csv file to dataframe
df = pd.read_csv('data/tracks.csv')
len(df)
# %%
# filter all songs longer than 10 minutes
df = df[df['duration_ms'] < 10 * 60 * 1000]
#transform release_date to year
df['year'] = df['release_date'].apply(lambda x: x.split('-')[0])
df.head()
# %%
# group by decade
df['decade'] = df['year'].apply(lambda x: int(int(x) / 10) * 10)

# group by decade and sort by popularity and select top 100 for every decade
df = df.groupby('decade').apply(lambda x: x.sort_values('popularity', ascending=False).head(100))
df = df.reset_index(drop=True)
df
# %%
# filter all songs with decade < 1950
df = df[df['decade'] >= 1950]
df
# %%
# save to csv
df.to_csv('data/tracks_filtered.csv', index=False, header=True)