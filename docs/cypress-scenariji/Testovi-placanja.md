**Celina 2: Plaćanja** 

**Feature: Izvršavanje plaćanja između klijenata** 

**Scenario 9: Uspešno plaćanje drugom klijentu** 

**Given** klijent je ulogovan u aplikaciju 

**And** nalazi se na stranici “Novo plaćanje” 

**When** unese broj računa primaoca 

**And** unese iznos manji od trenutnog stanja na računu  
**And** klikne na dugme “Potvrdi” 

**Then** transakcija se uspešno izvršava 

**And** stanje na računu pošiljaoca se umanjuje 

**And** stanje na računu primaoca se povećava 

**And** klijent dobija email potvrdu o izvršenoj transakciji 

**Scenario 10: Neuspešno plaćanje zbog nedovoljnih sredstava Given** klijent je ulogovan 

**And** nalazi se na stranici “Novo plaćanje” 

**When** unese broj računa primaoca 

**And** unese iznos veći od raspoloživog stanja na računu **And** klikne na dugme “Potvrdi” 

**Then** sistem prikazuje poruku “Nedovoljno sredstava na računu” **And** transakcija se ne izvršava 

**And** stanje na računu ostaje nepromenjeno 

**Scenario 11: Neuspešno plaćanje zbog nepostojećeg računa Given** klijent je ulogovan 

**And** nalazi se na stranici “Novo plaćanje” 

**When** unese broj računa koji ne postoji u sistemu **And** klikne na dugme “Potvrdi” 

**Then** sistem prikazuje poruku “Uneti račun ne postoji” **And** klijent ostaje na stranici “Novo plaćanje” 

**And** polje za unos računa primaoca se prazni  
**Scenario 12: Plaćanje u različitim valutama uz konverziju Given** klijent je na stranici “Novo plaćanje” 

**And** račun pošiljaoca je u jednoj valuti 

**And** račun primaoca je u drugoj valuti 

**When** klijent unese iznos i potvrdi transakciju 

**Then** sistem vrši konverziju koristeći prodajni kurs banke **And** obračunava proviziju za konverziju 

**And** sredstva se prebacuju na račun primaoca u odgovarajućoj valuti 

**Scenario 13: Plaćanje uz verifikacioni kod** 

**Given** klijent je popunio nalog za plaćanje 

**And** kliknuo na dugme “Nastavi” 

**When** sistem pošalje verifikacioni kod na mobilnu aplikaciju **And** klijent unese validan kod u roku od 5 minuta 

**Then** transakcija se potvrđuje i izvršava 

**Scenario 14: Otkazivanje transakcije nakon tri pogrešna koda Given** klijent je pokrenuo proces verifikacije plaćanja **When** tri puta unese pogrešan verifikacioni kod 

**Then** sistem automatski otkazuje transakciju 

**And** prikazuje poruku o neuspešnoj verifikaciji 

**Scenario 15: Dodavanje primaoca nakon uspešnog plaćanja**  
**Given** klijent je izvršio plaćanje novom primaocu 

**When** klikne na opciju “Dodaj primaoca” 

**Then** primalac se dodaje u listu “Primaoci plaćanja” 

**And** može se koristiti za buduća plaćanja 

**Scenario 16: Pregled istorije plaćanja** 

**Given** klijent je ulogovan u aplikaciju 

**When** otvori sekciju “Pregled plaćanja” 

**Then** prikazuje se lista svih izvršenih plaćanja 

**And** moguće je filtriranje po datumu, iznosu i statusu transakcije 