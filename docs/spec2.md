\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Osnovno poslovanje banke Opis Druga
celina obuhvata osnovno poslovanje banke, Za sada su sve transakcije
internal tj u okviru jedne banke. Aplikacije za Klijenta i Zaposlenog:
Za Zaposlene: 1. Kreiranje računa klijenta 3. Portal za "Upravljanje
računima" 3. Portal za "Upravljanje klijentima" 4. Portal za
"Upravljanje kreditima"

Za Klijente: 1. Početna strana banke i opcije iz menija - računi,
plaćanja, transferi, menjačnica, kartice, krediti Verifikacioni kod
Potrebna je mobilna aplikacija. Flow: 1. Klijent vrši neko plaćanje na
laptopu, treba da ga potvrdi na mobilnom. 2. Klijent ulazi na mobilnu
apl. i na nama je kako da implementiramo: \* na mobilnom klikće
\"approve transaction\" dugme \* dobija kod na mobilnom i ukucava ga na
laptopu (kod traje 5 min i nakon 3 neuspešna pokušaja se otkazuje
transakcija) Kreiranje računa klijenata Račun kreira Zaposleni. Da bi
zaposleni mogao da kreira novi račun, potrebno je da se prijavi u
aplikaciju. Pored čuvanja podataka o vlasniku (klijentu), čuvaju se i
podaci o zaposlenima koji su napravili račune. Nakon prijave, izabira
jedan od tipova računa: Tekući račun, Devizni račun. Nakon uspešnog
kreiranog računa vlasnik dobija email o uspehu.

Napomena 1: Prilikom kreiranja računa postoji checkbox "Napravi karticu"
koji automatski kreira karticu za novi račun - pročitati više o tome u
Upravljanje karticama. Napomena 2: Prilikom kreiranja računa za vlasnika
se ili bira postojeći Klijent ili kreira novi. Napomena 3: Postoji i
polje za unos početnog stanja računa.

Tekući i devizni račun može biti: 1. Lični - pripada Klijentu 2.
Poslovni - pripada Firmi. Pogledati "Flow ako je poslovni račun". Tekući
račun Pri kreiranju tekućeg računa postoji opcija odabira podvrste
računa kao što su: lični (standardni, štedni, penzionerski, za mlade, za
studente i nezaposlene), poslovni (DOO, AD, fondacija). Tekući će imati
samo jednu valutu (domaću - RSD).

Podatak Opis Primer Učestalost promena Broj računa Broj računa
265000000000123456 Ne menja se Naziv računa

Devizni računa 1 Ne menja se Vlasnik Korisnik koji će biti povezan sa
računom Korisnik-id Ne menja se Stanje Stanje računa 180,00.00 Menja se
po kupovini/potrošnji Raspoloživo stanje Raspoloživo stanje računa
korisnika 178,00.00 Menja se po kupovini/potrošnji Zaposleni id
Zaposlenog koji je kreirao rаčun Petar Petrović Ne menja se Datum
kreiranja Datum kreiranja računa Odgovarajući date format Ne menja se
Datum Isteka Datum isteka računa Odgovarajući date format Ne menja se
Currency Valuta računa RSD Ne menja se Status Da li je račun aktivan ili
ne Aktivan/ Neaktivan Na zahtev Vrsta računa Lični (sa podvrstama) ili
poslovni Standardni Ne menja se Održavanje računa Mesečni iznos za
održavanje računa 255.00,00 RSD Ne menja se Dnevni limit Maksimalni
iznos transakcija dnevno 250,000.00 RSD Može se menjati Mesečni limit
Maksimalni iznos transakcija mesečno 1,000,000.00 RSD Može se menjati
Dnevna potrošnja Ukupan iznos potrošen tokom dana 150,000.00 RSD Menja
se po transakciji Mesečna potrošnja Ukupan iznos potrošen tokom meseca
600,000.00 RSD Menja se po transakciji Devizni račun Pri kreiranju
računa bira se da li je lični ili poslovni. Klijent može imati više
deviznih računa. Svaki devizni račun je u jednoj valuti. Valute: Ne
treba omogućiti sve valute, već samo : EUR, CHF, USD, GBP, JPY, CAD i
AUD.

Podatak Opis Primer Učestalost promena Broj računa Broj računa
265000000000123456 Ne menja se Naziv računa

Devizni računa 1 Ne menja se Vlasnik Korisnik koji će biti povezan sa
računom Korisnik-id Ne menja se Stanje Stanje računa 180,00.00 Menja se
po kupovini/potrošnji Raspoloživo stanje Raspoloživo stanje računa
korisnika 178,00.00 Menja se po kupovini/potrošnji Zaposleni id
zaposlenog koji je kreirao račun Petar Petrović Ne menja se Datum
kreiranja Datum kreiranja računa Odgovarajući date format Ne menja se
Datum Isteka Datum isteka računa Odgovarajući date format Ne menja se
Currency Valuta računa EUR Ne menja se Status Da li je račun aktivan ili
ne Aktivan/ Neaktivan Na zahtev Vrsta računa Lični ili poslovni Poslovni
Ne menja se Dnevni limit Maksimalni iznos transakcija dnevno 5,000.00
EUR Može se menjati Mesečni limit Maksimalni iznos transakcija mesečno
20,000.00 EUR Može se menjati Dnevna potrošnja Ukupan iznos potrošen
tokom dana 3,200.00 EUR Menja se po transakciji Mesečna potrošnja Ukupan
iznos potrošen tokom meseca 12,500.00 EUR Menja se po transakciji

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Flow ako je poslovni račun Poslovni
račun se koristi za upravljanje finansijama preduzeća i obično dolazi sa
dodatnim funkcijama, kao što su plaćanje poreza na dodatu vrednost
(PDV), porez na dobit i drugi doprinosi.

