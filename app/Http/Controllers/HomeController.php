<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the home page.
     */
    public function index(): Response
    {
        return Inertia::render('home/HomePage');
    }




    /**
     * Display the profile page.
     */
    public function profile()
    {

        // Replace 'profile/ProfilePage' with the actual path to your Inertia component
        return Inertia::render('profile/ProfilePage', [
            'user' => auth()->user(),
        ]);
    }
}