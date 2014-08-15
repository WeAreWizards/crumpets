# Crumpets

## Install

```bash
$ npm install
```

## Gulp commands
Look at the gulpfile to see the commands available but the most important one are

```bash
$ gulp # the main task that will watch/compile/reload everything
$ gulp build --type dist # creates the minified/concatenated version
```

(If you don't have a global gulp see [1])

## Run via nix (http://nixos.org)

```bash
nix-shell -A build --command gulp
```


[1]
If you don't have a global gulp installation use the following.

```
alias gulp="node ./node_modules/gulp/bin/gulp.js"
```