Ako je izabran poslovni račun (tekući ili devizni), definise se vlasnik
(Klijent) i Firma za koju je vezan taj račun. Flow: 1. Za račun (tekući
ili devizni) se bira da je poslovni 2. Za vlasnika se selektuje ili
kreira Klijent 3. Za Firmu se unose podaci (ovo je informativnog
karaktera da bi stajalo u bazi)

Firma

Podatak Opis Primer Učestalost promena Naziv firme Naziv firme Firme DOO
Može da se promeni Matični broj firme Jedinstveni broj pod kojim je
firma zavedena u odgovarajućem registru 12345678 Ne menja se Poreski
broj firme Jedinstveni broj pod kojim je firma zavedena za svrhu naplate
poreza (PIB) 123456789 Ne menja se Šifra delatnosti Šifra delatnosti
firme 01.9 Može da se promeni Adresa Adresa, mesto i država sedišta
firme

Trg Republike V/5, Beograd, Srbija

Može se promeniti Vlasnik ID Klijenta koji je vlasnik firme (in real
life to bi bio kao većinski vlasnik) Petar Petrović Može se promeniti

Šifra delatnosti je u formatu xx.xx. Predlog je da se napravi tabela
Šifra delatnosti gde će biti navedena šifra i opis (npr. 10.1
Proizvodnja hrane).

Napomena: Klijent može imati više i ličnih i poslovnih računa. Samo
vlasnik poslovnog računa može da se uloguje u aplikaciju. Zaposleni u
firmi, koji će imati kartice vezano za poslovni racun, se zove
OvlascenoLice. Više o ovome u Kreiranju kartica. Informacije za
OvlascenaLica koja drže kartice su samo informativnog karaktera. Oni se
ne loguju u aplikaciju.

Naša Banka = Firma Nasa banka je takođe Firma. Nasa banka ima po račun u
svakoj valuti, oni se koriste za: 1. Provizije transakcija se prebacuju
na račun banke u toj valuti 2. U Menjačini, "from" novac se prebacuje na
bankin racun i "to" novac se skida sa računa naše banke 3. Možemo videti
svoje račune i pratiti transakcije izvršene nad njima. 4. Kasnije:
možemo videti koje hartije od vrednosti posedujemo, šta su naši
zaposleni koji su aktuari kupovali Opis podataka Currency Default -
Neophodno je da se obezbedi jedna osnovna valuta kako bi korisnik mogao
da vrši transakcije preko kartice povezane sa deviznim računom. Tekući
račun može biti samo u RSD.

Valute koje podržavamo su EUR, CHF, USD, GBP, JPY, CAD i AUD + RSD.
Currency (valute) su zasebni entiteti u bazi podataka: Podatak Opis
Primer Učestalost promena Naziv Naziv valute European Union Ne menja se
Oznaka Oznaka valute EUR Ne menja se Simbol Simbol valute € Ne menja se
Zemlja Zemlje koje koriste valutu Belgija, Francuska,Italija.. Ne menja
se Opis Opis valute The euro is the monetary unit... Ne menja se Status
Aktivnost Aktivna Ne menja se

Broj računa - ima 18 cifara od kojih su prvih 7 uvek iste. \* Šifra
banke (3 cifre) Banka1 - 111, Banka2 - 222, Banka3 - 333, Banka4 - 444
\* Šifra filijale (ili ekspoziture, to je lokalna poslovnica) banke (4
cifre) Pošto banke imaju svoje šifre, filijale mogu krenuti od 0001 \*
Broj računa (9 cifara) Random 9 cifara u intervalu od 0 do 9 \* Tip
računa (2 cifre) Tekući račun 10 (Lični: 11, Poslovni: 12, Štedni račun:
13, Penzionerski račun: 14, Račun za mlade: 15, Račun za studente: 16,
Račun za nezaposlene: 17) Devizni račun: 20 (Lični: 21, Poslovni: 22)

Napomena: Kako cemo kasnije uvesti placanja izmedju banaka, treba da
imamo isti algoritam za cekiranje broja racuna. Predlog je (zbir svih
cifara) % 11.

Raspoloživo stanje = stanje računa - rezervisana sredstva. Rezervisana
sredstva nastaju kod transakcija između banaka zbog kašnjenja.
Unutrašnje transakcije (u 1 banci) su instant i ne rezervišu sredstva.

