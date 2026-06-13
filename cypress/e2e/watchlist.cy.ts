// Celina 3 — Watchlist (Scenarios 35–39)
//
// FE routes:
//   /securities               → SecuritiesView (Stocks tab by default; each row
//                               carries a heart WatchlistButton that opens
//                               AddToWatchlistDialog)
//   /portfolio?tab=favorites  → PortfolioView → WatchlistPanel (list picker,
//                               New list, Type filter, FavoritesTable with
//                               per-row Buy + Remove)
//   /securities/order/new     → CreateOrderView (reads listingId / direction /
//                               securityType / ticker from the query string)
//
// Watchlist API (spec — named lists):
//   GET    /api/v3/me/watchlists                      → { watchlists: Watchlist[] }
//   POST   /api/v3/me/watchlists                      → { watchlist: Watchlist }
//   GET    /api/v3/me/watchlists/:id/items[?listing_type=] → { items: WatchlistItem[] }
//   POST   /api/v3/me/watchlists/:id/items            ← { listing_id }
//   DELETE /api/v3/me/watchlists/:id/items/:listing_id

interface WatchlistItemStub {
  id: number
  listing_id: number
  security_type: 'stock' | 'option' | 'futures' | 'forex'
  ticker: string
  current_price: string
  daily_change: string
  daily_change_percent: string
  added_at_unix: number
}

// The backend's lazily-created default list is named "My Watchlist";
// the UI displays it as "Favorites".
const DEFAULT_LIST = { id: 1, name: 'My Watchlist', item_count: 1, created_at: 1747000000 }
const TECH_LIST = { id: 5, name: 'Tech akcije', item_count: 0, created_at: 1749000000 }

// MSFT in stocks-list.json has id 2 (no listing_id → the FE falls back to id).
const MSFT_ITEM: WatchlistItemStub = {
  id: 11,
  listing_id: 2,
  security_type: 'stock',
  ticker: 'MSFT',
  current_price: '415.20',
  daily_change: '2.30',
  daily_change_percent: '0.56',
  added_at_unix: 1749000000,
}

const AAPL_ITEM: WatchlistItemStub = {
  id: 10,
  listing_id: 42,
  security_type: 'stock',
  ticker: 'AAPL',
  current_price: '187.45',
  daily_change: '1.25',
  daily_change_percent: '0.67',
  added_at_unix: 1749000000,
}

const ES_FUTURE_ITEM: WatchlistItemStub = {
  id: 12,
  listing_id: 77,
  security_type: 'futures',
  ticker: 'ESM26',
  current_price: '5300.00',
  daily_change: '-12.50',
  daily_change_percent: '-0.24',
  added_at_unix: 1749000000,
}

// Everything the /portfolio page fetches besides the watchlist endpoints,
// so the Favorites tab loads cleanly (mirrors portfolio.cy.ts).
function stubPortfolioShell() {
  cy.intercept('GET', '**/api/v3/me/portfolio', { fixture: 'portfolio-holdings.json' }).as(
    'getPortfolio'
  )
  cy.intercept('GET', '**/api/v3/me/portfolio/summary*', { fixture: 'portfolio-summary.json' }).as(
    'getSummary'
  )
  cy.intercept('GET', '**/api/v3/me/investment-funds', { body: { positions: [] } })
  cy.intercept('GET', '**/api/v3/me/accounts*', { fixture: 'home-accounts.json' }).as('getAccounts')
  cy.intercept('GET', '**/api/v3/me/price-alerts*', { body: { alerts: [] } })
  cy.intercept('GET', '**/api/v3/me/recurring-orders*', { body: { recurring_orders: [] } })
  cy.intercept('GET', '**/api/v3/securities/stocks*', { body: { stocks: [], total_count: 0 } })
  cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
}

// The /securities Stocks tab (client login → no forex call).
function stubSecuritiesPage() {
  cy.intercept('GET', '**/api/v3/securities/stocks*', { fixture: 'stocks-list.json' }).as(
    'getStocks'
  )
  cy.intercept('GET', '**/api/v3/securities/futures*', { body: { futures: [], total_count: 0 } })
}

function stubWatchlists(lists: Array<typeof DEFAULT_LIST>) {
  cy.intercept('GET', '**/api/v3/me/watchlists', { body: { watchlists: lists } }).as(
    'getWatchlists'
  )
}

