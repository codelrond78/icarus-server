from github import Github
from ptoken import token

g = Github(token)

for repo in g.get_user().get_repos():
    print(str(repo))