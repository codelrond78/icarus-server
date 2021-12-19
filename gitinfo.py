import pygit2

repo = pygit2.Repository('.')

#print(repo, dir(repo))
#print(repo.branches)
for br in repo.branches:
    print(br)
current = repo.head.shorthand
print('-->', current)
print('-->', repo.remotes["origin"].url)
#for remote in repo.remotes:
#    print(remote.url)