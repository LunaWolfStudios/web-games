## Web Prototypes

### New Game

1. Add games files to root. For single portable html files skip to step 5.
2. Navigate to the root and run the following commands

```
npm install
npm run build && npx gh-pages -d dist
```

3. Remove `dist` from .gitignore
4. Update the js src path in the index.html to point to the relative path `./`
5. Add new entry to the root index.html
