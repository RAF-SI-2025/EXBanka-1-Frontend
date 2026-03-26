**Celina 3: Transferi** 

**Feature: Prenos sredstava između sopstvenih računa Scenario 17: Transfer između sopstvenih računa u istoj valuti Given** klijent je ulogovan u aplikaciju 

**And** nalazi se na stranici “Transferi” 

**When** izabere izvorni račun i odredišni račun u istoj valuti **And** unese iznos za transfer 

**And** klikne na dugme “Potvrdi” 

**Then** sistem izvršava prenos sredstava između računa 

**And** transfer se izvršava bez provizije 

**And** stanje na oba računa se ažurira 

**Scenario 18: Transfer između sopstvenih računa u različitim valutama**  
**Given** klijent je ulogovan u aplikaciju 

**And** nalazi se na stranici “Transferi” 

**When** izabere račune koji imaju različite valute 

**And** unese iznos transfera 

**And** klikne na dugme “Potvrdi” 

**Then** sistem vrši konverziju valute prema važećem kursu **And** obračunava proviziju banke 

**And** sredstva se prebacuju na odredišni račun 

**Scenario 19: Pregled istorije transfera** 

**Given** klijent je ulogovan u aplikaciju 

**When** otvori sekciju “Istorija transfera” 

**Then** prikazuje se lista svih transfera klijenta 

**And** transferi su sortirani od najnovijeg ka najstarijem 

**Scenario 20: Neuspešan transfer zbog nedovoljnih sredstava Given** klijent je na stranici “Transferi” 

**When** pokuša da izvrši transfer sa iznosom većim od raspoloživog stanja **Then** sistem prikazuje poruku “Nedovoljno sredstava na računu” **And** transfer se ne izvršava 

**And** stanje na računima ostaje nepromenjeno 