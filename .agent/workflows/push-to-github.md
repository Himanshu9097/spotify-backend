---
description: Commit and push all changes to GitHub after every feature or fix
---

// turbo-all

After completing any code change (feature, bug fix, refactor, etc.), always run the following steps:

1. Stage all changes:
```
git add -A
```

2. Commit with a meaningful message describing what changed (use conventional commits format: `feat:`, `fix:`, `refactor:`, `style:`, `chore:`, etc.):
```
git commit -m "<type>: <short description of what changed>"
```

3. Push to the remote:
```
git push origin main
```

Always run these 3 commands together. Never skip the push step. If push fails due to auth, inform the user and ask them to run `git push origin main` manually in their terminal.