describe('Celina 3 — Watchlist', () => {
  // ── Scenario 35: Dodavanje hartije na watchlist ───────────────────────────
  // Klijent na listi hartija klikne na srce pored MSFT i doda je na svoju
  // watchlistu; hartija se zatim prikazuje na Favorites tabu sa cenom i
  // dnevnom promenom. (Naslovni deo prihvatnog testa — "watchlist prikazuje
  // header" — realizovan je prikazom na Favorites tabu portfolija.)
  it('Scenario 35 — adding a security via the heart shows it on the Favorites tab with price and daily change', () => {
    stubSecuritiesPage()
    stubWatchlists([DEFAULT_LIST])
    cy.intercept('GET', '**/api/v3/me/watchlists/*/items*', { body: { items: [] } }).as('getItems')
    cy.intercept('POST', '**/api/v3/me/watchlists/*/items', {
      statusCode: 201,
      body: { item: MSFT_ITEM },
    }).as('addItem')

    cy.loginAsClient('/securities')
    cy.wait('@getStocks')

    // srce (heart) na MSFT redu
    cy.get('[aria-label="Add MSFT to watchlist"]').click()
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Add to list').click()
    })

    cy.wait('@addItem').its('request.body').should('deep.equal', { listing_id: 2 })
    cy.get('@addItem').its('request.url').should('include', '/me/watchlists/1/items')

    // Favorites tab prikazuje dodatu hartiju sa cenom i dnevnom promenom
    stubPortfolioShell()
    cy.intercept('GET', '**/api/v3/me/watchlists/*/items*', { body: { items: [MSFT_ITEM] } }).as(
      'getItemsWithMsft'
    )

    cy.loginAsClient('/portfolio?tab=favorites')
    cy.wait('@getItemsWithMsft')

    // shadcn <Table> sedi u overflow-x-auto wrapperu — scrollIntoView pre
    // visibility provere, kao u portfolio.cy.ts
    cy.contains('td', 'MSFT').scrollIntoView().should('be.visible')
    cy.contains('td', '415.20').scrollIntoView().should('be.visible') // cena
    cy.contains('td', '+2.30').scrollIntoView().should('be.visible') // dnevna promena
    cy.contains('td', '+0.56%').scrollIntoView().should('be.visible') // dnevna promena u %
  })

  // ── Scenario 36: Kreiranje više watchlisti ────────────────────────────────
  // Klijent kreira novu listu "Tech akcije"; lista se pojavljuje u izboru
  // listi na Favorites tabu i hartije mogu da se dodaju na nju (nudi se u
  // AddToWatchlistDialog-u na stranici hartija).
  it('Scenario 36 — creating a second watchlist offers it in the picker and in the add-to-list dialog', () => {
    stubPortfolioShell()
    stubWatchlists([DEFAULT_LIST])
    cy.intercept('GET', '**/api/v3/me/watchlists/*/items*', { body: { items: [] } }).as('getItems')
    cy.intercept('POST', '**/api/v3/me/watchlists', {
      statusCode: 201,
      body: { watchlist: TECH_LIST },
    }).as('createList')

    cy.loginAsClient('/portfolio?tab=favorites')
    cy.wait('@getWatchlists')

    // posle kreiranja, refetch listi vraća i novu listu
    cy.intercept('GET', '**/api/v3/me/watchlists', {
      body: { watchlists: [DEFAULT_LIST, TECH_LIST] },
    }).as('getWatchlistsAfter')

    cy.contains('button', 'New list').click()
    cy.contains('New watchlist').should('be.visible')
    cy.get('#watchlist-name').type('Tech akcije')
    cy.contains('button', 'Create list').click()

    cy.wait('@createList').its('request.body').should('deep.equal', { name: 'Tech akcije' })
    cy.wait('@getWatchlistsAfter')

    // nova lista postaje izabrana i nudi se u list picker-u
    cy.get('#watchlist-picker').should('contain.text', 'Tech akcije')
    cy.get('#watchlist-picker').realClick()
    cy.contains('[role="option"]', 'Tech akcije').should('be.visible').realClick()

    // i hartije mogu da se dodaju na nju: AddToWatchlistDialog je nudi
    stubSecuritiesPage()
    cy.loginAsClient('/securities')
    cy.wait('@getStocks')

    cy.get('[aria-label="Add MSFT to watchlist"]').click()
    cy.get('[role="dialog"]').should('be.visible')
    cy.get('#watchlist-select').realClick()
    cy.contains('[role="option"]', 'Tech akcije').should('be.visible')
  })

  // ── Scenario 37: Uklanjanje hartije sa watchliste ─────────────────────────
  // Klijent ukloni AAPL sa watchliste; šalje se DELETE i hartija se više ne
  // prikazuje (prikazuje se empty-state poruka).
  it('Scenario 37 — removing a security fires DELETE and the row disappears', () => {
    stubPortfolioShell()
    stubWatchlists([DEFAULT_LIST])
    cy.intercept('GET', '**/api/v3/me/watchlists/*/items*', { body: { items: [AAPL_ITEM] } }).as(
      'getItems'
    )
    cy.intercept('DELETE', '**/api/v3/me/watchlists/*/items/*', { statusCode: 204 }).as(
      'removeItem'
    )

    cy.loginAsClient('/portfolio?tab=favorites')
    cy.wait('@getItems')
    cy.contains('td', 'AAPL').scrollIntoView().should('be.visible')

    // posle uklanjanja, refetch stavki vraća praznu listu
    cy.intercept('GET', '**/api/v3/me/watchlists/*/items*', { body: { items: [] } }).as(
      'getItemsEmpty'
    )

    cy.get('[aria-label="Remove AAPL from watchlist"]').click()
    cy.wait('@removeItem').its('request.url').should('include', '/me/watchlists/1/items/42')

    cy.wait('@getItemsEmpty')
    cy.contains('td', 'AAPL').should('not.exist')
    cy.contains('Your watchlist is empty').should('be.visible')
  })

  // ── Scenario 38: Brzo kreiranje ordera sa watchliste ──────────────────────
  // Klijent klikne Buy na MSFT redu watchliste; otvara se forma za kreiranje
  // ordera sa popunjenim listingId / direction / securityType / ticker.
  it('Scenario 38 — the row Buy button opens the prefilled create-order form', () => {
    stubPortfolioShell()
    stubWatchlists([DEFAULT_LIST])
    cy.intercept('GET', '**/api/v3/me/watchlists/*/items*', { body: { items: [MSFT_ITEM] } }).as(
      'getItems'
    )
    // CreateOrderView (client path): /me/accounts is stubbed in the shell;
    // the remaining queries it issues are stubbed empty.
    cy.intercept('GET', '**/api/v3/bank-accounts*', { body: { accounts: [] } })
    cy.intercept('GET', '**/api/v3/investment-funds*', { body: { funds: [], total_count: 0 } })

    cy.loginAsClient('/portfolio?tab=favorites')
    cy.wait('@getItems')

    cy.get('[aria-label="Create order for MSFT"]').click()

    cy.url().should('include', '/securities/order/new')
    cy.url().should('include', 'listingId=2')
    cy.url().should('include', 'direction=buy')
    cy.url().should('include', 'securityType=stock')
    cy.url().should('include', 'ticker=MSFT')

    // forma za order se renderuje
    cy.contains('h1', 'Create Order').should('be.visible')
    cy.get('#quantity').should('be.visible')
    cy.get('#account').should('be.visible')
    cy.contains('button', 'Place Order').should('be.visible')
  })

  // ── Scenario 39: Filtriranje watchliste po tipu hartije ───────────────────
  // Watchlista sadrži akciju (AAPL) i terminski ugovor (ESM26); izbor
  // "Stocks" u Type filteru šalje listing_type=stock i prikazuje samo akcije.
  it('Scenario 39 — the Type filter re-fetches with listing_type=stock and hides non-stock rows', () => {
    stubPortfolioShell()
    stubWatchlists([DEFAULT_LIST])
    cy.intercept('GET', '**/api/v3/me/watchlists/*/items*', (req) => {
      if (req.query['listing_type'] === 'stock') {
        req.reply({ body: { items: [AAPL_ITEM] } })
      } else {
        req.reply({ body: { items: [AAPL_ITEM, ES_FUTURE_ITEM] } })
      }
    }).as('getItems')

    cy.loginAsClient('/portfolio?tab=favorites')
    cy.wait('@getItems')
    cy.contains('td', 'AAPL').scrollIntoView().should('be.visible')
    cy.contains('td', 'ESM26').scrollIntoView().should('be.visible')

    // Radix select opcije se renderuju u portalu — realClick kao i u ostalim
    // specovima (cypress-real-events)
    cy.get('[aria-label="Filter by type"]').realClick()
    cy.contains('[role="option"]', 'Stocks').realClick()

    cy.wait('@getItems').its('request.url').should('include', 'listing_type=stock')

    cy.contains('td', 'ESM26').should('not.exist')
    cy.contains('td', 'AAPL').scrollIntoView().should('be.visible')
  })
})