Vlasnik - pri unosu podataka za račun, za polje Vlasnik postoje dve
opcije:  1. Izabrati postojećeg korisnika - zaposleni će moći da bira iz
liste postojećih korisnika. 2. Kreiraj novog korisnika - vodi do view-a
za kreiranje novog korisnika. Nakon što je zaposleni kreirao novog
korisnika, aplikacija treba da ga vrati na stranicu kreiranja računa i
da automatski selektuje (popuni polje) novonapravljenog korisnika.
Primer kreiranja računa Opcija za kreiranje računa:

Napomena: Dodati polje za unos početnog stanja računa.

Kreiranje tekućeg računa: Kreiranje deviznog računa:
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Početna strana Banke

1 Meni 1. Računi 2. Plaćanja (prećanje i prenos) 3. Transferi 4.
Menjačnica 5. Kartice 6. Krediti.

2 Zaglavlje Sadrži dodatne opcije Profil (Klijent samo vidi svoj profil)
i Odjava.

3 Pregled računa - lista računa, može se promeniti klikom ili
skrolovanjem

4 Transakcije vezano za račun - poslednjih 5 transakcija po odabranom
računu. Račun možete promeniti klikom na ikonicu koja prikazuje listu
svih računa.

5 Brzo plaćanje - sekcija u kojoj se nalaze klijentovi primaoci plaćanja
i pruža mogućnost da se plaćanje izvrši brzo, odmah sa početne strane
ili da doda novog primaoca plaćanja.

6 Kalkulator za menjačnicu - kalkulacije ekvivalentne vrednosti u drugoj
valuti na osnovu aktuelnih kurseva Opcija "Računi\" Korisnik će opcijom
Računi moći da otvori view u kome će moći da vidi pregled stanja i
detalja svojih računa. View treba da se sastoji iz 2 dela:  1. Niz
računa koje poseduje korisnik - samo aktivni 2. Liste transakcija za
izabrani račun Napomena: U ovoj listi se nalaze samo računi koje
poseduje trenutno ulogovan klijent.

Za svaki račun biće predstavljeni osnovni podaci o računu: naziv računa,
broj računa i raspoloživo stanje (sortirani u opadajućem redosledu u
zavisnosti od raspoloživog stanja odgovarajućeg računa). Svaki prikazani
račun takođe ima i opciju (dugme) "Detalji" koji će korisniku otvoriti
detaljni prikaz odgovarajućeg računa.

Korisnik može da selektuje račun klikom na njega - po difoltu je
selektovan prvi račun. Za selektovani račun se, u drugom delu stranice
npr. ispod ili pored, prikazuje lista transakcija (može sortirati po
datumu isplate-uplate ili po tipu transakcije).

Napomena: Označavanje računa i dugme "Detalji\" su dve različite
funkcionalnosti.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Detaljan prikaz računa - ličnog
Odabirom opcije "Detalji" za odgovarajući račun se otvara prozor sa
detaljima o istom: \* Naziv računa \* Broj računa \* Vlasnik \* Tip \*
Raspoloživo stanje \* Rezervisana sredstva - ovo je za sada uvek 0 jer
su sva placanja u okviru nase banke, tj. bez delay-a. Kada uvedemo
placanja izmedju banaka, postojace delay i te i rezervisana sredstva. \*
Stanje računa Ispod prikazanih detalja klijenata takođe ima sledeće
opcije: \* Promena naziva računa \* Novo plaćanje (vodi ga na rutu za
novo plaćanje) \* Promena limita (zahteva verifikaciju) Promenu limita
može uraditi samo vlasnik računa. Odabirom opcije "Promena naziva
računa" korisniku se otvara pop-up pod istim nazivom. Treba predstaviti:
trenutno ime računa, labelu "Novo ime računa", polje za unos novog imena
za račun. Potrebna validacija: novo ime se ne poklapa sa trenutnim, kao
i da se ne poklapa sa imenom nekog drugog računa iste mušterije.
Detaljan prikaz računa - poslovnog Izgled prikaza poslovnog računa je
skoro identičan prikazu za lični račun. Razlika je u tome što su na ovoj
strani takođe prikazani i podaci o firmi kojoj pripada račun (Ime firme
npr.). Opcija "Plaćanja" Plaćanja se odnose na prebacivanje novca sa
računa jednog Klijenta na račun drugog Klijenta. Klikom na opciju
"Plaćanja" otvara se podmeni sa četiri opcije:  1. Novo plaćanje 2.
Prenos 3. Primaoci plaćanja 4. Pregled plaćanja Novo plaćanje Između
računa različitih klijenata, mogu biti iste i različite valute.

