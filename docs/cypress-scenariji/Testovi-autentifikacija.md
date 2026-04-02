Celina 0.0 \- Autentifikacija korisnika 

Scenario 1: Uspešno logovanje zaposlenog 

Given zaposleni se nalazi na login stranici 

When unese validan email “marko@banka.rs” i lozinku “marko123” Then sistem uspešno autentifikuje korisnika 

And generiše access token za sesiju 

And korisnik se preusmerava na početnu stranicu sistema 

Scenario 2: Neuspešno logovanje zbog pogrešne lozinke Given zaposleni se nalazi na login stranici 

When unese validan email “luka@banka.rs” i pogrešnu lozinku “pogresna123” 

Then sistem odbija prijavu 

And prikazuje poruku “Neispravni unos” 

Scenario 3: Neuspešno logovanje zbog nepostojećeg korisnika Given korisnik se nalazi na login stranici 

When unese email “nepostojeci@banka.rs” i lozinku “Sifra123” Then sistem odbija prijavu 

And prikazuje poruku “Korisnik ne postoji” 

Scenario 4: Reset lozinke putem email-a 

Given korisnik se nalazi na login stranici 

When klikne na opciju “Zaboravljena lozinka” 

And unese svoj email “zaposleni@banka.rs” 

Then sistem šalje email sa linkom za reset lozinke  
And link za reset lozinke važi 15 minuta 

// Za nadogradnju 

Scenario 5: Zaključavanje naloga nakon više neuspešnih pokušaja Given korisnik se nalazi na login stranici 

And već je imao 4 neuspešna pokušaja logovanja 

When ponovo unese pogrešnu lozinku 

Then sistem zaključava nalog na određeni vremenski period 

And prikazuje poruku “Nalog je privremeno zaključan zbog previše neuspešnih pokušaja” 