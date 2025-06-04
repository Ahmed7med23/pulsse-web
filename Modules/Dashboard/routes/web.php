<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Modules\Dashboard\Http\Controllers\DashboardController;
use Modules\Dashboard\Http\Controllers\ProductController;



Route::prefix('dashboard')->middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('dashboard/pages/Dashboard');
    })->name('dashboard');

    Route::get('/analytics', function () {
        return Inertia::render('dashboard/pages/analytics/AnalyticsPage');
    })->name('analytics');

    // المنتجات
    Route::get('products', [ProductController::class, 'index'])->name('products.index');

    Route::get('/settings', function () {
        return Inertia::render('dashboard/pages/Settings');
    })->name('settings');
});

// login
Route::get('/dashboard/login', function () {
    return Inertia::render('auth/LoginPage');
});