Odabirom opcije "Novo plaćanje", prikazuje se nalog za plaćanje
(uplatnica), kojim dajete nalog banci, da na teret Vašeg izabranog
računa prenese sredstva u korist računa primaoca. Sastavni delovi
prozora su: \* Naziv primaoca: Klijent unosi naziv primaoca ili ga bira
iz liste Primaoca plaćanja. (lista primaoca plaćanja predstavlja listu
već korišćenih primalaca) \* Račun primaoca: Korisnik unosi broj računa
primaoca kome prenosi sredstva. \* Iznos: Korisnik unosi iznos plaćanja.
Preostali iznos limita za plaćanje može proveriti klikom na Info polje
koje se nalazi pored polja za unos iznosa. \* Poziv na broj - Sadrži
numerički podatak koji bliže određuje plaćanje (šifru pod kojom se
određeni korisnik vodi u instituciji kojoj plaća, broj kredita, broj
računa kreditne visa kartice i sl.). Polje može ostati nepopunjeno. \*
Šifra plaćanja - Birate odgovarajuću šifru iz padajućeg menija, default
je 289. \* Svrha plaćanja -- Korisnik unosi namenu odnosno osnov zbog
kojeg izvršava uplatu (opisno). \* Račun platioca - Promena računa
platioca \* Nakon klika na dugme "Nastavi", neophodno je odraditi
verifikaciju. \* Nakon izvršene transakcije moguće je ukoliko je
plaćanje izvršeno novom korisniku (ne postoji kod trenutnog korisnika u
"Primaoci plaćanja"), da se na dugme "Dodaj primaoca" plaćanja kreira
šablon za tog korisnika koji će se sačuvati u Primaoci plaćanja.

Napomena: Šifra plaćanja se sastoji od 3 cifre. Prva cifra je uvek 1 ili
2, to označava da li je transakcija gotovinska ili bezgotovinska. U
našem slučaju online plaćanja šifra će uvek biti 2xx. Šifre plaćanja
možete pogledati na sledećem linku.

Podatak Opis Primer Učestalost promena Broj naloga Broj koji se
automatski generiše i koristi kao identifikacija transfera 1265463698391
Ne menja se Sa računa Broj računa od kojeg uzimamo novac, konvertujemo i
zatim prosledjujemo drugom računu 102-39443942389 Ne menja se Na račun
Broj računa na kom želimo da prebacimo novac 102-394438340549 Ne menja
se Početni iznos Iznos koji želimo da prebacimo 1.00 EUR Ne menja se
Krajnji iznos Iznos koji je primalac dobio 1.00 EUR Ne menja se
Provizija Provizija banke - uzima proviziju kada su razl. valute 0 EUR
Ne menja se Primalac Klijent primalac clientId

Ne menja se Šifra plaćanja objašnjenje 289 Ne menja se Poziv na broj
Nije obavezan, uglavnom se prepisuje se sa dobijene uplatnice 117.6926
Ne menja se Svrha plaćanja Opis svrhe plaćanja za privatni čas Ne menja
se Timestamp Timestamp plaćanja Bilo koji format Ne menja se

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Prenos Između računa istog klijenta
iste valute. Polja "Sa računa" i "Na račun" se popunjavaju iz drop down
menija - treba prikazati naziv i broj računa. Nakon klika na dugme
"Nastavi" korisnik ima 2 opcije - "potvrdi" ili "nazad". Ako odabere
opciju "potvrdi" vrši se verifikacija.

Primaoci plaćanja Moguć je pregled, kreiranje, menjanje i brisanje
primalaca plaćanja.

Izlistani su svi primaoci plaćanja i pored svakog postoji opcija za
brisanje na dugme 'Obriši' ili izmena na dugme 'Izmeni'. Klikom na dugme
'Obriši' račun se izbacuje iz liste primaoca. Klikom na dugme 'Izmeni'
otvara se forma sa poljima Naziv i Broj računa koji se mogu menjati.

Dodavanje novog primaoca plaćanja se vrši klikom dugme 'Dodaj', nakon
čega se otvara forma za kreiranje novog primaoca, na kojoj imamo polja
za Naziv i Broj računa. Klikom na 'Potvrdi' vraćamo se na prethodni
prozor i primalac će biti dodat u listu. Klikom na 'Poništi' se
obustavlja procedura i vraća se na prethodni prozor.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Pregled plaćanja Opcija pregled plaćanja omogućava korisniku pregled
sledećih tipova transakcija: \* plaćanja \* menjačnica (prenos novca
izmedju korisnikovog tekućeg i deviznog računa)

Prilikom pregleda postoji mogućnost filtriranja po datumu, iznosu i
statusu plaćanja. Na listi transakcija prikazana je informacija o
statusu u kome se transakcija nalazi: Realizovano, Odbijeno, U Obradi
(transakcija je "U Obradi" sve dok sredstva nisu uspešno stigla na
ciljni račun).

Detaljima transakcije pristupate jednostavno, klikom na red/nalog čije
detalje želite pregledati, nakon čega se otvara novi prozor sa
detaljima. U okviru Detalja transakcije dostupna je opcija "Štampaj
potvrdu" - korisniku se downloaduje pdf sa svim detaljima transakcije.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Opcija "Transferi" Između računa istog
klijenta u različitim valutama. Klijentovo iskustvo

Postoje 2 opcije - "Uradi transfer" i "Istorija transfera":  1. Flow za
opciju "Uradi transfer": Stranica \"Kreiraj transfer\" -- Klijent bira
izvorni (from) i odredišni (to) račun, kao i iznos. Stranica \"Potvrdi
transfer\" -- Prikazuje se ime i prezime Klijenta, brojevi računa,
iznos, kurs i provizija. 2. Opcija "Istorija transfera" prikazuje
stranicu gde su prikazani svi Klijentovi transferi sortirani hronološki
od najnovijeg. Logika Ista valuta: Novac se direktno prebacuje,
provizija = 0, kurs = / Različite valute: provizija = 0-1%, kurs =
dnevni. Logika kada se prebacuje novac između razl. valuta je detaljno
objašnjena u "Menjačnica → Logika".

