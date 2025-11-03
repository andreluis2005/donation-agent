@echo off
:: Define o formato da data e hora
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set day=%%a
    set month=%%b
    set year=%%c
)
for /f "tokens=1-2 delims=: " %%a in ("%time%") do (
    set hour=%%a
    set minute=%%b
)

:: Monta a data/hora em formato legível
set datetime=%year%-%month%-%day%_%hour%h%minute%m

:: Adiciona log
echo teste %datetime% >> log.txt

:: Adiciona e faz commit
git add .
git commit -m "Contribuição em %datetime%"
git push

pause
