**Celina 7: Krediti** 

**Feature: Upravljanje kreditima i otplatom kredita** 

**Scenario 33: Podnošenje zahteva za kredit**  
**Given** klijent je ulogovan u aplikaciju 

**And** nalazi se na stranici „Krediti“ 

**When** klikne na opciju “Zahtev za kredit” 

**And** popuni formu za kredit (vrsta kredita, iznos, valuta, rok otplate, plata, status zaposlenja) 

**And** klikne na dugme “Podnesi zahtev” 

**Then** sistem beleži zahtev za kredit 

**And** klijent dobija email potvrdu o podnetom zahtevu 

**Scenario 34: Pregled kredita klijenta** 

**Given** klijent je ulogovan u aplikaciju 

**When** otvori sekciju “Krediti” 

**Then** prikazuje se lista svih kredita klijenta 

**And** krediti su sortirani po ukupnom iznosu kredita 

**Scenario 35: Odobravanje kredita od strane zaposlenog** 

**Given** zaposleni je ulogovan u portal za upravljanje kreditima **And** postoji zahtev za kredit od strane klijenta 

**When** zaposleni pregleda zahtev 

**And** klikne na dugme “Odobri” 

**Then** kredit dobija status “Odobren” 

**And** iznos kredita se uplaćuje na račun klijenta 

**And** klijent dobija email obaveštenje 

**Scenario 36: Odbijanje zahteva za kredit**  
**Given** zaposleni je na portalu za upravljanje kreditima **And** postoji zahtev za kredit klijenta 

**When** zaposleni klikne na dugme “Odbij” 

**Then** kredit dobija status “Odbijen” 

**And** klijent dobija email obaveštenje o odbijenom zahtevu 

**Scenario 37: Automatsko skidanje rate kredita** 

**Given** postoji aktivan kredit 

**And** datum sledeće rate je današnji dan 

**And** klijent ima dovoljno sredstava na računu 

**When** sistem pokrene dnevni cron job 

**Then** iznos rate se automatski skida sa računa klijenta **And** sledeći datum plaćanja se pomera za jedan mesec **And** klijent dobija obaveštenje o uspešnoj naplati rate 

**Scenario 38: Kašnjenje u otplati kredita zbog nedovoljnih sredstava Given** postoji aktivan kredit 

**And** datum sledeće rate je današnji dan 

**And** klijent nema dovoljno sredstava na računu 

**When** sistem pokrene cron job za naplatu rate 

**Then** rata dobija status “Kasni” 

**And** sistem planira novi pokušaj naplate nakon 72 sata **And** klijent dobija obaveštenje o neuspešnoj naplati  
**Celina 8: Portali za zaposlene** 

**Feature: Upravljanje klijentima i računima od strane zaposlenih Scenario 39: Pretraga klijenta na portalu za upravljanje klijentima Given** zaposleni je ulogovan u aplikaciju 

**And** nalazi se na stranici “Portal za upravljanje klijentima” **When** unese ime, prezime ili email klijenta u polje za pretragu **Then** sistem prikazuje listu klijenata koji odgovaraju unetom kriterijumu **And** zaposleni može otvoriti profil klijenta za pregled ili izmenu podataka 

**Scenario 40: Izmena podataka klijenta** 

**Given** zaposleni je ulogovan u aplikaciju 

**And** nalazi se na stranici “Portal za upravljanje klijentima” **And** otvorio je profil određenog klijenta 

**When** izmeni podatke klijenta (npr. broj telefona ili adresu) **And** klikne na dugme “Sačuvaj” 

**Then** sistem čuva nove podatke klijenta 

**And** ažurirani podaci se prikazuju na profilu klijenta