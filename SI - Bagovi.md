

1. Reqs za šifru

Toggle approval ne radi — Actuaries admin

2. Securities → Details na klik:

Nema ničega na dijagramu, tj. postoji samo tačka sa trenutnom cenom.

3. Source fund:

Kada se izabere fund, pojavljuje se random broj.

4. Fund value:

Prikazuje se `undefined RSD`, iako u portfolio sekciji postoji vrednost.

5. Fali validacija da ne dozvolimo unos samo jednog broja — minimum treba da bude 100 RSD.  
6. Takodje kada probamo sa istog fund-a da prebacimo pare na fund, nije obradjena greska ( mislimo da je problem jer nismo imale para).

Kada se unese previše novca u funds, aplikacija vraća samo server error 500 umesto obrađene korisničke greške.

7. Taxes:

Prikazuje “No taxes found”, ali i dalje možemo da collectujemo — izlazi success.

8. Settings → Apply to loans:

Apply se izvrši, ali nakon toga piše “0 loans applied”.

9. Fali success toast kada se u Settings sekciji update-uju permisije.  
10. Client front → Cards:

Moguće je neograničeno menjati PIN bez unosa starog PIN-a.

11. Confirm payment:

Nije obrađen error handling, već se prikazuje random backend error:  
“Failed to fetch recipient account, error code not found”.

12. New transfer / New payment:

Fali verifikacioni kod i dodatna provera potvrde akcije.

13. Submit loan request → UI:

Kada se izabere opcija, tekst postaje ALL CAPS.

14. Submit loan request:

Kada se unese ekstremno veliki amount, pojavljuje se random backend error.

15. Securities \- Agent i client:

Klijent bez permisije može da otvori stranu. Tek pri “Create order” dobija error:  
“You do not have permission”.  
Takođe, order se ipak izvrši uprkos error toast-u.   
Backend poziv ima /bank-accounts?

16. Invest in:

Ne vidi se razlika između naloga — možda prikazati ID naloga.

17. Portfolio → Redeem:

Ponovo izlazi “You do not have permission” toast, ali se stranica ipak otvara.

18. Admin → All loans:

“Installment” polje prikazuje `NaN RSD`.

19. Client → Loan details:

Pojavljuju se `undefined` polja.

20. Na supervisor nalogu, kada pokušamo da otvorimo/view-ujemo fund, pojavljuje se greška vezana za request URL (`employee/3...`).

Deluje da se poziva pogrešan endpoint ili da se ID/user route nepravilno formira za supervisor role.

21. Agent \-\> Loan request, Card request, Loan, Stock exchanges (/testing-mode)

Dobijamo neobradjen BE error. 

Njegova rola nema pristupe, ali nije obradjeno

22\. Supervisor i agent \-\> Account managment \-\> Activity 

Na klik dugmetu samo refreshuje stranu, a admina odvede na stranicu ali pise da nema pristup (admin je??)