Entitet "Transfer" Podatak Opis Primer Učestalost promena Broj naloga
Broj naloga koji se automatski generiše za identifikaciju transfera
1234568902873 Ne Sa računa Broj računa 265000000000123456 Ne Na račun
Broj računa 265000000000654321 Ne Početni iznos Iznos koji želimo da
prebacimo 1300.00 RSD Ne Krajnji iznos Iznos koji je legao na račun
11.00 EUR Ne Kurs Kurs po kojem je menjan novac 117.69 Ne Provizija
Provizija banke prilikom konvertovanja 0.70 EUR Ne Timestamp Timestamp
transfera Bilo koji format Ne

Opcija "Menjačnica" Klijentovo iskustvo Menjačnica je informativnog
karaktera i ima 2 stranice. Stranica Kursna lista prikazuje važeće
kurseve, dok stranica Proveri ekvivalentnost omogućava unos iznosa i
valute kako bi sistem izračunao preračunatu vrednost prema dnevnom
kursu. Logika Valute koje podržavamo su EUR, CHF, USD, GBP, JPY, CAD i
AUD + RSD. Predloženi API servisi za Kursnu Listu: \*
https://exchangeratesapi.io/ \* https://fixer.io/ \*
https://www.exchangerate-api.com/ Za precizan i ažuriran prikaz kursne
liste, kao i za siguran transfer novca, može se koristiti Alpha Vantage
API (Currency Exchange Rate).

Kada su različite valute Pri svakoj konverziji novca, banka klijentima
uvek prodaje drugu valutu, tj. uvek koristi prodajni kurs za
toCurrency + uzima proviziju (0-1%, što manja jer kasnije će biti viša
provizija između banaka). Transferi uvek idu preko bazne valute, tj.
dinara (primer 2).

Primer 1: 100 RSD ➡ EUR: 1. Dinari se prebacuju na dinarski račun banke.
2. Banka obračunava ekvivalent u evrima (prodajni kurs za evro) i
umanjuje za proviziju. 3. Sa evro računa banke sredstva se prebacuju na
Klijentov evro račun.

Primer 2: 100 EUR ➡ USD: - EUR ➡ RSD ➡ USD - Na svakom koraku koristimo
prodajni kurs, uzimamo proviziju i ide preko računa naše Banke. Opcija
"Kartice" Osnovne informacije Broj kartice se sastoji od 16 cifara i ima
CVV kod od 3 cifre. Svaka kartica je povezana sa računom korisnika (u
bazi je to "broj računa"). Jedan račun može da ima više kartica, ali je
broj kartica koji postoji za jedan račun ograničen: - Lični račun - max
2 kartice za račun - Poslovni račun - max 1 kartice po osobi Mogu
postojati kartice, kao što je Mastercard, koje su povezane sa dinarskim
računom korisnika, ali omogućavaju plaćanje u različitim valutama. Prvo
se primenjuje kurs banke, zatim se dodaje provizija i konverziona
naknada \[uplaćujemo na racun nase banke\], nakon čega se konačan iznos
skida sa računa korisnika. Za implementaciju koristimo prosečne
vrednosti: \* Provizija banke: 2% \* Konverziona naknada Mastercard-a:
0.5% Cifre kartice: \* Cifra 1. (MII - Major Industry Identifier) -
identifikuje sektor izdavača. 1, 2 - Airlines & Other Travel
(avio-kompanije i putnički sektor) 3 - Travel & Entertainment (putovanja
i zabava) 4, 5 - Banking & Financial (banke i finansijske institucije)
6 - Merchants & Banking (trgovci i bankarstvo) 7 - Petroleum & Energy
(naftna industrija) 8 - Telecommunications & Healthcare
(telekomunikacije i zdravstveni sektor) 9 - National Assignment
(nacionalna dodela) \* Cifre 2. - 6. (IIN - Issuer Identification
Number) - određuju banku ili finansijsku instituciju koja izdaje
karticu. Vrednosti 00000-99999. Svaka banka ima svoj jedinstveni IIN. \*
Cifre 7. - 15. (Account Number) - unique broj računa. Vrednosti
000000000-999999999. \* Cifra 16. (Check Digit) - kontrolna cifra koja
se koristi za verifikaciju broja kartice koristeći Luhn algoritam.
Vrednosti 0-9.

Vrste kartica koje indektifikujemo po MII i IIN: \* Visa počinje sa
cifrom 4. \* MasterCard počinje sa brojevima od 51 do 55 ili od 2221 do
2720. \* DinaCard počinje sa 9891. \* American Express počinje sa 34 ili
37 (Napomena: ima 15 cifara ukupno, Account Number je manji za jednu
cifru).

