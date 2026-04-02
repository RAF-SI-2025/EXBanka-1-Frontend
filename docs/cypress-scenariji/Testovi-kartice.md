**Celina 6: Kartice** 

**Feature: Upravljanje bankarskim karticama** 

**Scenario 27: Automatsko kreiranje kartice prilikom otvaranja računa Given** zaposleni je na stranici za kreiranje računa 

**And** čekirana je opcija “Napravi karticu” 

**When** zaposleni potvrdi kreiranje računa 

**Then** sistem automatski generiše novu debitnu karticu povezanu sa tim računom **And** kartica dobija jedinstveni broj i CVV kod 

**Scenario 28: Kreiranje kartice na zahtev klijenta** 

**Given** klijent je ulogovan u aplikaciju 

**And** nalazi se na stranici “Kartice” 

**When** zatraži novu karticu za određeni račun 

**And** potvrdi zahtev unosom verifikacionog koda koji je dobio putem emaila **Then** sistem kreira novu karticu za taj račun 

**And** klijent dobija email obaveštenje o uspešnom kreiranju kartice 

**Scenario 29: Pregled liste kartica** 

**Given** klijent je ulogovan u aplikaciju 

**When** otvori sekciju “Kartice” 

**Then** sistem prikazuje listu svih kartica povezanih sa njegovim računima 

**And** broj kartice je prikazan u maskiranom obliku (prve 4 cifre, zatim zvezdice, pa poslednje 4 cifre) 

**Scenario 30: Blokiranje kartice od strane klijenta**  
**Given** klijent je na stranici “Kartice” 

**And** ima aktivnu karticu 

**When** klikne na dugme “Blokiraj karticu” 

**Then** status kartice se menja u “Blokirana” 

**And** kartica se više ne može koristiti za plaćanja 

**And** klijent dobija email obaveštenje 

**Scenario 31: Odblokiranje kartice od strane zaposlenog Given** kartica klijenta ima status “Blokirana” 

**And** zaposleni je ulogovan u portal za upravljanje računima **When** zaposleni pronađe karticu i klikne na dugme “Odblokiraj” **Then** status kartice se menja u “Aktivna” 

**And** kartica se ponovo može koristiti 

**And** klijent dobija email obaveštenje 

**Scenario 32: Pokušaj aktivacije deaktivirane kartice** 

**Given** kartica ima status “Deaktivirana” 

**When** klijent pokuša da aktivira tu karticu 

**Then** sistem ne dozvoljava aktivaciju 

**And** prikazuje poruku “Kartica je deaktivirana i ne može se ponovo aktivirati” 