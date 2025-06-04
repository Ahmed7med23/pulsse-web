<?php

namespace App\Http\Controllers;

use App\Models\Circle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CirclesController extends Controller
{
    /**
     * Display the circles page.
     */
    public function index(): Response
    {
        $circles = auth()->user()->circles()->latest()->get();

        return Inertia::render('circles/CirclesPage', [
            'circles' => $circles
        ]);
    }

    /**
     * Store a newly created circle.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'color' => 'required|string',
            'icon' => 'required|string',
            'privacy_type' => 'required|in:public,private',
        ]);

        try {
            $circle = auth()->user()->circles()->create([
                ...$validated,
                'is_active' => true,
                'pulse_strength' => 0,
                'is_favorite' => false,
            ]);

            return redirect()->back()->with([
                'message' => [
                    'en' => 'Circle created successfully!',
                    'ar' => 'تم إنشاء الدائرة بنجاح!'
                ],
                'type' => 'success',
                'circle' => $circle
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with([
                'message' => [
                    'en' => 'Failed to create circle. Please try again.',
                    'ar' => 'فشل في إنشاء الدائرة. يرجى المحاولة مرة أخرى.'
                ],
                'type' => 'error',
                'error' => $e->getMessage()
            ])->withInput();
        }
    }

    public function show(Circle $circle)
    {

        // $circle->load('members');

        return Inertia::render('circles/CircleDetailsPage', [
            'circle' => $circle
        ]);
    }
}