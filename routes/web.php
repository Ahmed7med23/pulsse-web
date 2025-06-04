<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CirclesController;
use App\Http\Controllers\FriendsController;
use App\Http\Controllers\PulsesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Routes requiring authentication
Route::middleware(['auth'])->group(function () {

    Route::get('/', [PulsesController::class, 'index'])->name('home');

    Route::get('/profile', [HomeController::class, 'profile'])->name('profile');


    Route::get('/circles', [CirclesController::class, 'index'])->name('circles');
    Route::post('/circles', [CirclesController::class, 'store'])->name('circles.store');
    Route::get('/circles/{circle}', [CirclesController::class, 'show'])->name('circles.show');


    Route::get('/friends', [FriendsController::class, 'index'])->name('friends');
    Route::get('/friends/search-by-phone', [FriendsController::class, 'searchByPhone']);
    Route::post('/friends/send-request', [FriendsController::class, 'sendRequest']);
    Route::post('/friends/send-invitation', [FriendsController::class, 'sendInvitation']);



    Route::post('/pulses/send', [PulsesController::class, 'send'])->name('pulses.send');
});

// login
Route::get('/login', [AuthController::class, 'loginPage'])->name('login'); // It's good practice to name your login route

// login post
Route::post('/login', [AuthController::class, 'login'])->name('login.post');

// logout
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// register
Route::get('/register', [AuthController::class, 'registerPage'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.post');


// verify
Route::get('/verify/{phone}/{otp}', [AuthController::class, 'verify'])->name('verify');