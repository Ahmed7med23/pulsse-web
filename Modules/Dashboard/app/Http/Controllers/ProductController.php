<?php

namespace Modules\Dashboard\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // هنا يمكنك جلب بيانات المنتجات من قاعدة البيانات
        // $products = Product::all();

        return Inertia::render('dashboard/pages/products/ProductsPage', [
            // 'products' => $products
        ]);
    }
}