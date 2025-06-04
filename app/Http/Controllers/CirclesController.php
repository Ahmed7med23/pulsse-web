<?php

namespace App\Http\Controllers;

use App\Models\Circle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CirclesController extends Controller
{
    /**
     * Display the circles page.
     */
    public function index(): Response
    {
        $userId = Auth::id();

        // Get circles with actual member counts
        $circles = Circle::where('user_id', $userId)
            ->withCount(['members'])
            ->latest()
            ->get()
            ->map(function ($circle) {
                // Calculate pulse count directly
                $pulsesCount = DB::table('pulses')
                    ->where('type', 'circle')
                    ->whereRaw("JSON_EXTRACT(metadata, '$.circle_id') = ?", [$circle->id])
                    ->count();

                return [
                    'id' => $circle->id,
                    'name' => $circle->name,
                    'description' => $circle->description,
                    'color' => $circle->color,
                    'icon' => $circle->icon,
                    'privacy_type' => $circle->privacy_type,
                    'members_count' => $circle->members_count,
                    'pulses_count' => $pulsesCount,
                    'is_favorite' => $circle->is_favorite,
                    'created_at' => $circle->created_at,
                    'lastActivity' => $circle->updated_at->diffForHumans(),
                    'last_activity' => $circle->updated_at->diffForHumans(),
                ];
            });

        // Debug: Add some mock data if no circles exist
        if ($circles->isEmpty()) {
            $circles = collect([
                [
                    'id' => 1,
                    'name' => 'دائرة الأصدقاء',
                    'description' => 'دائرة للأصدقاء المقربين لمشاركة اللحظات الجميلة',
                    'color' => 'from-blue-400 to-indigo-500',
                    'icon' => 'users',
                    'privacy_type' => 'private',
                    'members_count' => 5,
                    'pulses_count' => 12,
                    'is_favorite' => true,
                    'created_at' => now(),
                    'lastActivity' => 'منذ 5 دقائق',
                    'last_activity' => 'منذ 5 دقائق',
                ],
                [
                    'id' => 2,
                    'name' => 'دائرة العمل',
                    'description' => 'زملاء العمل والمشاريع المهنية والتطوير المهني',
                    'color' => 'from-green-400 to-emerald-500',
                    'icon' => 'settings',
                    'privacy_type' => 'private',
                    'members_count' => 8,
                    'pulses_count' => 25,
                    'is_favorite' => false,
                    'created_at' => now(),
                    'lastActivity' => 'منذ ساعتين',
                    'last_activity' => 'منذ ساعتين',
                ],
                [
                    'id' => 3,
                    'name' => 'دائرة الهوايات',
                    'description' => 'مشاركة الاهتمامات والهوايات المختلفة',
                    'color' => 'from-purple-400 to-pink-500',
                    'icon' => 'heart',
                    'privacy_type' => 'public',
                    'members_count' => 12,
                    'pulses_count' => 18,
                    'is_favorite' => true,
                    'created_at' => now(),
                    'lastActivity' => 'منذ يوم واحد',
                    'last_activity' => 'منذ يوم واحد',
                ]
            ]);
        }

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
            $circle = Circle::create([
                ...$validated,
                'user_id' => Auth::id(),
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
        // Check if user owns the circle
        if ($circle->user_id !== Auth::id()) {
            abort(403, 'غير مخول للوصول لهذه الدائرة');
        }

        // Calculate actual pulse count for this circle
        $pulsesCount = DB::table('pulses')
            ->where('type', 'circle')
            ->whereRaw("JSON_EXTRACT(metadata, '$.circle_id') = ?", [$circle->id])
            ->count();

        // Get circle members with their details
        $members = DB::table('circle_members')
            ->join('users', 'circle_members.user_id', '=', 'users.id')
            ->where('circle_members.circle_id', $circle->id)
            ->select(
                'users.id',
                'users.name',
                'users.avatar_url',
                'circle_members.added_at',
                'circle_members.created_at'
            )
            ->orderBy('circle_members.created_at', 'desc')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'avatar' => $member->avatar_url ?: 'https://ui-avatars.com/api/?name=' . urlencode($member->name) . '&background=random',
                    'added_at' => \Carbon\Carbon::parse($member->added_at)->diffForHumans(),
                    'added_date' => \Carbon\Carbon::parse($member->added_at)->format('Y-m-d'),
                ];
            });

        return Inertia::render('circles/CircleDetailsPage', [
            'circle' => [
                'id' => $circle->id,
                'name' => $circle->name,
                'description' => $circle->description,
                'color' => $circle->color,
                'icon' => $circle->icon,
                'privacy_type' => $circle->privacy_type,
                'members_count' => $circle->members_count,
                'pulses_count' => $pulsesCount,
                'is_favorite' => $circle->is_favorite,
                'created_at' => $circle->created_at->diffForHumans(),
                'lastActivity' => $circle->updated_at->diffForHumans(),
                'last_activity' => $circle->updated_at->diffForHumans(),
            ],
            'members' => $members
        ]);
    }

    /**
     * Get circle members (API endpoint)
     */
    public function getCircleMembers($circleId)
    {
        $circle = Circle::where('id', $circleId)
            ->where('user_id', Auth::id())
            ->first();

        if (!$circle) {
            return response()->json([
                'message' => [
                    'en' => 'Circle not found or you do not have permission to view it.',
                    'ar' => 'الدائرة غير موجودة أو ليس لديك صلاحية لعرضها.'
                ]
            ], 403);
        }

        $members = DB::table('circle_members')
            ->join('users', 'circle_members.user_id', '=', 'users.id')
            ->where('circle_members.circle_id', $circleId)
            ->select(
                'users.id',
                'users.name',
                'users.avatar_url',
                'circle_members.added_at'
            )
            ->orderBy('circle_members.created_at', 'desc')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'avatar' => $member->avatar_url ?: 'https://ui-avatars.com/api/?name=' . urlencode($member->name) . '&background=random',
                    'added_at' => \Carbon\Carbon::parse($member->added_at)->diffForHumans(),
                ];
            });

        return response()->json($members);
    }

    /**
     * Add a friend to a circle
     */
    public function addMember(Request $request)
    {
        $request->validate([
            'circle_id' => 'required|exists:circles,id',
            'friend_id' => 'required|exists:users,id',
        ]);

        $userId = Auth::id();
        $circleId = $request->circle_id;
        $friendId = $request->friend_id;

        // Check if user owns the circle
        $circle = Circle::where('id', $circleId)
            ->where('user_id', $userId)
            ->first();

        if (!$circle) {
            return response()->json([
                'message' => [
                    'en' => 'Circle not found or you do not have permission to modify it.',
                    'ar' => 'الدائرة غير موجودة أو ليس لديك صلاحية لتعديلها.'
                ]
            ], 403);
        }

        // Check if they are friends
        $friendship = DB::table('user_friendships')
            ->where('user_id', $userId)
            ->where('friend_id', $friendId)
            ->where('is_blocked', false)
            ->first();

        if (!$friendship) {
            return response()->json([
                'message' => [
                    'en' => 'You can only add friends to your circles.',
                    'ar' => 'يمكنك إضافة الأصدقاء فقط إلى دوائرك.'
                ]
            ], 400);
        }

        try {
            // Check if already member
            $existingMember = DB::table('circle_members')
                ->where('circle_id', $circleId)
                ->where('user_id', $friendId)
                ->first();

            if ($existingMember) {
                return response()->json([
                    'message' => [
                        'en' => 'This friend is already in the circle.',
                        'ar' => 'هذا الصديق موجود بالفعل في الدائرة.'
                    ]
                ], 400);
            }

            // Add member to circle
            DB::table('circle_members')->insert([
                'circle_id' => $circleId,
                'user_id' => $friendId,
                'added_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update circle members count
            $circle->increment('members_count');

            return response()->json([
                'message' => [
                    'en' => 'Friend added to circle successfully!',
                    'ar' => 'تم إضافة الصديق إلى الدائرة بنجاح!'
                ],
                'success' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => [
                    'en' => 'Failed to add friend to circle. Please try again.',
                    'ar' => 'فشل في إضافة الصديق إلى الدائرة. يرجى المحاولة مرة أخرى.'
                ],
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a member from a circle
     */
    public function removeMember(Request $request)
    {
        $request->validate([
            'circle_id' => 'required|exists:circles,id',
            'member_id' => 'required|exists:users,id',
        ]);

        $userId = Auth::id();
        $circleId = $request->circle_id;
        $memberId = $request->member_id;

        // Check if user owns the circle
        $circle = Circle::where('id', $circleId)
            ->where('user_id', $userId)
            ->first();

        if (!$circle) {
            return response()->json([
                'message' => [
                    'en' => 'Circle not found or you do not have permission to modify it.',
                    'ar' => 'الدائرة غير موجودة أو ليس لديك صلاحية لتعديلها.'
                ]
            ], 403);
        }

        try {
            // Remove member from circle
            $deleted = DB::table('circle_members')
                ->where('circle_id', $circleId)
                ->where('user_id', $memberId)
                ->delete();

            if ($deleted) {
                // Update circle members count
                $circle->decrement('members_count');

                return response()->json([
                    'message' => [
                        'en' => 'Member removed from circle successfully!',
                        'ar' => 'تم إزالة العضو من الدائرة بنجاح!'
                    ],
                    'success' => true
                ]);
            } else {
                return response()->json([
                    'message' => [
                        'en' => 'Member not found in this circle.',
                        'ar' => 'العضو غير موجود في هذه الدائرة.'
                    ]
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => [
                    'en' => 'Failed to remove member from circle. Please try again.',
                    'ar' => 'فشل في إزالة العضو من الدائرة. يرجى المحاولة مرة أخرى.'
                ],
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's circles for adding friends
     */
    public function getUserCircles()
    {
        $circles = Circle::where('user_id', Auth::id())
            ->select('id', 'name', 'color', 'icon', 'members_count')
            ->where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'circles' => $circles,
            'success' => true
        ]);
    }

    /**
     * Get user's circles with friend membership status
     */
    public function getFriendCircles(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
        ]);

        $userId = Auth::id();
        $friendId = $request->friend_id;

        // Check if they are friends
        $friendship = DB::table('user_friendships')
            ->where('user_id', $userId)
            ->where('friend_id', $friendId)
            ->where('is_blocked', false)
            ->first();

        if (!$friendship) {
            return response()->json([
                'message' => [
                    'en' => 'You can only view circles for your friends.',
                    'ar' => 'يمكنك رؤية الدوائر للأصدقاء فقط.'
                ]
            ], 400);
        }

        // Get all user's circles with membership status
        $circles = Circle::where('user_id', Auth::id())
            ->select('id', 'name', 'color', 'icon', 'members_count')
            ->where('is_active', true)
            ->latest()
            ->get()
            ->map(function ($circle) use ($friendId) {
                // Check if friend is already in this circle
                $isMember = DB::table('circle_members')
                    ->where('circle_id', $circle->id)
                    ->where('user_id', $friendId)
                    ->exists();

                return [
                    'id' => $circle->id,
                    'name' => $circle->name,
                    'color' => $circle->color,
                    'icon' => $circle->icon,
                    'members_count' => $circle->members_count,
                    'is_member' => $isMember,
                ];
            });

        return response()->json([
            'circles' => $circles,
            'success' => true
        ]);
    }
}
