# Alma Routing

This Alma Cloud App takes information about interested users from order line and performs loan on first (resp. return and loan on next) interested user.
This App can be used to support item routing.

## How App workes:

First, you have to set up this app. Code of library and circulation desc for loan operations is needed. You can also define the behavior of app if user has a block. If you set 'Yes' to skip user with block, app skips such user and performs loan on next interested user automatically. In case of 'No' (return will be performed for item already on loan) item will not be loaned on next user automatically and you have to perform next loan manually.

After settings are correct, you can enter a barcode of routing item. Upon entered barcode the app gets order line and takes interested users with ‘Notify upon cancellation’ selected. If there are such interested users, app checks if item is on loan. If item isn’t on loan, first interested user is taken to perform loan. If item is on loan, app gets current user of this loan, makes return of this item, upon interested user list the next user to perform loan will be taken and item will be loaned on this user. If there is no interested user more a message about end of routing is displayed. After loan was performed a window with (currently not customable) slip letter will be opened and can be printed.    
 

