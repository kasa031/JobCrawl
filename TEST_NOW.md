# Test Nå! 🚀

## Backend Status
✅ Backend kjører på http://localhost:3000

## Frontend Status  
✅ Frontend kjører på http://localhost:5174

## Mailhog Status
✅ Mailhog kjører på http://localhost:8025

## Test Steg:

1. **Åpne http://localhost:5174** i nettleser
2. Klikk på "Login" eller noen knapp som åpner modal
3. Bytt til "Register" 
4. Fyll ut:
   - Full Name: ms tery
   - Email: ms.tery@icloud.com
   - Password: test123
5. Klikk "Create Account"

## Forventet Resultat:

✅ Du ser: "Account created! Check your email to verify."
❌ IKKE: "Something went wrong"

## Sjekk Mailhog:

6. Åpne http://localhost:8025 i nytt tab
7. Du vil se emailen med verification link!
8. Klikk på emailen for å se innholdet
9. Kopier linken
10. Lim inn i nettleseren

## Eller kjør i terminal:
```powershell
$env:PGPASSWORD="93c4c664f8c9440ca3258f921df2cdd3"; &"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jobcrawl -c "SELECT email, email_verified FROM users;"
```