Kartica Podatak Opis Primer Učestalost promena Broj kartice
Identifikacioni broj kartice 1000000000000000 Ne menja se Vrsta kartice
Različite vrste platnih kartica - uvek debit, moguće proširenje za
2025/26 da podrže funkc. kreditnih kartica Debit Ne menja se Naziv
kartice Vrsta kartice, brend ili proizvod koji predstavlja Debit Ne
menja se Datum kreiranja Datum kreiranja kartice za odredjenog korisnika
Bilo koji format datuma Ne menja se Datum isteka Datum isteka kartice za
odredjenog korisnika Bilo koji format datuma, automatski se generiše Ne
menja se Broj računa Broj računa korisnika za koji se kartica povezuje
10000000000000 Ne menja se CVV kod Koristi se za potvrdu identiteta
vlasnika kartice tokom online transakcije 343 Ne menja se Limit Limit
dozvoljen na kartici korisnika 1000000,00.00 Može se promeniti, ali
retko Status Aktivnost kartice Aktivna Može se promeniti na zahtev
korisnika ili u slučaju malverzacije

Upravljanje karticama  1. Kreiranje kartica 2. Pregled svih kartica 3.
Blokiranje kartice

Kreiranje kartice Kartice mogu biti kreirane na 2 načina: 1. Prilikom
otvaranja računa - postoji checkbox "Napravi karticu". Ako se selektuje
ova opcija sistem automatski kreira karticu za novi račun. 2. Na zahtev
klijenta - klijent u okviru "Kartice" stranice iz menija aplikacije ima
opciju da zatraži novu karticu za željeni račun. Prvo se proverava da li
je premašen maksimalni dozvoljeni broj kartica za taj račun. Ako nije,
klijent dobija mejl sa kodom koji treba da unese u aplikaciju (mejl
"Potvrdite da ste Vi podneli ovaj zahtev") i nakon toga sistem
automatski kreira karticu za odabrani račun. U slucaju uspeha ili
neuspeha izvršavanja ovog procesa šalje se obaveštenje klijenta o
rezultatima ove operacije.

Napomena: Za sve račune, samo Vlasnik računa može da se uloguje u
klijentsku aplikaciju. Vlasnik poslovnog računa može da zatraži karticu
za: 1. sebe (ako pri kreiranju računa nije checkiran box za automatsko
kreiranje kartice uz račun, te vlasnik još nema svoju karticu) 2.
ovlasceno lice za taj racun (kako može biti max 1 kartica po osobi za
poslovne račune, uvek se kreira novo ovlasceno lice). OvlascenoLice u
bazi postoji samo kao entitet radi praćenja, nema ikakve
funkcionalnosti.

Podatak Tip podatka Primer Učestalost promena id Long 1234 Ne menja se
Ime String Petar Ne menja se Prezime String Petrović Menja se (retko)
Datum rodjenja Long (Unix vreme) Ne menja se Pol String M Menja se
(retko) Email adresa String petar@primer.raf Ne menja se Broj telefona
String +381645555555 Menja se (retko) Adresa String Njegoševa 25 Menja
se (retko)

Lista kartica Napomena: Za sve račune, samo Vlasnik računa može da se
uloguje u klijentsku aplikaciju. Klijentu se prikazuju sve kartice. Za
svaku karticu vidi:  - račun (ime i broj)  - broj kartice (prve 4 cifre,
potom 8 zvezdica i zadnje 4 cifre - primer 5798\*\*\*\*\*\*\*\*5571).

Proširenje za 2025/26: osmisliti gde je moguće imati plaćanja sa kartice
(pošto smo svo vreme u bankinoj aplikaciji i skidamo novac sa računa) i
prikazati i listu transakcija, sortiranje po datumu i po tipu
transakcije. Ako neko ima rešenje za ovo u 2024/25 neka slobodno
implementira.

Blokiranje kartice Klijent može samo da blokira sam svoju karticu. Da bi
ona bila odblokirana korisnik mora kontaktirati zaposlenog kako bi on to
uradio (samo zaposleni u banci mogu odblokirati). Zaposleni može da
blokira, odblokira blokiranu karticu i deaktivira karticu preko "Portala
za upravljanje Računima".

Blokirana kartica znači da samo trenutno nije u funkciji. Deaktivirana
kartica je kartica koja je istekla ili koju zaposleni deaktivira. Jednom
deaktivirana kartica ne može biti aktivirana.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Opcija "Krediti" Klijentovo iskustvo
Stranica "Krediti" Klijent vidi spisak svih svojih kredita, sortirano
opadajuće po iznosu. Za svaki kredit je prikazan naziv, broj kredita i
ukupan iznos kredita. Pored svakog kredita se nalazi dugme "Detalji"
koji otvara detaljan prikaz kredita i svih rata vezano za njega. U
Detaljnom prikazu, za svaki kredit je navedeno: \* Broj kredita \* Vrsta
kredita (gotovinski (keš), stambeni, auto, refinansirajući, studentski)
\* Ukupni iznos kredita \* Period otplate (broj meseci/rata) \*
Nominalna kamatna stopa (početna pri kreiranju kredita) \* Efektivna
kamatna stopa (trenutna - kod varijabilne kamatne stope to je koliko bi
im trenutno naplatili, tj. r = R + M) \* Datum ugovaranja kredita \*
Datum kada kredit treba da bude isplacen \* Iznos sledeće rate \* Datum
sledeće rate \* Preostalo dugovanje (koliko jos treba da se otplati) \*
Valuta kredita (RSD, EUR itd.)

