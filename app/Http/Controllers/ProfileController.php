<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\PulseReaction;
use App\Models\PulseRecipient;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        // إحصائيات النبضات
        $pulseStats = [
            'totalPulses' => DB::table('pulses')->where('sender_id', $user->id)->count(),
            'totalLikes' => PulseReaction::whereHas('pulse', function ($query) use ($user) {
                $query->where('sender_id', $user->id);
            })->count(),
            'totalRecipients' => PulseRecipient::whereHas('pulse', function ($query) use ($user) {
                $query->where('sender_id', $user->id);
            })->count(),
            'friendsCount' => DB::table('user_friendships')
                ->where('user_id', $user->id)
                ->where('is_blocked', false)
                ->count(),
        ];

        return Inertia::render('profile/ProfilePage', compact('user', 'pulseStats'));
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:200',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $request->only(['name', 'email', 'phone', 'city', 'bio']);

        // معالجة رفع الصورة
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');

            // حذف الصورة القديمة إذا كانت موجودة
            if ($user->avatar_url && Storage::exists($user->avatar_url)) {
                Storage::delete($user->avatar_url);
            }

            // رفع الصورة الجديدة
            $filename = time() . '_' . uniqid() . '.' . $avatar->getClientOriginalExtension();
            $path = $avatar->storeAs('avatars', $filename, 'public');

            $data['avatar_url'] = '/storage/' . $path;
        }

        // تحديث بيانات المستخدم
        $user->update($data);

        return back()->with('success', 'تم تحديث الملف الشخصي بنجاح');
    }

    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'ملف الصورة غير صحيح'], 400);
        }

        $user = Auth::user();
        $avatar = $request->file('avatar');

        // حذف الصورة القديمة إذا كانت موجودة
        if ($user->avatar_url && Storage::exists(str_replace('/storage/', '', $user->avatar_url))) {
            Storage::delete('public/' . str_replace('/storage/', '', $user->avatar_url));
        }

        // رفع الصورة الجديدة
        $filename = time() . '_' . uniqid() . '.' . $avatar->getClientOriginalExtension();
        $path = $avatar->storeAs('avatars', $filename, 'public');
        $avatarUrl = '/storage/' . $path;

        // تحديث المستخدم
        $user->update(['avatar_url' => $avatarUrl]);

        return response()->json([
            'success' => true,
            'avatar_url' => $avatarUrl,
            'message' => 'تم تحديث الصورة الشخصية بنجاح'
        ]);
    }

    public function deleteAvatar()
    {
        $user = Auth::user();

        if ($user->avatar_url) {
            // حذف الصورة من التخزين
            if (Storage::exists(str_replace('/storage/', '', $user->avatar_url))) {
                Storage::delete('public/' . str_replace('/storage/', '', $user->avatar_url));
            }

            // إزالة رابط الصورة من قاعدة البيانات
            $user->update(['avatar_url' => null]);

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الصورة الشخصية بنجاح'
            ]);
        }

        return response()->json(['error' => 'لا توجد صورة شخصية لحذفها'], 400);
    }
}