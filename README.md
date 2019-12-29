# auth

Authentifizierung für NodeJS basierte Anwendungen wie LIAGA oder Notizbuch.

## APIs

|Endpunkt|Beschreibung|
|---|---|
|/api/auth/login|Anmeldung, token erstellen|
|/api/auth/register|Registrierung mit Anmeldung, token erstellen|

## Statische Ressourcen

|Ressource|Beschreibung|
|---|---|
|/static/auth/auth.js|Globales `Auth` Objekt zur Authentifizierung|

## Client-Funktionen

|Funktion|Bedeutung|
|---|---|
|Auth.init(useridkey, usernamekey, passwordkey)||
|Auth.login(username, password)||
|Auth.logout()||
|Auth.post()|Sendet Post-Request mit x-access-token|
|Auth.register(username, password)||

## Client-Events

|Event|Bedeutung|
|---|---|
|login|Anmeldung erfolgreich oder fehlgeschlagen (auch nach erfolgreicher Registrierung) - success:true/false, userid, token|
|logout|Abmeldung erfolgt|
|offline|Wenn Server zur Authentifizierung nicht erreicht werden kann - userid|