Stranica "Podnošenje zahteva" Klijent podnosi zahtev za novi kredit
klikom na opciju \"Zahtev za kredit\". Forma zahteva: \* Vrstu kredita
(gotovinski, stambeni, auto, refinansirajuci, studentski) \* Tip kamatne
stope (fiksna, varijabilna) \* Iznos kredita i valuta \* Svrha kredita
\* Iznos mesečne plate \* Status zaposlenja (stalno, privremeno,
nezaposlen) \* Period zaposlenja kod trenutnog poslodavca \* Rok otplate
u ratama tj. mesecima: Gotovinski, auto, studentski, refinansirajući:
12, 24, 36, 48, 60, 72, 84 Stambeni: 60, 120, 180, 240, 300, 360 \*
Kontakt telefon \* Broj računa - bira iz drop down menija, valuta računa
mora da se poklapa sa valutom kredita Nakon popunjavanja forme, sistem
proverava unete podatke i prikazuje korisniku potvrdu o uspesnom
podnosenju zahteva i novac na racun. Logika Entiteti - kredit i rata Na
timovima je da li će da imaju i entitet ZahtevZaKredit (LoanRequest) i
kako će on da izgleda. Napomena: potrebno je da se čuva istorija rata +
1 rata u budućnosti

Podatak Opis Primer Učestalost promena Vrsta kredita Vrsta kredita -
može biti gotovinski (keš), stambeni, auto, refinansirajući, studentski
Gotovinski Ne menja se Broj računa / račun Račun sa kojeg se skidaju
rate 265000000111111111111 Ne menja se Broj kredita Jedinstveni
identifikator kredita 17629 Ne menja se Iznos kredita Osnovni iznos koji
je klijent pozajmio 296.304,55 RSD Ne menja se Period otplate Broj rata
86 Ne menja se Kamatna stopa (osnovica) Fiksna ili varijabilna, u %
10.24% Menja se pri penalima Datum ugovaranja Datum kada je kredit
odobren 23.04.2018 Ne menja se Datum dospeća kredita Datum završetka
isplaćivanja kredita 31.10.2022 Ne menja se Iznos mesečne rate Iznos
rate na osnovu formule 6.177,99 RSD Menja se zajedno sa kursom Datum
sledeće rate Datum sledeće rate 31.10.2019 Menja se nakon svake rate (+1
mesec) Preostalo dugovanje Preostali iznos 55.341,66 Menja se nakon
svake rate Valuta Valuta kredita RSD Ne menja se Status kredita odobren,
odbijen, otplaćen, u kašnjenju Odbijen Menja se Tip kamate Fiksna ili
varijabilna fiksna Ne menja se

Podatak Opis Primer Učestalost promena id Jedinstevni ID rate 2 Ne Broj
kredita ID kredita na koji se odnosi 17629 Ne Iznos rate Iznos rate
23.000 Pri kašnjenju Iznos kamatne stope Iznos kamatne stope na datum
plaćanja. Ovo je važno kod varijabilnih stopa 7.50% Ne Valuta Valuta
rate i kredita RSD Ne Očekivani datum dospeća Kada se povlači novac sa
računa 3.10.2024. Ne Pravi datum dospeća Kada je novac sa računa uspešno
povučen 6.10.2024. Kada dospe rata Status plaćanja Plaćeno, neplaćeno,
kasni plaćeno Pri skidanju rate - uspešno i neuspešno

Kamatne stope i marža banke Kamatna stopa se određuje na osnovu iznosa
kredita, i one su date na godišnjem nivou. Ako je iznos u drugoj valuti,
kamatnu stopu računamo na osnovu ekvivalentne vrednosti u RSD (API-ji
koji se mogu koristiti za ovo su navedeni u delu Menjačnica).

Iznos kredita (RSD) Godišnja fiksna kamatna stopa (%) Godišnja
varijabilna kamatna stopa (%) - osnovica ± pomeraj 0 - 500.000 6.25%
6.25% ± do 1.50% 500.001 - 1.000.000 6.00% 6.00% ± do 1.50% 1.000.001 -
2.000.000 5.75% 5.75% ± do 1.50% 2.000.001 - 5.000.000 5.50% 5.50% ± do
1.50% 5.000.001 - 10.000.000 5.25% 5.25% ± do 1.50% 10.000.001 -
20.000.000 5.00% 5.00% ± do 1.50% 20.000.001 + 4.75% 4.75% ± do 1.50%

Marža banke obično zavisi od tipa kredita, da li je kredit obezbeđen ili
ne. Kod nas će zavisiti samo od vrste kredita.

Tip kredita Marža banke (%) - M Gotovinski (keš) 1.75% Stambeni 1.50%
Auto 1.25% Refinansirajući 1.00% Studentski 0.75% Formula za
izračunavanje rate kredita

