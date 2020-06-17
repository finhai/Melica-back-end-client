'use strict'

const Route = use('Route')

Route.post('login', 'UsuarioController.login')
Route.post('requestDate', 'UsuarioController.requestDate')

Route.post('productsName', 'ProductGroupController.productsDescription')
Route.post('productsID', 'ProductGroupController.productsId')
Route.post('eanID', 'ProductGroupController.eanId')

Route.post('sale', 'SaleController.storeSale')
Route.post('confirmSale', 'SaleController.confirmSale')
Route.post('blindSale', 'SaleController.blindSale')

Route.post('saleReport', 'SaleReportController.saleReport')
Route.post('saleItemReport', 'SaleReportController.storeSale')

Route.post('cancelSale', 'AlterSaleController.cancelSale')
Route.post('changeItens', 'AlterSaleController.changeItens')

Route.post('sellerFinder', 'SellerSearchController.sellerFinder')
