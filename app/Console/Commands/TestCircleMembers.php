<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Circle;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TestCircleMembers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:circle-members';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test circle members functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Circle Members Functionality');
        $this->line('=====================================');

        // Get first circle and users
        $circle = Circle::first();
        $users = User::take(3)->get();

        if (!$circle) {
            $this->error('No circles found. Creating a test circle...');
            $firstUser = $users->first();
            if (!$firstUser) {
                $this->error('No users found. Please create some users first.');
                return;
            }

            $circle = Circle::create([
                'name' => 'دائرة اختبار',
                'description' => 'دائرة للاختبار',
                'color' => 'from-blue-400 to-indigo-500',
                'icon' => 'users',
                'privacy_type' => 'private',
                'user_id' => $firstUser->id,
                'is_active' => true,
                'members_count' => 0,
                'pulses_count' => 0,
            ]);
            $this->info("Created test circle: {$circle->name}");
        }

        $this->info("Circle: {$circle->name} (ID: {$circle->id})");
        $this->info("Circle Owner: {$circle->user_id}");

        // Check current members
        $currentMembers = DB::table('circle_members')
            ->where('circle_id', $circle->id)
            ->count();

        $this->info("Current members count: {$currentMembers}");

        // Add some test members if none exist
        if ($currentMembers == 0 && $users->count() > 0) {
            $this->info('Adding test members...');

            foreach ($users as $user) {
                // Skip if user is the circle owner
                if ($user->id == $circle->user_id) {
                    continue;
                }

                DB::table('circle_members')->insert([
                    'circle_id' => $circle->id,
                    'user_id' => $user->id,
                    'added_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->info("Added member: {$user->name} (ID: {$user->id})");
            }

            // Update circle members count
            $newCount = DB::table('circle_members')->where('circle_id', $circle->id)->count();
            $circle->update(['members_count' => $newCount]);
            $this->info("Updated circle members count to: {$newCount}");
        }

        // Now get all members with the same query as the API
        $this->line('');
        $this->info('Testing API Query:');
        $this->line('==================');

        $members = DB::table('circle_members')
            ->join('users', 'circle_members.user_id', '=', 'users.id')
            ->where('circle_members.circle_id', $circle->id)
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

        $this->info("API Query returned " . $members->count() . " members:");
        foreach ($members as $member) {
            $this->line("- {$member['name']} (ID: {$member['id']}) - {$member['added_at']}");
        }

        $this->line('');
        $this->info('Test completed! You can now test the API endpoint:');
        $this->line("GET /api/circles/{$circle->id}/members");
    }
}