A - mesečna rata P - iznos kredita r - mesečna kamatna stopa (godišnja /
12) N - (početni) broj rata

Fiksna kamatna stopa - možemo direktno da koristimo formulu.

Varijabilna kamatna stopa Vrednost godišnje kamatne stope se ažurira
periodično (npr. jednom mesečno). U realnim uslovima, nova mesečna
kamatna stopa se računa prema formuli:

R -- referentna vrednost (EURIBOR, BELIBOR), kod nas osnovica + pomeraj
za taj mesec M -- marža banke, zavisno od tipa kredita

Naša simulacija: Opcija 1: Međutim, pošto API-ji za dohvat referentnih
vrednosti u Evropi i Srbiji zahtevaju registraciju i/ili plaćanje, mi
ćemo ovaj proces simulirati. Jednom mesečno (cron job), sistem generiše
nasumičan pomeraj u rasponu \[-1.50%, +1.50%\], čime će se imitirati
realne promene tržišnih uslova. Nova godišnja kamatna stopa će se
računati prema sledećoj formuli:

Osnovica - osnovica iz tabele Pomeraj - od -1.50 do 1.50 M - marža
banke, zavisno od tipa kredita

Opcija 2: U okviru "Portala za upravljanje Kreditima" Zaposleni može
jednom mesečno da unese aktuelne varijabilne kamatne stope (u gornjoj
formuli to predstavlja osnovicu + pomeraj).

Informativno: Referentna vrednost dolazi iz finansijskih tržišta i
određuju je bankarske institucije: 1. EURIBOR (Euro Interbank Offered
Rate) -- koristi se u EU i predstavlja kamatu po kojoj evropske banke
međusobno pozajmljuju novac. 2. BELIBOR (Beogradska međubankarska
kamatna stopa) -- koristi se u Srbiji i određuje se na osnovu kamata
koje banke međusobno dogovaraju.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Automatsko skidanje rata Sistem pokreće
cron job jednom dnevno i obavlja sledeće radnje:  1. Proverava sve
kredite čiji je datum sledeće rate danas. 2. Pokušava da skine iznos
rate sa tekućeg računa klijenta. 3. Ako sredstva nisu dovoljna, korak 3
se ponavlja dok se ne isplati rata. \* Klijent dobija obaveštenje putem
mejla/SMS-a. \* Sistem ponovo pokušava da naplati ratu za 72h - odluka
tima za broj sati \* Ako ni tada nema dovoljno sredstava, može doći do:
\* Povećanja osnovice kamatne stope (npr. +0.05% za kašnjenje) \*
Pokretanja pravnog postupka ako dug premaši određeni prag - van sistema
banke, timovi ovo ne implementiraju Portal za upravljanje Računima Ovom
portalu imaju pristup Zaposleni. Prikazani su svi računi, sortirani
abecedno po prezimenu Klijenata. Prikazano je broj računa, ime i prezime
vlasnika, da li je račun lični ili poslovni i da li je račun tekući ili
devizni. Dodatno, postoji filter∫na osnovu imena i prezimena vlasnika
računa, kao i broja računa. Klikom na račun se otvara Stranica svih
kartice vezane za taj račun.

Stranica svih kartica vezane za račun U zaglavlju se vide iste
informacije o računu kao na prethodnoj stranici. Za svaku karticu je
prikazano: - Broj kartice - Vlasnik kartice (ime i prezime, email
adresa)  - Stanje kartice (aktivna, blokirana ili deaktivirana).

Zaposleni može da blokira aktivnu karticu, deblokira blokiranu ili
deaktivira karticu. Nakon ovoga, Klijent dobija mejl koji ga informiše o
tom događaju. U slučaju poslovnog računa, mejl dobijaju i Vlasnik računa
i OvlascenoLice kome pripada kartica.

Portal za upravljanje Klijentima Ovom portalu imaju pristup Zaposleni.
Prikazani su svi klijenti, sortirano abecedno po prezimenu. Prikazano je
ime i prezime, email adresa i broj telefona. Postoji filter na osnovu
imena i prezimena, kao i mejla. Klikom na Klijenta se otvara stranica za
editovanje klijenta - mogu se menjati sve stavke sem passworda i jmbg-a
(za timove koji imaju jmbg u bazi).

Prilikom menjanja mejla treba proveriti da je mejl i dalje unique u
bazi.

Portal za Upravljanje Kreditima Ovom portalu imaju pristup Zaposleni.
Postoje 2 stranice: 1. Zahtevi za kredit Prikazani su svi zahtevi za
kredite, sortirani po datumu podnošenja zahteva. Postoji filter po vrsti
kredita i broju računa. Za svaki zahtev su prikazane sve stavke koje je
Klijent morao da upiše i postoje dugmad "Odobri" ili "Odbij". 2. Spisak
svih kredita Prikazani su svi krediti sortirani po broju račna. Postoji
filter po vrsti kredita, broja računa i statusa kredita. Za svaki kredit
je prikazano vrsta kredita, tip kamate, datum ugovaranja, period
otplate, broj računa, iznos kredita, preostalo dugovanje, valuta i
status kredita.
