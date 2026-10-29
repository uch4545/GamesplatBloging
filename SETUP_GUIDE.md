# 🚀 GamesPlat.com — GitHub Pages & Domain Setup Guide

Ye guide aapko batayegi ke **gamesplat.com** domain ko GitHub Pages ke sath kaise free connect karna hai aur rozana articles kaise push karne hain.

---

## 1. GitHub Repository Setup (Sirf Pehli Baar)

1. **GitHub.com** par jayein aur ek **New Repository** banayein:
   - Repository Name: `gamesplat` (ya `gamesplat.com`)
   - Visibility: **Public** (GitHub Pages free accounts ke liye public repo zaroori hai)

2. Apne computer par is project folder mein terminal kholein aur ye commands chalayein:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for GamesPlat.com"
   git branch -M main
   git remote add origin https://github.com/APNA_USERNAME/gamesplat.git
   git push -u origin main
   ```
   *(Note: `APNA_USERNAME` ki jagah apna GitHub username likhein).*

---

## 2. GitHub Pages On Karna (2 Minutes)

1. Apni GitHub Repository mein jayein.
2. **Settings** tab par click karein (upar right side).
3. Left menu mein **Pages** par click karein.
4. **Build and deployment > Source**:
   - Choose karein: **Deploy from a branch**
   - Branch: **main** aur folder: **/ (root)**
   - Click **Save**.
5. **Custom domain** section mein:
   - Type karein: `gamesplat.com`
   - Click **Save**.
   - Thori dair baad **Enforce HTTPS** ka checkbox check kardein (Free SSL active ho jayega).

---

## 3. Domain DNS Settings (Jahan se gamesplat.com khareedi hai)

Apne Domain Registrar (Namecheap, GoDaddy, Cloudflare, etc.) ke **DNS Management** mein jayein aur ye records add karein:

### A Records (Apex Domain `gamesplat.com` ke liye):
| Type | Host / Name | Points to (Value) | TTL |
|:---:|:---:|:---:|:---:|
| **A** | `@` | `185.199.108.153` | Automatic / 300 |
| **A** | `@` | `185.199.109.153` | Automatic / 300 |
| **A** | `@` | `185.199.110.153` | Automatic / 300 |
| **A** | `@` | `185.199.111.153` | Automatic / 300 |

### CNAME Record (`www` ke liye):
| Type | Host / Name | Points to (Value) | TTL |
|:---:|:---:|:---:|:---:|
| **CNAME** | `www` | `APNA_USERNAME.github.io` | Automatic / 300 |

---

## 4. "Links Ek Hi Jagah Add Karne Ka" Magic (How It Works):

Aapko kisi bhi page ka link haath se copy-paste karne ki zaroorat nahi hai:

- Jab aap naya article banate hain:
  ```bash
  npm run new-post "How to Play Uno Attack"
  ```
- File mein content likhein aur save karein.
- Phir sirf ye command chalayein:
  ```bash
  npm run build
  ```
- **Yeh automatic kya karta hai?**
  1. Naye article ka page `articles/how-to-play-uno-attack.html` bana deta hai.
  2. **Homepage** ke latest list mein article sab se upar add kar deta hai.
  3. **Category page** (jaise `categories/board-card-games.html`) mein card add kar deta hai.
  4. Is category ke doosre articles ke niche **Related Posts** mein link jod deta hai.
  5. Google ke liye `sitemap.xml` mein URL auto-add kar deta hai.
  6. Pinterest aur Social Share ke automated tags bana deta hai.

---

## 5. Local Computer Par Test Karna (Preview)

Push karne se pehle browser mein dekhne ke liye:
```bash
npm run serve
```
Browser mein `http://localhost:3000` kholein aur check karein.
