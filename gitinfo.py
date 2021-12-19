from urllib.parse import urlparse
import pygit2
import os

repo = pygit2.Repository('.')

#print(repo, dir(repo))
#print(repo.branches)
for br in repo.branches:
    print(br)
current = repo.head.shorthand
print('-->', current)
print('-->', )
#for remote in repo.remotes:
#    print(remote.url)

url = repo.remotes["origin"].url
a = urlparse(url)
print(os.path.basename(a.path)) 