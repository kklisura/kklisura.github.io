---
layout: post
title: "Postgres Interactive Restore"
tags:
  - postgres
---

If you have used git interactive rebase, you know you can specify how rebase is done by picking specific commits, skipping, editing, etc. by merely editing a file in editor (most likely vim). Well `pg_restore` has _similar_ feature.

_git rebase -i HEAD~3 [1]_
```text
pick f7f3f6d Change my name a bit
pick 310154e Update README formatting and add blame
pick a5f4a0d Add cat-file

# Rebase 710f0f8..a5f4a0d onto 710f0f8
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
# .       create a merge commit using the original merge commit's
# .       message (or the oneline, if no original merge commit was
# .       specified). Use -c <commit> to reword the commit message.
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out
```

I had a PG DB dump just the other day and I needed to apply it to my database, but I need to apply only specific changes (tables, constraints, functions, etc). I've had that before and I've used `--table`, `--schema` or `--trigger` where you can specify by name what you want to restore. I've now discovered that `pg_restore` has better option, an _interactive_ option similar to git interactive rebase.

By specifying `--list` argument for `pg_restore` [2], a file gets created instead of restoring database. That file contains a list of actions to be performed during restore. An example file:

```text
;
; Archive created at Mon Sep 14 13:55:39 2009
;     dbname: DBDEMOS
;     TOC Entries: 81
;     Compression: 9
;     Dump Version: 1.10-0
;     Format: CUSTOM
;     Integer: 4 bytes
;     Offset: 8 bytes
;     Dumped from database version: 8.3.5
;     Dumped by pg_dump version: 8.3.8
;
;
; Selected TOC Entries:
;
3; 2615 2200 SCHEMA - public demouser
1861; 0 0 COMMENT - SCHEMA public demouser
41; 2615 2200 SCHEMA - event_store demouser
64; 0 0 COMMENT - SCHEMA event_store demouser
238; 1259 17443 TABLE event_store events demouser
;	depends on: 41
286; 1255 17473 FUNCTION event_store event_store_delete() demouser
;	depends on: 41
242; 1259 17492 TABLE event_store snapshots demouser
;	depends on: 41
...
```

The file represents just list of internal IDs of object to be restored and everything after `;` is a comment. So essentially the file content above is just:

```text
3
1861
41
64
238
286
242
```

By editing the file above to just:

```text
238; 1259 17443 TABLE event_store events demouser
;	depends on: 41
286; 1255 17473 FUNCTION event_store event_store_delete() demouser
;	depends on: 41
242; 1259 17492 TABLE event_store snapshots demouser
;	depends on: 41
```

...and by using `--use-list` with the file path on next `pg_restore` command, you can restore just the items specified in the file! So in this case it's just `events` and `snapshots` table on `event_store` schema together with `event_store_delete` function.

## References

[1] [https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)

[2] [https://www.postgresql.org/docs/current/app-pgrestore.html](https://www.postgresql.org/docs/current/app-pgrestore.html)