## Aktuari

Aktuari su tipovi **Zaposlenih** i oba tipa aktuara mogu da trguju **svim** **tipovima** hartija od vrednosti. Postoje 2 tipa:

1. Supervizori \- *trguju na berzi, nemaju limit* \+ upravljaju zahtevima za order i limitima  
2. Agenti \- *trguju na berzi, ali imaju limit, o*dređeni orderi moraju biti odobrene od strane supervizora.

**Svaki admin je ujedno i supervizor:**  
1\. Kada zaposleni postane admin, on postaje i supervizor.  
2\. Kada zaposleni postane supervizor, on **ne dobija** i admin titulu.   
**Ukratko**: Admin \-\> supervizor, obrnuto ne važi.

Proširuje se model Zaposlenog. Ovo ne mora biti u okviru tabele Zaposleni, može biti zasebna tabela *(npr. ActuaryInfo/ActuaryLimits)* sa stranim ključem ka Zaposlenom koji je aktuar.

| Podatak | Opis | Primer | Učestalost promena |
| :---- | :---- | :---- | :---- |
| Limit | Iznos novca koji agent može da potroši. Supervizor nema limit. | 100.000,00 RSD | Menja se od strane supervizora po potrebi |
| Used Limit | Iznos limita koji je potrošen. | 15.000,00 RSD | Menja se pri svakoj transakcji |
| Need Approval | Flag koji ako je true, supervizor mora da odobri/odbije Order. Supervizor uvek ima false vrednost. | True/False | Menja se od strane supervizora po potrebi |

Limit se resetuje na kraju svakog radnog dana automatski npr. u 23:59h. Osim toga, supervizor ima opciju da resetuje *limit* i *usedLimit* za svakog agenta, bilo kada *(opisano ispod)*. 

**Napomena:** *Limit i usedLimit* su izraženi u jednoj valuti, npr. dinarima. Kada aktuar bude trgovao na berzi u drugoj valuti, kako bi proverili da li je prešao svoj limit koristi se isti princip konverzije koji je opisan u *Menjačnici*, samo **bez** uzimanja provizije.

### Add Query Parameters for GET on Employees and Paging

Samo zaposleni koji su supervizori imaju pristup ovom portalu. Na ovoj stranici je prikazan spisak agenata. Moguće je **filtriranje** po email-u, imenu i prezimenu, kao i poziciji. Za svakog agenta supervizor može menjati samo njegov limit i resetovati današnji usedLimit na 0\.

## Podaci iz eksternih izvora

### Exchanges

Sistem prikuplja informacije o berzama. Ovi podaci su neophodni da bismo znali:  
1\. Na kojim berzama je omogućeno trgovanje.  
2\. Radno vreme svake berze, uključujući pre-market i post-market periode.  
3\. Valute u kojima se vrše transakcije na pojedinačnim berzama.  
Radi pojednostavljenja sistema, sve berze unutar iste države imaju identično radno vreme, kao i iste praznike i neradne dane.

**Važno:** Treba da postoji stranica na kojoj se prikazuju berze i **dugme koje uključuje/isključuje vreme berze** kako bi mogli da testiramo aplikaciju i van vremena rada berzi.

| Podatak | Opis | Primer | Učestalost promena |
| :---- | :---- | :---- | :---- |
| Exchange Name | Naziv berze | New York Stock Exchange | Ne menja se |
| Exchange Acronym | Oznaka berze | NYSE | Ne menja se |
| Exchange MIC Code | Jedinstveni identifikator berze | XNYS | Ne menja se |
| Polity | Politički entitet u okviru koje posluje berza, najčešće država | United States | Ne menja se |
| Currency | Valuta po kojoj se trguje na berzi | Dollar | Ne menja se |
| Time Zone | Offset u odnosu na UTC | \+8 | Menja se nekad zbog letnjeg vremena |

