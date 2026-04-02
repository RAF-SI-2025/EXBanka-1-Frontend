**Celina 4: Primaoci plaćanja** 

**Feature: Upravljanje primaocima plaćanja**  
**Scenario 21: Dodavanje novog primaoca plaćanja Given** klijent je ulogovan u aplikaciju 

**And** nalazi se na stranici “Primaoci plaćanja” **When** klikne na dugme “Dodaj” 

**And** unese naziv primaoca i broj računa 

**And** klikne na dugme “Potvrdi” 

**Then** novi primalac se dodaje u listu primalaca plaćanja **And** primalac je dostupan za buduća plaćanja 

**Scenario 22: Izmena podataka primaoca plaćanja Given** klijent je na stranici “Primaoci plaćanja” **And** postoji sačuvan primalac u listi 

**When** klikne na dugme “Izmeni” pored primaoca **And** promeni naziv ili broj računa 

**And** potvrdi izmene 

**Then** sistem čuva nove podatke o primaocu **And** ažurirani podaci se prikazuju u listi primalaca 

**Scenario 23: Brisanje primaoca plaćanja Given** klijent je na stranici “Primaoci plaćanja” **And** u listi postoji sačuvan primalac 

**When** klikne na dugme “Obriši” pored primaoca **Then** primalac se uklanja iz liste primalaca plaćanja **And** više nije dostupan za buduća plaćanja