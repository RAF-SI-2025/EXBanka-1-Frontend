Feature 0.2: Upravljanje zaposlenima 

Scenario 11: Admin vidi listu svih zaposlenih 

Given admin je ulogovan u sistem 

And nalazi se na stranici za upravljanje zaposlenima 

When otvori listu zaposlenih 

Then sistem prikazuje listu svih zaposlenih 

And za svakog zaposlenog prikazuje podatke 

Scenario 12: Admin pretražuje zaposlene 

Given admin se nalazi na stranici za upravljanje zaposlenima And lista zaposlenih je prikazana 

When unese ime, prezime ili email u polje za pretragu 

Then sistem filtrira listu zaposlenih 

And prikazuje samo zaposlene koji odgovaraju kriterijumu pretrage 

Scenario 13: Admin menja podatke zaposlenog 

Given admin je na stranici za upravljanje zaposlenima 

When izabere zaposlenog “Marko Marković” 

And klikne na opciju “Izmeni” 

And promeni broj telefona i departman zaposlenog 

Then sistem ažurira podatke zaposlenog u bazi  
And prikazuje potvrdu o uspešnoj izmeni podataka 

Scenario 14: Admin deaktivira zaposlenog 

Given admin je na stranici za upravljanje zaposlenima 

When klikne na opciju “Deaktiviraj” za zaposlenog “Marko Marković” Then sistem postavlja status naloga na neaktivan 

And zaposleni više ne može da se prijavi na sistem 

Scenario 15: Admin pokušava da izmeni drugog admina 

Given admin je na stranici za upravljanje zaposlenima 

And izabrani korisnik ima admin ulogu 

When admin pokuša da izmeni podatke tog admin 

Then sistem blokira izmenu podataka 

And prikazuje poruku da admin ne možu menjati druge admine 

Feature: Autorizacija i permisije 

Scenario 16: Korisnik bez admin permisija pokušava pristup admin portalu Given korisnik je ulogovan u sistem 

And korisnik nema admin permisije 

When pokuša da pristupi portalu za upravljanje zaposlenima Then sistem odbija pristup 

And prikazuje poruku “Nemate dozvolu za pristup ovoj stranici” Scenario 17: Admin dodeljuje permisije zaposlenom  
Given admin je ulogovan u sistem 

And nalazi se na stranici za upravljanje permisijama zaposlenog When izabere zaposlenog “Petar Petrović” 

And dodeli mu permisiju “Upravljanje klijentima” 

Then sistem ažurira listu permisija zaposlenog 

And zaposleni dobija novu permisiju u sistemu 

Scenario 18: Novi korisnik nema podrazumevane permisije 

Given admin je upravo kreirao novog zaposlenog 

When sistem kreira nalog zaposlenog 

Then lista permisija tog zaposlenog je prazna 

And zaposleni nema pristup funkcionalnostima koje zahtevaju posebne permisije