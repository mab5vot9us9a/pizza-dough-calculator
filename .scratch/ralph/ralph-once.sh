#!/bin/bash

claude --permission-mode auto "@.scratch/nutrition-diary-baseline/SPEC.md @.scratch/nutrition-diary-baseline/progress.txt \
1. Read the SPEC and progress file. \
2. Find the next incomplete task from the @.scratch/nutrition-diary-baseline/issues directory and implement it using the /implement skill. \
3. Commit your changes without claude as co-author. \
4. Update progress.txt with what you did, Key decisions made and reasoning, Files changed, Any blockers or notes for next iteration. \
5. update the issue status according to your result. And then commit these documentation changes in a separate commit. \
ONLY DO ONE TASK AT A TIME."