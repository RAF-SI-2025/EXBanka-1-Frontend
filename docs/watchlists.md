- New features need to be added to WatchLists!
- Currently, users can add securities to watchlists by clicking the heart button next to them.
- This feature will now expand in a way that allows users to create multiple lists and add securities to them!
- Here is a suggestion of the changes:
1. User Portfolio tab contains "Favorites" tab.
    - This tab should now contain 2 more things. A "New List" button, which opens a small form for creation of a new list, that contains necessary information for POST /api/v3/me/watchlists and performs it upon confirming.
    - There should also be a dropdown list on this tab that shows all user's watchlists with GET /api/v3/me/watchlists, and then upon selecting one of them, the table is populated with that list's content GET /api/v3/me/watchlists/:watchlist_id/items.
    - Since there is a default watchlist it should just be called "Favorites"
2. Securities tab has the heart button that adds the security to the watchlist. The button currently adds to deafult list, so it should instead open a form with dropdown selection of user's watchlists which when selected does a POST /api/v3/me/watchlists/:watchlist_id/items 
- Note that since admin/employee work for the bank, they should see only bank's watchlists, while client can see only their own.