
glob "**/*.js" --exclude [ **/node_modules/** ]
| each { open $in | lines | length }
| math sum
