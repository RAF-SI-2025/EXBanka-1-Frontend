**Celina 5: Menjačnica** 

**Feature: Provera kursa i konverzija valuta** 

**Scenario 24: Pregled kursne liste** 

**Given** klijent je ulogovan u aplikaciju 

**When** otvori sekciju “Menjačnica” 

**And** izabere opciju “Kursna lista” 

**Then** sistem prikazuje trenutne kurseve za podržane valute (EUR, CHF, USD, GBP, JPY, CAD, AUD) 

**And** prikazuje odnos svake valute prema RSD 

**Scenario 25: Provera ekvivalentnosti valute** 

**Given** klijent je na stranici “Menjačnica” 

**When** unese iznos u jednoj valuti 

**And** izabere drugu valutu u koju želi konverziju 

**Then** sistem izračunava ekvivalentnu vrednost prema trenutnom kursu **And** prikazuje rezultat bez izvršavanja transakcije 

**Scenario 26: Konverzija valute tokom transfera** 

**Given** klijent ima tekući račun u RSD 

**And** devizni račun u EUR 

**When** izvrši transfer između ova dva računa 

**Then** sistem vrši konverziju valute koristeći prodajni kurs banke 

**And** obračunava odgovarajuću proviziju 

**And** sredstva se prebacuju na odredišni račun u odgovarajućoj valuti