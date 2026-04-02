**Celina 1: Računi
Feature: Kreiranje i upravljanje računima
Scenario 1: Kreiranje tekućeg računa za postojećeg
klijenta Given** zaposleni je ulogovan u aplikaciju
**And** nalazi se na stranici za kreiranje računa
**When** izabere postojećeg klijenta iz baze
**And** izabere tip računa “Tekući račun”
**And** unese početno stanje računa
**Then** sistem generiše broj računa od 18 cifara
**And** račun se uspešno kreira
**And** klijent dobija email obaveštenje o uspešnom otvaranju računa
**Scenario 2: Kreiranje deviznog računa za
klijenta Given** zaposleni je ulogovan u aplikaciju
**And** nalazi se na stranici za kreiranje računa
**When** izabere tip računa “Devizni račun”
**And** izabere valutu računa (npr. EUR)
**Then** sistem kreira devizni račun sa početnim
stanjem 0 **And** račun se prikazuje u listi računa
klijenta
**And** klijent dobija email obaveštenje


**Scenario 3: Kreiranje računa sa automatskim kreiranjem
kartice Given** zaposleni je na stranici za kreiranje računa
**When** izabere tip računa
**And** čekira opciju “Napravi karticu”
**Then** sistem kreira novi račun
**And** automatski generiše debitnu karticu povezanu sa tim
računom **And** klijent dobija email obaveštenje
**Scenario 4: Kreiranje poslovnog računa za firmu
Given** zaposleni je ulogovan u aplikaciju
**And** nalazi se na stranici za kreiranje računa
**When** izabere opciju “Poslovni račun”
**And** unese podatke o firmi (naziv, PIB, matični broj, šifra
delatnosti) **And** poveže vlasnika računa sa klijentom
**Then** sistem kreira poslovni račun vezan za tu firmu
**And** račun dobija status “Aktivan”
**Scenario 6: Pregled računa klijenta
Given** klijent je ulogovan u aplikaciju
**When** otvori sekciju “Računi”
**Then** prikazuju se svi aktivni računi klijenta
**And** računi su sortirani po raspoloživom stanju


**Scenario 7: Pregled detalja računa
Given** klijent se nalazi na stranici “Računi”
**When** klikne na dugme “Detalji” za određeni račun **Then** sistem
prikazuje detaljne informacije o računu **And** prikazani su broj
računa, stanje, raspoloživo stanje i tip računa
**Scenario 8: Promena naziva računa
Given** klijent je otvorio detalje računa
**When** izabere opciju “Promena naziva računa”
**And** unese novi naziv koji nije već korišćen
**Then** sistem uspešno menja naziv računa
**And** prikazuje potvrdu o uspešnoj promeni


