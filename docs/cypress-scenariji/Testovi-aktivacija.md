Feature 0.1: Kreiranje i aktivacija zaposlenog 

Scenario 6: Admin kreira novog zaposlenog 

Given admin je ulogovan u sistem 

And nalazi se na stranici za kreiranje zaposlenog 

When popuni sva obavezna polja 

And potvrdi unos 

Then sistem kreira nalog zaposlenog u bazi 

And generiše aktivacioni token 

And zaposleni dobija email sa linkom za aktivaciju naloga 

Scenario 7: Kreiranje zaposlenog sa već postojećim email-om 

Given admin je na stranici za kreiranje zaposlenog 

And u sistemu već postoji nalog sa email adresom 

“marko.markovic@example.com”  
When admin pokuša da kreira novog zaposlenog sa istim email-om Then sistem odbija kreiranje naloga 

And prikazuje poruku “Nalog sa ovom email adresom već postoji” And admin ostaje na formi za unos podataka 

Scenario 8: Zaposleni aktivira nalog putem email linka 

Given zaposleni je primio email sa aktivacionim linkom 

When klikne na link za aktivaciju naloga 

And unese lozinku u dva polja radi potvrde 

Then sistem proverava validnost lozinke 

And aktivira nalog zaposlenog 

Scenario 9: Aktivacija naloga sa isteklim tokenom 

Given zaposleni pokušava da aktivira nalog putem email linka And aktivacioni token je istekao 

When zaposleni klikne na link za aktivaciju 

Then sistem odbija aktivaciju naloga 

And prikazuje poruku “Link za aktivaciju je istekao” 

And omogućava slanje novog aktivacionog linka 

Scenario 10: Postavljanje lozinke koja ne ispunjava bezbednosne zahteve Given zaposleni se nalazi na stranici za aktivaciju naloga When unese lozinku koja ne ispunjava bezbednosne zahteve Then sistem odbija postavljanje lozinke  
And prikazuje poruku o pravilima za kompleksnost lozinke And nalog ostaje neaktivan dok se ne unese validna lozinka 