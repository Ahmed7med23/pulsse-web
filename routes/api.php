<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FriendsController;
use App\Http\Controllers\PulsesController;
use App\Http\Controllers\PulseReactionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Friend routes
    Route::post('/pulses/send', [PulsesController::class, 'send']);

    // Pulse routes
    Route::get('/pulses/sent', [PulsesController::class, 'sentPulses']);
    Route::get('/pulses/received', [PulsesController::class, 'receivedPulses']);
    Route::get('/pulses/all', [PulsesController::class, 'allPulses']);

    // Pulse Reaction routes
    Route::post('/pulses/{pulse}/reactions', [PulseReactionController::class, 'toggleReaction']);
    Route::get('/pulses/{pulse}/reactions', [PulseReactionController::class, 'getPulseReactions']);
    Route::get('/pulses/{pulse}/reactions/user', [PulseReactionController::class, 'getUserReaction']);
    Route::delete('/pulses/{pulse}/reactions', [PulseReactionController::class, 'removeAllReactions']);
});
