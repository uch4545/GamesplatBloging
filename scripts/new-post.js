const fs = require('fs');
const path = require('path');

const title = process.argv.slice(2).join(' ') || 'New Awesome Game';
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

const date = new Date().toISOString().split('T')[0];
const targetDir = path.join(__dirname, '..', 'content', 'articles');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const filePath = path.join(targetDir, `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.log(`⚠️ File already exists: content/articles/${slug}.md`);
  process.exit(1);
}

const template = `---
title: "${title}"
slug: "${slug}"
category: "Party Games" # Options: "Party Games", "Family Games", "Board & Card Games", "Classroom Games"
type: "List Article" # Options: "List Article", "How to Play Guide"
date: "${date}"
author: "GamesPlat Team"
excerpt: "A short, catchy 2-sentence summary of the games or rules covered in this guide."
image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000&auto=format&fit=crop&q=80"
pinterestImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000"
players: "4-16 Players"
age: "Ages 6+"
time: "15-30 Mins"
materials: "Printable cards, Paper, Pen"
featured: false
tags:
  - "Party Games"
  - "Printables"
printable:
  title: "Free Printable Scorecards / Activity Sheets"
  description: "Click below to grab our free printable PDF for this game!"
  downloadUrl: "#download"
faqs:
  - q: "What age is this game suitable for?"
    a: "This game is ideal for players aged 6 and up, though younger kids can team up with an adult."
  - q: "How many players can participate?"
    a: "It works best with 4 to 16 players divided into two equal teams."
---

## Introduction

Write 3 to 4 crisp lines introducing the game. US readers want immediate answers, so keep it fast-paced, cheerful, and clear!

## Quick Game List
- **Game 1**: Quick 1-line hook
- **Game 2**: Quick 1-line hook
- **Game 3**: Quick 1-line hook

---

## 1. The Candy Cane Relay

- **Players:** 4 to 12
- **Ages:** 5+
- **Time:** 10 minutes
- **What You Need:** Box of candy canes, 2 small bowls.

### How to Play:
1. Divide players into two equal relay lines.
2. Give each player a candy cane to hold in their mouth (hook side facing out).
3. The first player loops a loose candy cane onto their hook and transfers it to the next teammate without using their hands!
4. The first team to pass the candy cane to the end of the line wins.

> **💡 Pro-Tip:** If playing with toddlers, let them use one hand to steady the candy cane.

---

## Conclusion

Wrap up with 2 to 3 lines, encourage readers to leave a comment or share their family's favorite house rules, and check out our other guides!
`;

fs.writeFileSync(filePath, template, 'utf8');
console.log(`\n🎉 Created new post: content/articles/${slug}.md`);
console.log(`Edit the file, then run 'npm run build' to update the site!\n`);
