# 📤 Pousser sur GitHub

## Étapes rapides

### 1. Créer un dépôt sur GitHub

1. Allez sur https://github.com
2. Cliquez sur **"New repository"**
3. Nom: `smart-workforce-ai`
4. Description: `Application de gestion des employés avec pointage biométrique`
5. **NE cochez PAS** "Initialize with README"
6. Cliquez **"Create repository"**

### 2. Lier et pousser

Ouvrez PowerShell dans ce dossier et exécutez :

```bash
# Remplacez VOTRE-USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE-USERNAME/smart-workforce-ai.git

# Pousser sur GitHub
git branch -M main
git push -u origin main
```

### 3. Entrer vos identifiants

Entrez votre nom d'utilisateur GitHub et votre mot de passe (ou token).

## ✅ C'est fait !

Votre projet est maintenant sur GitHub : `https://github.com/VOTRE-USERNAME/smart-workforce-ai`

## Mises à jour futures

```bash
git add .
git commit -m "Description des changements"
git push
```
