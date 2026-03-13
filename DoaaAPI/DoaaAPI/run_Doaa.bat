@echo off
title Lancement Frontend
echo ==========================================
echo INSTALLATION ET LANCEMENT DU FRONTEND
echo ==========================================

cd Front

if not exist node_modules (
    echo Dossier node_modules absent. Installation des dependances...
    call npm install
) else (
    echo Les dependances sont deja la.
)

echo.
echo Lancement de l'application...

call npm start

pause